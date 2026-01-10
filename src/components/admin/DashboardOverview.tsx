import React, { useState, useEffect } from 'react';
import { MapPin, Users, Eye, TrendingUp, Bus, Edit, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import SearchAnalyticsWidget from './SearchAnalyticsWidget';
import TerminalModal from './TerminalModal';
import SupportChat from './SupportChat';

interface DashboardStats {
  terminals: number;
  users: number;
  companies: number;
  banners: number;
  topTerminals: Array<{ id: string, name: string, visits: number }>;
  recentActivity: Array<{ name: string, updated_at: string, action: string }>;
}

const DashboardOverview = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [userTerminal, setUserTerminal] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [syncingTerminal, setSyncingTerminal] = useState(false);

  // Get user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (isAdmin) {
          // Admin: fetch dashboard stats
          const data = await api.getDashboardStats();
          setDashboardData(data);
        } else {
          // User: fetch their assigned terminal
          const terminals = await api.getAdminTerminals();
          if (terminals && terminals.length > 0) {
            setUserTerminal(terminals[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleSyncTerminal = async () => {
    if (!userTerminal) return;

    setSyncingTerminal(true);
    try {
      await api.syncTerminalById(userTerminal.id);
      toast({
        title: "Sincronización exitosa",
        description: "Los horarios se han actualizado correctamente.",
      });
      // Refresh terminal data
      const terminals = await api.getAdminTerminals();
      if (terminals && terminals.length > 0) {
        setUserTerminal(terminals[0]);
      }
    } catch (error) {
      console.error('Error syncing terminal:', error);
      toast({
        title: "Error de sincronización",
        description: "No se pudo sincronizar la terminal.",
        variant: "destructive"
      });
    } finally {
      setSyncingTerminal(false);
    }
  };

  const handleSaveTerminal = async (terminalData: any) => {
    try {
      const apiPayload = {
        ...terminalData,
        municipality_info: terminalData.municipalityInfo,
        schedules_visible: terminalData.schedulesVisible,
        is_active: terminalData.isActive
      };

      await api.updateTerminal(userTerminal.id, apiPayload);

      toast({
        title: "Terminal actualizada",
        description: "Los cambios se guardaron correctamente."
      });

      setShowEditModal(false);

      // Refresh terminal data
      const terminals = await api.getAdminTerminals();
      if (terminals && terminals.length > 0) {
        setUserTerminal(terminals[0]);
      }
    } catch (error) {
      console.error('Error updating terminal:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la terminal.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  }

  // User Terminal View
  if (!isAdmin && userTerminal) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mi Terminal</h2>
          <p className="text-gray-600">Administra tu terminal asignada</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">{userTerminal.name}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{userTerminal.city}</p>
            </div>
            <div className="flex gap-2">
              {userTerminal.google_sheet_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncTerminal}
                  disabled={syncingTerminal}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncingTerminal ? 'animate-spin' : ''}`} />
                  Sincronizar Horarios
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Terminal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Información</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Dirección:</span>
                    <p className="font-medium">{userTerminal.address}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Teléfono:</span>
                    <p className="font-medium">{userTerminal.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    <p className="font-medium">
                      {userTerminal.is_active ? '✅ Activa' : '❌ Inactiva'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Horarios visibles:</span>
                    <p className="font-medium">
                      {userTerminal.schedules_visible ? '✅ Sí' : '❌ No'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Estadísticas</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Empresas:</span>
                    <p className="font-medium text-lg">
                      {userTerminal.schedules ? new Set(userTerminal.schedules.map((s: any) => s.company)).size : 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Horarios cargados:</span>
                    <p className="font-medium text-lg">
                      {userTerminal.schedules?.length || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Última actualización:</span>
                    <p className="font-medium">
                      {new Date(userTerminal.updated_at).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {userTerminal.description && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-sm text-gray-600">{userTerminal.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <TerminalModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          terminal={userTerminal}
          onSave={handleSaveTerminal}
        />

        {/* Support Chat */}
        <SupportChat />
      </div>
    );
  }

  // User without terminal
  if (!isAdmin && !userTerminal) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Sin terminal asignada</h3>
          <p>Contacta al administrador para que te asigne una terminal.</p>
        </div>
      </div>
    );
  }

  // Admin Dashboard (original)
  if (!dashboardData) return null;

  const stats = [
    {
      title: 'Total Terminales',
      value: dashboardData.terminals.toString(),
      change: '+0%',
      icon: MapPin,
      color: 'text-primary'
    },
    {
      title: 'Usuarios Activos',
      value: dashboardData.users.toString(),
      change: '+0%',
      icon: Users,
      color: 'text-secondary'
    },
    {
      title: 'Banners Activos',
      value: dashboardData.banners.toString(),
      change: '+0%',
      icon: Eye,
      color: 'text-accent'
    },
    {
      title: 'Empresas',
      value: dashboardData.companies.toString(),
      change: '+0%',
      icon: Bus,
      color: 'text-green-600'
    }
  ];

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    const hours = Math.floor(diffInSeconds / 3600);
    if (hours < 24) return `Hace ${hours} horas`;
    return `Hace ${Math.floor(hours / 24)} días`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Vista general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 font-medium opacity-0">
                  {stat.change} desde el mes pasado
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${activity.action.includes('Usuario') ? 'bg-secondary' : 'bg-primary'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.name}</p>
                      <p className="text-xs text-gray-500">{activity.action} • {formatTimeAgo(activity.updated_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay actividad reciente.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terminales Más Visitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topTerminals.length > 0 ? (
                dashboardData.topTerminals.map((terminal) => (
                  <div key={terminal.id} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{terminal.name}</span>
                    <span className="text-sm text-gray-500">{terminal.visits || 0} visitas</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay datos de visitas aún.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
