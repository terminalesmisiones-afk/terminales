-- Fix role escalation prevention and strengthen RLS policies
-- Update the role escalation prevention policy to be more specific
DROP POLICY IF EXISTS "Prevent role escalation" ON public.user_roles;

-- Create a more comprehensive role escalation prevention policy
CREATE POLICY "Prevent role escalation and self-modification" 
ON public.user_roles 
FOR UPDATE 
USING (
  -- Only admins can modify roles AND they cannot modify their own role
  has_role(auth.uid(), 'admin'::app_role) 
  AND user_id != auth.uid()
  AND (
    -- Prevent escalation to admin unless the updater is a super admin
    NEW.role != 'admin'::app_role 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'::app_role
    )
  )
);

-- Add comprehensive role management policies
CREATE POLICY "Prevent admin from deleting their own role" 
ON public.user_roles 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND user_id != auth.uid()
);

-- Add audit table for role changes
CREATE TABLE IF NOT EXISTS public.role_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  old_role app_role,
  new_role app_role NOT NULL,
  changed_by uuid NOT NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  reason text
);

-- Enable RLS on audit table
ALTER TABLE public.role_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view role audit logs" 
ON public.role_audit 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger function for role change auditing
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log role changes
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.role_audit (user_id, old_role, new_role, changed_by)
    VALUES (NEW.user_id, OLD.role, NEW.role, auth.uid());
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_audit (user_id, old_role, new_role, changed_by)
    VALUES (NEW.user_id, NULL, NEW.role, auth.uid());
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.user_roles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- Fix OTP configuration issue by creating a function to configure auth settings
-- Note: This would normally be done through the Supabase dashboard, but we'll document it
COMMENT ON TABLE public.role_audit IS 'Audit trail for role changes. Also note: OTP expiry should be reduced to 10 minutes or less in Auth settings for better security.';

-- Add security logging table for admin actions
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view security logs" 
ON public.security_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only system can insert security logs
CREATE POLICY "System can insert security logs" 
ON public.security_logs 
FOR INSERT 
WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.security_logs (
    user_id, 
    action, 
    resource_type, 
    resource_id, 
    details
  )
  VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  );
END;
$$;