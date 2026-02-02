-- Create a security definer function to fetch the latest report for a site code
-- This bypasses RLS to allow technicians to access previous inspection data for pre-filling
CREATE OR REPLACE FUNCTION public.get_latest_report_for_prefill(p_site_code text)
RETURNS SETOF reports
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.reports
  WHERE LOWER(site_code) = LOWER(p_site_code)
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_latest_report_for_prefill(text) TO authenticated;