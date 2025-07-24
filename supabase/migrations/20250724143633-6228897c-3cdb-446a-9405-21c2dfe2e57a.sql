-- Create terminals table
CREATE TABLE public.terminals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  image TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  municipality_info TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_active BOOLEAN NOT NULL DEFAULT true,
  schedules_visible BOOLEAN NOT NULL DEFAULT true,
  company_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedules table
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  terminal_id UUID NOT NULL REFERENCES public.terminals(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure TEXT NOT NULL,
  arrival TEXT NOT NULL,
  frequency TEXT NOT NULL,
  platform TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (public read access for now, will be updated with auth later)
CREATE POLICY "Allow public read access on terminals" ON public.terminals FOR SELECT USING (true);
CREATE POLICY "Allow public read access on schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Allow public read access on notifications" ON public.notifications FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_terminals_updated_at
  BEFORE UPDATE ON public.terminals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_schedules_terminal_id ON public.schedules(terminal_id);
CREATE INDEX idx_terminals_city ON public.terminals(city);
CREATE INDEX idx_terminals_active ON public.terminals(is_active);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('terminal-images', 'terminal-images', true);

-- Create storage policies for terminal images
CREATE POLICY "Public can view terminal images" ON storage.objects FOR SELECT USING (bucket_id = 'terminal-images');
CREATE POLICY "Public can upload terminal images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'terminal-images');
CREATE POLICY "Public can update terminal images" ON storage.objects FOR UPDATE USING (bucket_id = 'terminal-images');
CREATE POLICY "Public can delete terminal images" ON storage.objects FOR DELETE USING (bucket_id = 'terminal-images');