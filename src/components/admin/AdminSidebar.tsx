
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, MapPin, Users, Search, Image, BarChart3, Route, Truck, Share2, Bell, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Terminales', href: '/admin/terminales', icon: MapPin },
    { name: 'Empresas', href: '/admin/empresas', icon: Truck },
    { name: 'Rutas', href: '/admin/rutas', icon: Route },
    { name: 'Banners', href: '/admin/banners', icon: Image },
    { name: 'Notificaciones', href: '/admin/notificaciones', icon: Bell },
    { name: 'Push Notifications', href: '/admin/push', icon: Send },
    { name: 'Compartir', href: '/admin/compartir', icon: Share2 },
    { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
    { name: 'SEO & Meta', href: '/admin/seo', icon: Search },
    { name: 'Medios', href: '/admin/media', icon: Image },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Mobile view (drawer)
  const MobileSidebar = () => (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold">🚌</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Panel Admin</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </DrawerTitle>
        </DrawerHeader>

        <nav className="px-4 pb-20 overflow-y-auto">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                  }`}
                  onClick={() => onClose()}
                >
                  <Icon className={`mr-3 h-6 w-6 ${
                    isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-primary'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <Link 
              to="/" 
              className="flex items-center px-4 py-3 text-base text-gray-600 hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onClose()}
            >
              <Home className="h-5 w-5 mr-3" />
              Ver sitio web
            </Link>
          </div>
        </nav>
      </DrawerContent>
    </Drawer>
  );

  // Desktop view (fixed sidebar)
  const DesktopSidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">🚌</span>
          </div>
          <span className="ml-2 text-lg font-semibold text-gray-900">Admin Panel</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="mt-6 px-3 pb-20">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                }`}
                onClick={() => onClose()}
              >
                <Icon className={`mr-3 h-5 w-5 ${
                  isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-primary'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <Link 
          to="/" 
          className="flex items-center text-sm text-gray-600 hover:text-primary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Home className="h-4 w-4 mr-2" />
          Ver sitio web
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        </div>
      )}

      {/* Show drawer on mobile, sidebar on desktop */}
      <div className="lg:hidden">
        <MobileSidebar />
      </div>
      <div className="hidden lg:block">
        <DesktopSidebar />
      </div>
    </>
  );
};

export default AdminSidebar;
