-- Create a trigger to automatically make the first user an admin
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is the first user and no admins exist yet
  IF NOT EXISTS (SELECT 1 FROM public.admin_users LIMIT 1) THEN
    INSERT INTO public.admin_users (user_id, role, permissions)
    VALUES (NEW.id, 'super_admin', '["read", "write", "delete", "manage_users", "manage_projects"]'::jsonb);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_first_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.make_first_user_admin();