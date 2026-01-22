import { supabase } from "@/integrations/supabase/client";

export type AssignmentStatus = 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';
export type AssignmentStatusDB = 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';

export interface SiteAssignment {
  id: string;
  site_id: string;
  technician_id: string;
  assigned_by: string;
  deadline: string;
  status: AssignmentStatus;
  completed_at: string | null;
  report_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  site?: {
    site_code: string;
    uf: string;
    tipo: string;
  };
  technician?: {
    email: string;
  };
}

export interface AssignmentInsert {
  site_id: string;
  technician_id: string;
  deadline: string;
}

export async function fetchAssignments(): Promise<SiteAssignment[]> {
  const { data, error } = await supabase
    .from('site_assignments')
    .select(`
      *,
      site:sites(site_code, uf, tipo)
    `)
    .order('deadline', { ascending: true });

  if (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }

  return (data || []) as unknown as SiteAssignment[];
}

export async function fetchTechnicianAssignments(technicianId: string): Promise<SiteAssignment[]> {
  const { data, error } = await supabase
    .from('site_assignments')
    .select(`
      *,
      site:sites(site_code, uf, tipo)
    `)
    .eq('technician_id', technicianId)
    .order('deadline', { ascending: true });

  if (error) {
    console.error('Error fetching technician assignments:', error);
    throw error;
  }

  return (data || []) as unknown as SiteAssignment[];
}

export async function createAssignment(assignment: AssignmentInsert): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('site_assignments')
    .insert({
      site_id: assignment.site_id,
      technician_id: assignment.technician_id,
      assigned_by: user.user.id,
      deadline: assignment.deadline,
      status: 'pendente'
    });

  if (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
}

export async function updateAssignmentStatus(
  assignmentId: string, 
  status: AssignmentStatus,
  reportId?: string
): Promise<void> {
  const updates: Record<string, unknown> = { status };
  
  if (status === 'concluido') {
    updates.completed_at = new Date().toISOString();
  }
  
  if (reportId) {
    updates.report_id = reportId;
  }

  const { error } = await supabase
    .from('site_assignments')
    .update(updates)
    .eq('id', assignmentId);

  if (error) {
    console.error('Error updating assignment status:', error);
    throw error;
  }
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
  const { error } = await supabase
    .from('site_assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
}

export async function fetchTechnicians(): Promise<{ id: string; email: string }[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.access_token) {
      throw new Error('No session');
    }

    const response = await supabase.functions.invoke('get-technician-emails', {
      headers: {
        Authorization: `Bearer ${session.session.access_token}`
      }
    });

    if (response.error) {
      throw response.error;
    }

    return response.data?.technicians || [];
  } catch (error) {
    console.error('Error fetching technicians:', error);
    // Fallback to basic query if edge function fails
    const { data } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'tecnico')
      .eq('approved', true);
    
    return (data || []).map(r => ({ id: r.user_id, email: r.user_id.substring(0, 8) + '...' }));
  }
}

