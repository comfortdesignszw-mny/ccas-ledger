-- Fix 1: Restrict user_roles visibility - users can only see their own role, admins can see all
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

CREATE POLICY "Users can view own role or admin can view all"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 2: Restrict profiles visibility - users can view own profile, admins can view all (for user management)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile or admin can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 3: Add database constraint on full_name for defense-in-depth
ALTER TABLE public.profiles
ADD CONSTRAINT full_name_length CHECK (char_length(full_name) BETWEEN 2 AND 100);