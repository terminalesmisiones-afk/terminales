
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, MapPin, Users, Search, Image, BarChart3, Route, Truck, Share2, Bell, Send, FileText, CreditCard, UserCheck, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  // Get user from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  // Fetch pending registrations count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`/api/admin/registrations?t=${new Date().getTime()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          const pending = data.filter((r: any) => r.status === 'pending').length;
          setPendingCount(pending);
        }
      } catch (error) {
        console.error('Error fetching pending registrations:', error);
      }
    };

    fetchPendingCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch unread support messages count
  useEffect(() => {
    const fetchUnreadSupport = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Only fetch for admins
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.role !== 'admin') return;

        const res = await fetch(`/api/support/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const conversations = await res.json();
          // Sum up unread_count from all conversations
          const totalUnread = conversations.reduce((sum: number, conv: any) => sum + (conv.unread_count || 0), 0);
          setUnreadSupportCount(totalUnread);
        }
      } catch (error) {
        console.error('Error fetching unread support messages:', error);
      }
    };

    fetchUnreadSupport();
    // Refresh every 15 seconds
    const interval = setInterval(fetchUnreadSupport, 15000);
    return () => clearInterval(interval);
  }, []);

  const allNavigation = [
    { name: 'Dashboard', href: '/admin', icon: Home, roles: ['admin', 'user'] },
    { name: 'Terminales', href: '/admin/terminales', icon: MapPin, roles: ['admin'] },
    { name: 'Empresas', href: '/admin/empresas', icon: Truck, roles: ['admin'] },
    { name: 'Rutas', href: '/admin/rutas', icon: Route, roles: ['admin'] },
    { name: 'Páginas (CMS)', href: '/admin/paginas', icon: FileText, roles: ['admin'] },
    { name: 'Banners', href: '/admin/banners', icon: Image, roles: ['admin'] },
    { name: 'Notificaciones', href: '/admin/notificaciones', icon: Bell, roles: ['admin', 'user'] },
    { name: 'Push Notifications', href: '/admin/push', icon: Send, roles: ['admin'] },
    { name: 'Compartir', href: '/admin/compartir', icon: Share2, roles: ['admin'] },
    { name: 'Usuarios', href: '/admin/usuarios', icon: Users, roles: ['admin'] },
    { name: 'Registros Pendientes', href: '/admin/registros', icon: UserCheck, badge: pendingCount, roles: ['admin'] },
    { name: 'Soporte', href: '/admin/soporte', icon: MessageCircle, badge: unreadSupportCount, roles: ['admin'] },
    { name: 'SEO & Meta', href: '/admin/seo', icon: Search, roles: ['admin'] },
    { name: 'Medios', href: '/admin/media', icon: Image, roles: ['admin'] },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, roles: ['admin'] },
    { name: 'Pagos / Monetización', href: '/admin/pagos', icon: CreditCard, roles: ['admin'] },
  ];

  // Filter navigation based on user role
  const navigation = allNavigation.filter(item =>
    !item.roles || item.roles.includes(user?.role || 'user')
  );

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
                  className={`group flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors ${isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                    }`}
                  onClick={() => onClose()}
                >
                  <div className="flex items-center">
                    <Icon className={`mr-3 h-6 w-6 ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-primary'
                      }`} />
                    {item.name}
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
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
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
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
                className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                  }`}
                onClick={() => onClose()}
              >
                <div className="flex items-center">
                  <Icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-primary'
                    }`} />
                  {item.name}
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
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
