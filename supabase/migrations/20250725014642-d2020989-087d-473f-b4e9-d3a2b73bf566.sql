-- Add RLS policies for file upload security
CREATE POLICY "Admins can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'terminal-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can delete images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'terminal-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Prevent role escalation - users cannot modify their own roles
CREATE POLICY "Prevent role escalation" 
ON public.user_roles 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND user_id != auth.uid()
);