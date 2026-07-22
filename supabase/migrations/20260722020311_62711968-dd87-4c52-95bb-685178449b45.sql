
CREATE INDEX IF NOT EXISTS idx_reports_created_at_desc ON public.reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_site_code ON public.reports (site_code);
CREATE INDEX IF NOT EXISTS idx_reports_operadora ON public.reports (operadora);
CREATE INDEX IF NOT EXISTS idx_sites_site_code ON public.sites (site_code);
CREATE INDEX IF NOT EXISTS idx_site_assignments_site_id ON public.site_assignments (site_id);
ANALYZE public.reports;
ANALYZE public.sites;
ANALYZE public.site_assignments;
