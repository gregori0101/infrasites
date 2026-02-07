CREATE OR REPLACE FUNCTION public.set_report_operadora()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_operadora text;
BEGIN
  -- Only set operadora on INSERT (new reports)
  -- On UPDATE, preserve the original operadora so editing doesn't change ownership
  IF TG_OP = 'INSERT' THEN
    SELECT operadora INTO user_operadora
    FROM public.user_roles
    WHERE user_id = NEW.user_id
    LIMIT 1;
    
    IF user_operadora IS NOT NULL THEN
      NEW.operadora = user_operadora;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;