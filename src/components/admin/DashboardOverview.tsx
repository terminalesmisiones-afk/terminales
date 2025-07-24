
import React from 'react';
import { MapPin, Users, Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardOverview = () => {
  const stats = [
    {
      title: 'Total Terminales',
      value: '125',
      change: '+12%',
      icon: MapPin,
      color: 'text-primary'
    },
    {
      title: 'Usuarios Activos',
      value: '2,847',
      change: '+23%',
      icon: Users,
      color: 'text-secondary'
    },
    {
      title: 'Visitas Hoy',
      value: '1,234',
      change: '+8%',
      icon: Eye,
      color: 'text-accent'
    },
    {
      title: 'Crecimiento',
      value: '34%',
      change: '+4%',
      icon: TrendingUp,
      color: 'text-green-600'
    }
  ];

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
                <p className="text-xs text-green-600 font-medium">
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
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Terminal Posadas actualizada</p>
                  <p className="text-xs text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nuevo usuario registrado</p>
                  <p className="text-xs text-gray-500">Hace 4 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Horarios sincronizados</p>
                  <p className="text-xs text-gray-500">Hace 6 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terminales Más Visitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Posadas</span>
                <span className="text-sm text-gray-500">2,847 visitas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Oberá</span>
                <span className="text-sm text-gray-500">1,234 visitas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Puerto Iguazú</span>
                <span className="text-sm text-gray-500">987 visitas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Eldorado</span>
                <span className="text-sm text-gray-500">654 visitas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
