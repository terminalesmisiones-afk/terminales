
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import SupabaseNotificationModal from './SupabaseNotificationModal';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const { notifications, unreadCount } = useNotificationStore();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      // Redirect to login page
      navigate('/admin/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const openWebsite = () => {
    window.open('/', '_blank');
  };

  return (
    <>
      {/* Banner de Anuncio Superior */}
      {showAnnouncement && (
        <div className="bg-gradient-to-r from-primary to-primary-600 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <span>🎉 ¡Nuevo sistema de gestión de terminales disponible! Administra horarios, ubicaciones y mucho más.</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnnouncement(false)}
              className="text-white hover:bg-white/20 ml-4"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm border-b lg:pl-64">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 ml-2 lg:ml-0">
              Panel de Administración
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Botón Ver Sitio Web */}
            <Button
              variant="outline"
              size="sm"
              onClick={openWebsite}
              className="hidden sm:flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Sitio Web
            </Button>

            {/* Notificaciones */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(true)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Menu de Usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                    A
                  </div>
                  <span className="hidden sm:block text-sm font-medium">Administrador</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <SupabaseNotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

export default AdminHeader;
