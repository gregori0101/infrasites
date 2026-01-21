-- Create enum for assignment status
CREATE TYPE public.assignment_status AS ENUM ('pendente', 'em_andamento', 'concluido', 'atrasado');

-- Create sites master table
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_code TEXT NOT NULL UNIQUE,
  uf TEXT NOT NULL,
  tipo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create site assignments table
CREATE TABLE public.site_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  deadline DATE NOT NULL,
  status assignment_status NOT NULL DEFAULT 'pendente',
  completed_at TIMESTAMP WITH TIME ZONE,
  report_id UUID REFERENCES public.reports(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sites table
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- Enable RLS on site_assignments table
ALTER TABLE public.site_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sites table
-- Admins can do everything
CREATE POLICY "Admins can manage sites"
ON public.sites
FOR ALL
USING (has_role(auth.uid(), 'administrador'));

-- Gestors can view sites
CREATE POLICY "Gestors can view sites"
ON public.sites
FOR SELECT
USING (has_role(auth.uid(), 'gestor'));

-- Technicians can view sites
CREATE POLICY "Technicians can view sites"
ON public.sites
FOR SELECT
USING (has_role(auth.uid(), 'tecnico') AND is_approved(auth.uid()));

-- RLS Policies for site_assignments table
-- Admins can do everything
CREATE POLICY "Admins can manage assignments"
ON public.site_assignments
FOR ALL
USING (has_role(auth.uid(), 'administrador'));

-- Gestors can manage assignments
CREATE POLICY "Gestors can manage assignments"
ON public.site_assignments
FOR ALL
USING (has_role(auth.uid(), 'gestor'));

-- Technicians can view their own assignments
CREATE POLICY "Technicians can view own assignments"
ON public.site_assignments
FOR SELECT
USING (technician_id = auth.uid());

-- Technicians can update their own assignments (status only)
CREATE POLICY "Technicians can update own assignments"
ON public.site_assignments
FOR UPDATE
USING (technician_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_site_assignment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for updated_at
CREATE TRIGGER update_site_assignments_updated_at
BEFORE UPDATE ON public.site_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_site_assignment_updated_at();

-- Create indexes for performance
CREATE INDEX idx_site_assignments_technician ON public.site_assignments(technician_id);
CREATE INDEX idx_site_assignments_status ON public.site_assignments(status);
CREATE INDEX idx_site_assignments_deadline ON public.site_assignments(deadline);
CREATE INDEX idx_sites_uf ON public.sites(uf);
CREATE INDEX idx_sites_site_code ON public.sites(site_code);