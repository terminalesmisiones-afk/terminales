
import React from 'react';
import { TrendingUp, Users, Eye, MapPin, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsManager = () => {
  const stats = [
    {
      title: 'Visitas Totales',
      value: '12,847',
      change: '+23.5%',
      icon: Eye,
      color: 'text-primary'
    },
    {
      title: 'Usuarios Únicos',
      value: '8,234',
      change: '+18.2%',
      icon: Users,
      color: 'text-secondary'
    },
    {
      title: 'Consultas de Horarios',
      value: '45,678',
      change: '+31.4%',
      icon: Clock,
      color: 'text-accent'
    },
    {
      title: 'Terminales Visitadas',
      value: '89',
      change: '+12.8%',
      icon: MapPin,
      color: 'text-green-600'
    }
  ];

  const topTerminals = [
    { name: 'Terminal Posadas', visits: 2847, percentage: 23.5 },
    { name: 'Terminal Oberá', visits: 1934, percentage: 16.2 },
    { name: 'Terminal Puerto Iguazú', visits: 1456, percentage: 12.1 },
    { name: 'Terminal Eldorado', visits: 1123, percentage: 9.3 },
    { name: 'Terminal Apóstoles', visits: 876, percentage: 7.3 }
  ];

  const recentActivity = [
    { time: '14:30', event: 'Consulta horarios Posadas → Buenos Aires', user: 'Usuario #1234' },
    { time: '14:28', event: 'Compartido en WhatsApp: Terminal Oberá', user: 'Usuario #5678' },
    { time: '14:25', event: 'Búsqueda: "horarios puerto iguazu"', user: 'Usuario #9012' },
    { time: '14:22', event: 'Geolocalización activada', user: 'Usuario #3456' },
    { time: '14:20', event: 'Consulta horarios Eldorado → Posadas', user: 'Usuario #7890' }
  ];

  const trafficSources = [
    { source: 'Búsqueda Orgánica', visits: 4567, percentage: 38.2 },
    { source: 'Directo', visits: 3234, percentage: 27.1 },
    { source: 'Redes Sociales', visits: 2345, percentage: 19.6 },
    { source: 'Referencias', visits: 1876, percentage: 15.1 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600">Estadísticas de uso y rendimiento del sistema</p>
      </div>

      {/* Estadísticas Principales */}
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
                  {stat.change} vs mes anterior
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminales Más Visitadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Terminales Más Visitadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTerminals.map((terminal, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{terminal.name}</span>
                      <span className="text-sm text-gray-500">{terminal.visits.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-500"
                        style={{ width: `${terminal.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fuentes de Tráfico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Fuentes de Tráfico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{source.source}</span>
                      <span className="text-sm text-gray-500">{source.visits.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-secondary rounded-full h-2 transition-all duration-500"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tráfico (Simulado) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Tráfico de los Últimos 7 Días
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-600">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <p>Gráfico de tráfico</p>
              <p className="text-sm">Aquí se mostraría el gráfico de visitas diarias</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                <div className="text-sm text-gray-500 min-w-[60px]">
                  {activity.time}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tiempo de Carga</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">1.2s</div>
            <p className="text-sm text-gray-600">Promedio de carga de página</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Excelente</span>
                <span>3s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-500 rounded-full h-2" style={{ width: '40%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tasa de Rebote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">24.3%</div>
            <p className="text-sm text-gray-600">Usuarios que salen inmediatamente</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Excelente</span>
                <span>40%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-500 rounded-full h-2" style={{ width: '60%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sesión Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">3:45</div>
            <p className="text-sm text-gray-600">Duración promedio de visita</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Bueno</span>
                <span>5min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-yellow-500 rounded-full h-2" style={{ width: '75%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsManager;
