-- Update the handle_new_user function to auto-approve first user as gestor
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  -- If this is the first user, make them an approved gestor
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role, approved, approved_at)
    VALUES (NEW.id, 'gestor', true, now());
  ELSE
    -- Otherwise, create as unapproved tecnico
    INSERT INTO public.user_roles (user_id, role, approved)
    VALUES (NEW.id, 'tecnico', false);
  END IF;
  
  RETURN NEW;
END;
$$;