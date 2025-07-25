-- Fix role escalation prevention and strengthen RLS policies
-- Drop and recreate the role escalation prevention policy
DROP POLICY IF EXISTS "Prevent role escalation" ON public.user_roles;

-- Create a more comprehensive role escalation prevention policy
CREATE POLICY "Prevent role escalation and self-modification" 
ON public.user_roles 
FOR UPDATE 
USING (
  -- Only admins can modify roles AND they cannot modify their own role
  has_role(auth.uid(), 'admin'::app_role) 
  AND user_id != auth.uid()
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