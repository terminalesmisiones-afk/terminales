
import React, { useState } from 'react';
import { Send, Bell, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: number;
  title: string;
  message: string;
  sentAt: string;
  recipients: number;
  status: 'sent' | 'pending' | 'failed';
}

const PushNotificationManager = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Actualización de Horarios',
      message: 'Se han actualizado los horarios de la Terminal de Posadas',
      sentAt: '2024-06-28 15:30',
      recipients: 1250,
      status: 'sent'
    }
  ]);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    url: '',
    icon: '/favicon.ico',
    targetSegment: 'all'
  });

  const [subscriberCount, setSubscriberCount] = useState(1580); // Mock data
  const [isLoading, setIsLoading] = useState(false);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate sending push notification
      const notificationPayload = {
        title: newNotification.title,
        body: newNotification.message,
        icon: newNotification.icon,
        url: newNotification.url || '/',
        data: {
          timestamp: Date.now(),
          segment: newNotification.targetSegment
        }
      };

      // In production, send to push service
      console.log('Sending push notification:', notificationPayload);
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      const notification: Notification = {
        id: Date.now(),
        title: newNotification.title,
        message: newNotification.message,
        sentAt: new Date().toLocaleString('es-AR'),
        recipients: subscriberCount,
        status: 'sent'
      };

      setNotifications(prev => [notification, ...prev]);
      setNewNotification({ 
        title: '', 
        message: '', 
        url: '', 
        icon: '/favicon.ico',
        targetSegment: 'all'
      });
      
      alert('Notificación enviada exitosamente');
    } catch (error) {
      alert('Error al enviar la notificación');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500">Enviada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallida</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Push Notifications</h2>
          <p className="text-gray-600">Envía notificaciones push a usuarios de la app</p>
        </div>
        <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
          <Users className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-blue-800 font-semibold">{subscriberCount} suscriptores</span>
        </div>
      </div>

      {/* Formulario para nueva notificación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="h-5 w-5 mr-2" />
            Enviar Nueva Notificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <Label htmlFor="title">Título de la Notificación</Label>
              <Input
                id="title"
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Nuevos horarios disponibles"
                maxLength={50}
                required
              />
              <p className="text-sm text-gray-500 mt-1">Máximo 50 caracteres</p>
            </div>
            
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Escribe el mensaje que verán los usuarios..."
                rows={3}
                maxLength={200}
                required
              />
              <p className="text-sm text-gray-500 mt-1">Máximo 200 caracteres</p>
            </div>
            
            <div>
              <Label htmlFor="url">URL de Redirección (opcional)</Label>
              <Input
                id="url"
                value={newNotification.url}
                onChange={(e) => setNewNotification(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://ejemplo.com o /terminal/posadas"
              />
              <p className="text-sm text-gray-500 mt-1">A dónde ir cuando hagan clic en la notificación</p>
            </div>
            
            <div>
              <Label htmlFor="icon">Ícono</Label>
              <div className="flex gap-2">
                <Input
                  id="icon"
                  value={newNotification.icon}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="/favicon.ico"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        try {
                          const { supabase } = await import('@/integrations/supabase/client');
                          
                          const fileName = `notification-icon-${Date.now()}-${file.name}`;
                          const { data, error } = await supabase.storage
                            .from('terminal-images')
                            .upload(fileName, file);

                          if (error) throw error;

                          const { data: { publicUrl } } = supabase.storage
                            .from('terminal-images')
                            .getPublicUrl(fileName);

                          setNewNotification(prev => ({ ...prev, icon: publicUrl }));
                        } catch (error) {
                          console.error('Error uploading icon:', error);
                          alert('Error al subir el ícono');
                        }
                      }
                    };
                    input.click();
                  }}
                >
                  Subir
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="targetSegment">Segmento de Usuarios</Label>
              <select
                id="targetSegment"
                value={newNotification.targetSegment}
                onChange={(e) => {
                  setNewNotification(prev => ({ ...prev, targetSegment: e.target.value }));
                  // Actualizar contador dinámico basado en segmento
                  switch (e.target.value) {
                    case 'all':
                      setSubscriberCount(1580);
                      break;
                    case 'active':
                      setSubscriberCount(1205);
                      break;
                    case 'admin':
                      setSubscriberCount(5);
                      break;
                    default:
                      setSubscriberCount(1580);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos los usuarios</option>
                <option value="active">Usuarios activos</option>
                <option value="admin">Solo administradores</option>
              </select>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary hover:bg-primary-600"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar a {subscriberCount} usuarios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Historial de notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Historial de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  {getStatusBadge(notification.status)}
                </div>
                <p className="text-gray-700 mb-3">{notification.message}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Enviada a {notification.recipients} usuarios</span>
                  <span>{notification.sentAt}</span>
                </div>
              </div>
            ))}
            
            {notifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay notificaciones enviadas aún</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PushNotificationManager;
