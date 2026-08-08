-- Disable triggers that enforce operadora ownership
DROP TRIGGER IF EXISTS set_report_operadora_trigger ON public.reports;
DROP TRIGGER IF EXISTS set_vandalismo_operadora_trigger ON public.vandalismo_vistorias;

-- Update RLS policies to allow global access for authenticated users
-- Reports table
DROP POLICY IF EXISTS "Users can view reports based on role" ON public.reports;
CREATE POLICY "Users can view all reports" ON public.reports
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update reports based on role" ON public.reports;
CREATE POLICY "Users can update all reports" ON public.reports
    FOR UPDATE TO authenticated USING (true);

-- Vandalismo Vistorias table
DROP POLICY IF EXISTS "vv_select" ON public.vandalismo_vistorias;
CREATE POLICY "vv_select_all" ON public.vandalismo_vistorias
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "vv_update" ON public.vandalismo_vistorias;
CREATE POLICY "vv_update_all" ON public.vandalismo_vistorias
    FOR UPDATE TO authenticated USING (true);

-- Vandalismo Itens table
DROP POLICY IF EXISTS "vi_all" ON public.vandalismo_itens;
CREATE POLICY "vi_select_all" ON public.vandalismo_itens
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "vi_update_all" ON public.vandalismo_itens
    FOR UPDATE TO authenticated USING (true);