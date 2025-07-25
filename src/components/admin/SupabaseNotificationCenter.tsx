import React from 'react';
import { Bell, X, Check, Trash2, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications';

const SupabaseNotificationCenter = () => {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    deleteNotification,
    clearAllNotifications
  } = useSupabaseNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando notificaciones...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Centro de Notificaciones</h2>
            <p className="text-gray-600">
              Gestiona alertas y comunicaciones del sistema
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="default" className="bg-red-500">
              {unreadCount} nuevas
            </Badge>
          )}
        </div>
        
        {notifications.length > 0 && (
          <Button
            onClick={clearAllNotifications}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar Todo
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{notifications.length}</div>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
            <p className="text-sm text-gray-600">Sin Leer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter(n => n.type === 'success').length}
            </div>
            <p className="text-sm text-gray-600">Éxito</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {notifications.filter(n => n.type === 'warning' || n.type === 'error').length}
            </div>
            <p className="text-sm text-gray-600">Alertas</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Notificaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notificaciones Recientes</CardTitle>
            {notifications.length > 0 && (
              <Button
                onClick={() => notifications.filter(n => !n.isRead).forEach(n => markAsRead(n.id))}
                variant="outline"
                size="sm"
                disabled={unreadCount === 0}
              >
                Marcar Todas como Leídas
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay notificaciones
                  </h3>
                  <p className="text-gray-500">
                    Las nuevas notificaciones aparecerán aquí
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      !notification.isRead 
                        ? getNotificationColor(notification.type)
                        : 'bg-gray-50 border-gray-200'
                    } ${!notification.isRead ? 'border-l-4' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <Badge variant="default" className="text-xs bg-blue-500">
                                Nuevo
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-4">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                await markAsRead(notification.id);
                              } catch (error) {
                                console.error('Error marking notification as read:', error);
                              }
                            }}
                            className="h-8 w-8 p-0 hover:bg-green-50"
                            title="Marcar como leída"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await deleteNotification(notification.id);
                            } catch (error) {
                              console.error('Error deleting notification:', error);
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Eliminar notificación"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseNotificationCenter;