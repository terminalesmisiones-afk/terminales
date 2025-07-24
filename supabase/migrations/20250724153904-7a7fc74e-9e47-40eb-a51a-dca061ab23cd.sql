-- Populate sample data for terminals
INSERT INTO public.terminals (name, city, address, latitude, longitude, phone, is_active, schedules_visible, company_count, image) VALUES 
('Terminal de Ómnibus de Posadas', 'Posadas', 'Av. Quaranta 2750', -27.3676, -55.8961, '(0376) 444-3030', true, true, 5, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop'),
('Terminal de Ómnibus de Oberá', 'Oberá', 'Ruta Nacional 14 y Av. Sarmiento', -27.4854, -55.1167, '(03755) 421-800', true, true, 3, 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop'),
('Terminal de Puerto Iguazú', 'Puerto Iguazú', 'Av. Córdoba 264', -25.5975, -54.5734, '(03757) 423-006', true, true, 4, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'),
('Terminal de Eldorado', 'Eldorado', 'Av. San Martín 1950', -26.4017, -54.6259, '(03751) 421-453', true, true, 2, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop');

-- Add sample schedules for Posadas terminal
INSERT INTO public.schedules (terminal_id, company, destination, departure, arrival, frequency, platform)
SELECT t.id, 'Crucero del Norte', 'Buenos Aires', '08:30', '22:45', 'Diario', 'Plataforma 1'
FROM public.terminals t WHERE t.name = 'Terminal de Ómnibus de Posadas'
UNION ALL
SELECT t.id, 'Tigre Iguazú', 'Puerto Iguazú', '09:15', '11:30', 'Cada 2 horas', 'Plataforma 3'
FROM public.terminals t WHERE t.name = 'Terminal de Ómnibus de Posadas'
UNION ALL
SELECT t.id, 'Expreso Singer', 'Oberá', '10:00', '11:45', 'Cada hora', 'Plataforma 2'
FROM public.terminals t WHERE t.name = 'Terminal de Ómnibus de Posadas';

-- Add sample notifications
INSERT INTO public.notifications (title, message, type) VALUES
('Sistema Actualizado', 'El sistema de terminales ha sido actualizado con nuevas funcionalidades', 'success'),
('Mantenimiento Programado', 'Se realizará mantenimiento el próximo domingo de 02:00 a 04:00', 'warning'),
('Nueva Terminal Agregada', 'Se ha agregado la terminal de Eldorado al sistema', 'info');