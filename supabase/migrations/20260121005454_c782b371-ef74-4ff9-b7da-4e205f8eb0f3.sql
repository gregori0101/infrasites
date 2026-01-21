-- Update the handle_new_user function - first user becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role, approved, approved_at)
    VALUES (NEW.id, 'administrador', true, now());
  ELSE
    INSERT INTO public.user_roles (user_id, role, approved)
    VALUES (NEW.id, 'tecnico', false);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'administrador'
      AND approved = true
  )
$$;

-- Drop old policies
DROP POLICY IF EXISTS "Gestors can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Gestors can view all roles" ON public.user_roles;

-- Create new policies for user_roles - only admins can manage users
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Update reports policies to include administrador
DROP POLICY IF EXISTS "Users can view reports based on role" ON public.reports;
DROP POLICY IF EXISTS "Users can update reports based on role" ON public.reports;

CREATE POLICY "Users can view reports based on role"
ON public.reports
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'administrador'::app_role) OR
  has_role(auth.uid(), 'gestor'::app_role) OR
  (user_id = auth.uid())
);

CREATE POLICY "Users can update reports based on role"
ON public.reports
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'administrador'::app_role) OR
  has_role(auth.uid(), 'gestor'::app_role) OR
  (user_id = auth.uid())
);