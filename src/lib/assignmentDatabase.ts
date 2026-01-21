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
