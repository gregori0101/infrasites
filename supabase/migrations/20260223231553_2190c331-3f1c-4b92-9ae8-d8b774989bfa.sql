
-- Tabela de ordens de servico para auditoria
CREATE TABLE public.audit_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  os_number text NOT NULL,
  site_code text NOT NULL,
  motivo text NOT NULL,
  technician_id uuid NOT NULL,
  created_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  deadline date,
  notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de itens da OS
CREATE TABLE public.audit_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.audit_orders(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  unidade text NOT NULL DEFAULT '',
  quantidade numeric NOT NULL DEFAULT 0,
  quantidade_auditada numeric,
  status text NOT NULL DEFAULT 'pendente',
  observacao text,
  foto_url text,
  audited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.audit_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_order_items ENABLE ROW LEVEL SECURITY;

-- Policies para audit_orders
CREATE POLICY "Gestors and admins can manage audit orders"
  ON public.audit_orders FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'gestor'));

CREATE POLICY "Technicians can view own audit orders"
  ON public.audit_orders FOR SELECT
  TO authenticated
  USING (technician_id = auth.uid());

CREATE POLICY "Technicians can update own audit orders"
  ON public.audit_orders FOR UPDATE
  TO authenticated
  USING (technician_id = auth.uid());

-- Policies para audit_order_items
CREATE POLICY "Gestors and admins can manage audit items"
  ON public.audit_order_items FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.audit_orders
    WHERE id = audit_order_items.order_id
    AND (has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'gestor'))
  ));

CREATE POLICY "Technicians can view own audit items"
  ON public.audit_order_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.audit_orders
    WHERE id = audit_order_items.order_id
    AND technician_id = auth.uid()
  ));

CREATE POLICY "Technicians can update own audit items"
  ON public.audit_order_items FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.audit_orders
    WHERE id = audit_order_items.order_id
    AND technician_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_audit_orders_technician ON public.audit_orders(technician_id);
CREATE INDEX idx_audit_orders_status ON public.audit_orders(status);
CREATE INDEX idx_audit_order_items_order ON public.audit_order_items(order_id);