export async function getAllSites(): Promise<{ id: string; site_code: string; uf: string; tipo: string }[]> {
  // Supabase has a default limit of 1000 rows per query; fetch all via pagination.
  const allSites: { id: string; site_code: string; uf: string; tipo: string }[] = [];
  const pageSize = 1000;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('sites')
      .select('id, site_code, uf, tipo')
      .order('site_code', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }

    if (data && data.length > 0) {
      allSites.push(...data);
      from += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  return allSites;
}

/**
 * Clears the report link from assignments that reference a given report.
 * Useful when deleting a report to avoid broken references.
 */
export async function clearReportLinkFromAssignments(reportId: string): Promise<void> {
  const { error } = await supabase
    .from('site_assignments')
    .update({ report_id: null })
    .eq('report_id', reportId);

  if (error) {
    console.error('Error clearing report link from assignments:', error);
    throw new Error(`Erro ao limpar vínculo de atribuições: ${error.message}`);
  }
}

export interface AssignmentStatsByUf {
  uf: string;
  totalSites: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  semAtribuicao: number;
}

export interface AssignmentDashboardStats {
  byUf: AssignmentStatsByUf[];
  totalPendente: number;
  totalEmAndamento: number;
  totalConcluido: number;
}

/**
 * Fetches assignment statistics grouped by UF for the productivity dashboard.
 * Cross-references sites with their assignments to show completion status by region.
 * Concluídas are now counted from actual reports using first 2 chars of site_code as UF.
 */
export async function fetchAssignmentStatsForDashboard(): Promise<AssignmentDashboardStats> {
  // Fetch all sites
  const sites = await getAllSites();
  
  // Fetch all assignments
  const { data: assignments, error } = await supabase
    .from('site_assignments')
    .select('site_id, status');
  
  if (error) {
    console.error('Error fetching assignments for dashboard:', error);
    throw error;
  }

  // Fetch completed reports to count concluídas by UF from site_code
  const { data: reports, error: reportsError } = await supabase
    .from('reports')
    .select('site_code');
  
  if (reportsError) {
    console.error('Error fetching reports for dashboard:', reportsError);
    throw reportsError;
  }

  // Count completed reports by UF (first 2 chars of site_code)
  const reportsByUf = new Map<string, number>();
  (reports || []).forEach(r => {
    if (r.site_code && r.site_code.length >= 2) {
      const uf = r.site_code.substring(0, 2).toUpperCase();
      reportsByUf.set(uf, (reportsByUf.get(uf) || 0) + 1);
    }
  });

  // Create a map of site_id to assignment status
  const assignmentMap = new Map<string, AssignmentStatus>();
  (assignments || []).forEach(a => {
    // If a site has multiple assignments, prioritize: concluido > em_andamento > pendente
    const current = assignmentMap.get(a.site_id);
    if (!current) {
      assignmentMap.set(a.site_id, a.status as AssignmentStatus);
    } else if (a.status === 'concluido') {
      assignmentMap.set(a.site_id, 'concluido');
    } else if (a.status === 'em_andamento' && current !== 'concluido') {
      assignmentMap.set(a.site_id, 'em_andamento');
    }
  });

  // Group by UF
  const ufMap = new Map<string, AssignmentStatsByUf>();
  
  let totalPendente = 0;
  let totalEmAndamento = 0;
  let totalConcluido = 0;

  sites.forEach(site => {
    const uf = site.uf || 'N/A';
    
    if (!ufMap.has(uf)) {
      ufMap.set(uf, {
        uf,
        totalSites: 0,
        pendentes: 0,
        emAndamento: 0,
        concluidas: 0,
        semAtribuicao: 0
      });
    }
    
    const stats = ufMap.get(uf)!;
    stats.totalSites++;
    
    const status = assignmentMap.get(site.id);
    if (!status) {
      stats.semAtribuicao++;
    } else if (status === 'pendente' || status === 'atrasado') {
      stats.pendentes++;
      totalPendente++;
    } else if (status === 'em_andamento') {
      stats.emAndamento++;
      totalEmAndamento++;
    } else if (status === 'concluido') {
      totalConcluido++;
    }
  });

  // Now update concluídas from actual reports count by UF
  ufMap.forEach((stats, uf) => {
    stats.concluidas = reportsByUf.get(uf) || 0;
  });

  // Also add UFs that appear in reports but not in sites
  reportsByUf.forEach((count, uf) => {
    if (!ufMap.has(uf)) {
      ufMap.set(uf, {
        uf,
        totalSites: 0,
        pendentes: 0,
        emAndamento: 0,
        concluidas: count,
        semAtribuicao: 0
      });
    }
  });

  // Convert to array and sort by total sites
  const byUf = Array.from(ufMap.values()).sort((a, b) => b.totalSites - a.totalSites);

  // Recalculate totalConcluido from reports
  const totalConcluidoFromReports = Array.from(reportsByUf.values()).reduce((a, b) => a + b, 0);

  return {
    byUf,
    totalPendente,
    totalEmAndamento,
    totalConcluido: totalConcluidoFromReports
  };
}
