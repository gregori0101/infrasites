-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('gestor', 'tecnico');

-- Create user_roles table (separate from auth for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'tecnico',
    approved BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND approved = true
  )
$$;

-- Function to check if user is approved
CREATE OR REPLACE FUNCTION public.is_approved(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND approved = true
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles table

-- Users can view their own role
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Gestors can view all roles
CREATE POLICY "Gestors can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'gestor'));

-- Gestors can update roles (approve/change)
CREATE POLICY "Gestors can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'gestor'));

-- Auto-create role on signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, approved)
  VALUES (NEW.id, 'tecnico', false);
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id to reports table for ownership
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update RLS policies on reports table

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public insert" ON public.reports;
DROP POLICY IF EXISTS "Allow public select" ON public.reports;
DROP POLICY IF EXISTS "Allow public update" ON public.reports;

-- Approved users can insert their own reports
CREATE POLICY "Approved users can insert reports"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_approved(auth.uid()) 
  AND user_id = auth.uid()
);

-- Gestors can view all reports, technicians only their own
CREATE POLICY "Users can view reports based on role"
ON public.reports
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'gestor')
  OR user_id = auth.uid()
);

-- Gestors can update all, technicians only their own
CREATE POLICY "Users can update reports based on role"
ON public.reports
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'gestor')
  OR user_id = auth.uid()
);