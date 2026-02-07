-- Create a trigger to automatically set operadora on reports based on user_roles
CREATE OR REPLACE FUNCTION public.set_report_operadora()
RETURNS TRIGGER AS $$
DECLARE
  user_operadora text;
BEGIN
  -- Look up the user's operadora from user_roles
  SELECT operadora INTO user_operadora
  FROM public.user_roles
  WHERE user_id = NEW.user_id
  LIMIT 1;
  
  -- If found, override whatever was passed
  IF user_operadora IS NOT NULL THEN
    NEW.operadora = user_operadora;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply trigger on INSERT (and UPDATE of user_id just in case)
CREATE TRIGGER set_report_operadora_trigger
BEFORE INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.set_report_operadora();