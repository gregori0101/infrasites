import { supabase } from "@/integrations/supabase/client";

export interface AuditOrder {
  id: string;
  os_number: string;
  site_code: string;
  motivo: string;
  technician_id: string;
  created_by: string;
  status: string;
  deadline: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AuditOrderItem {
  id: string;
  order_id: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  quantidade_auditada: number | null;
  status: string;
  observacao: string | null;
  foto_url: string | null;
  audited_at: string | null;
  created_at: string;
}

export interface NewAuditOrderItem {
  descricao: string;
  unidade: string;
  quantidade: number;
}

// ---- Orders ----

export async function fetchAuditOrders() {
  const { data, error } = await supabase
    .from('audit_orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as AuditOrder[];
}

export async function createAuditOrder(
  order: { os_number: string; site_code: string; motivo: string; technician_id: string; deadline?: string; notes?: string },
  items: NewAuditOrderItem[]
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data: orderData, error: orderError } = await supabase
    .from('audit_orders')
    .insert({
      os_number: order.os_number,
      site_code: order.site_code.toUpperCase(),
      motivo: order.motivo,
      technician_id: order.technician_id,
      created_by: user.id,
      deadline: order.deadline || null,
      notes: order.notes || null,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  if (items.length > 0) {
    const itemsToInsert = items.map(item => ({
      order_id: orderData.id,
      descricao: item.descricao,
      unidade: item.unidade,
      quantidade: item.quantidade,
    }));

    const { error: itemsError } = await supabase
      .from('audit_order_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;
  }

  return orderData as AuditOrder;
}

export async function updateAuditOrderStatus(orderId: string, status: string) {
  const update: Record<string, unknown> = { status };
  if (status === 'concluido') update.completed_at = new Date().toISOString();

  const { error } = await supabase
    .from('audit_orders')
    .update(update)
    .eq('id', orderId);
  if (error) throw error;
}

// ---- Items ----

export async function fetchAuditOrderItems(orderId: string) {
  const { data, error } = await supabase
    .from('audit_order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as AuditOrderItem[];
}

export async function updateAuditItem(
  itemId: string,
  update: { quantidade_auditada?: number; status?: string; observacao?: string; foto_url?: string }
) {
  const payload: Record<string, unknown> = { ...update };
  if (update.status && update.status !== 'pendente') {
    payload.audited_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('audit_order_items')
    .update(payload)
    .eq('id', itemId);
  if (error) throw error;
}

// ---- Reassign / Return ----

export async function reassignAuditOrder(orderId: string, newTechnicianId: string, resetItems: boolean = true) {
  // Update order: change technician, reset status
  const { error: orderError } = await supabase
    .from('audit_orders')
    .update({
      technician_id: newTechnicianId,
      status: 'pendente',
      completed_at: null,
    })
    .eq('id', orderId);
  if (orderError) throw orderError;

  if (resetItems) {
    // Reset all items to pendente
    const { error: itemsError } = await supabase
      .from('audit_order_items')
      .update({
        status: 'pendente',
        quantidade_auditada: null,
        observacao: null,
        foto_url: null,
        audited_at: null,
      })
      .eq('order_id', orderId);
    if (itemsError) throw itemsError;
  }
}

// ---- Duplicate ----

export async function duplicateAuditOrder(orderId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Fetch original order
  const { data: original, error: fetchErr } = await supabase
    .from('audit_orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (fetchErr) throw fetchErr;

  // Create duplicate order
  const { data: newOrder, error: orderErr } = await supabase
    .from('audit_orders')
    .insert({
      os_number: `${original.os_number}-COPIA`,
      site_code: original.site_code,
      motivo: original.motivo,
      technician_id: original.technician_id,
      created_by: user.id,
      deadline: original.deadline,
      notes: original.notes,
    })
    .select()
    .single();
  if (orderErr) throw orderErr;

  // Fetch and duplicate items
  const { data: items, error: itemsFetchErr } = await supabase
    .from('audit_order_items')
    .select('*')
    .eq('order_id', orderId);
  if (itemsFetchErr) throw itemsFetchErr;

  if (items && items.length > 0) {
    const newItems = items.map(item => ({
      order_id: newOrder.id,
      descricao: item.descricao,
      unidade: item.unidade,
      quantidade: item.quantidade,
    }));
    const { error: insertErr } = await supabase
      .from('audit_order_items')
      .insert(newItems);
    if (insertErr) throw insertErr;
  }

  return newOrder as AuditOrder;
}

// ---- Delete ----

export async function deleteAuditOrder(orderId: string) {
  // Delete items first (cascade should handle, but explicit is safer)
  const { error: itemsError } = await supabase
    .from('audit_order_items')
    .delete()
    .eq('order_id', orderId);
  if (itemsError) throw itemsError;

  const { error } = await supabase
    .from('audit_orders')
    .delete()
    .eq('id', orderId);
  if (error) throw error;
}

// ---- Update order fields ----

export async function updateAuditOrder(
  orderId: string,
  update: { os_number?: string; site_code?: string; motivo?: string; deadline?: string | null; notes?: string | null }
) {
  const payload: Record<string, unknown> = {};
  if (update.os_number !== undefined) payload.os_number = update.os_number;
  if (update.site_code !== undefined) payload.site_code = update.site_code.toUpperCase();
  if (update.motivo !== undefined) payload.motivo = update.motivo;
  if (update.deadline !== undefined) payload.deadline = update.deadline || null;
  if (update.notes !== undefined) payload.notes = update.notes || null;

  const { error } = await supabase
    .from('audit_orders')
    .update(payload)
    .eq('id', orderId);
  if (error) throw error;
}

// ---- Technicians list (for assignment) ----

export async function fetchApprovedTechnicians() {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, role, area_atuacao')
    .eq('role', 'tecnico')
    .eq('approved', true);
  if (error) throw error;
  return data;
}
