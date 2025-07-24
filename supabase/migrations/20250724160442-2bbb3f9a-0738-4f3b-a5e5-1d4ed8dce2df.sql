-- Insert a default admin user for testing (this will be created when someone signs up with this email)
-- The trigger will automatically create the profile and assign user role
-- We'll update the role to admin after signup

-- Create a function to promote user to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user by email
  SELECT au.id INTO user_record 
  FROM auth.users au 
  WHERE au.email = user_email;
  
  IF user_record.id IS NOT NULL THEN
    -- Update profile role
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE id = user_record.id;
    
    -- Add admin role to user_roles (if not exists)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_record.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;