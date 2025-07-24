
import React, { useState, useEffect } from 'react';
import { Route } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MainRoute {
  id: number;
  origin: string;
  destination: string;
  duration: string;
  frequency: string;
  companies: string[];
  price?: string;
  isActive: boolean;
}

const MainRoutes = () => {
  const [routes, setRoutes] = useState<MainRoute[]>([]);

  useEffect(() => {
    const loadRoutes = () => {
      try {
        const stored = localStorage.getItem('mainRoutes');
        if (stored) {
          const parsedRoutes = JSON.parse(stored);
          setRoutes(parsedRoutes.filter((route: MainRoute) => route.isActive));
          return;
        }
      } catch (error) {
        console.error('Error loading routes:', error);
      }

      // Rutas por defecto si no hay datos guardados
      const defaultRoutes: MainRoute[] = [
        {
          id: 1,
          origin: 'Posadas',
          destination: 'Buenos Aires',
          duration: '12 horas',
          frequency: 'Diario',
          companies: ['Crucero del Norte', 'Río Uruguay'],
          price: '',
          isActive: true
        },
        {
          id: 2,
          origin: 'Oberá',
          destination: 'Córdoba',
          duration: '10 horas',
          frequency: '3 veces por semana',
          companies: ['Crucero del Norte'],
          price: '',
          isActive: true
        },
        {
          id: 3,
          origin: 'Puerto Iguazú',
          destination: 'Posadas',
          duration: '4 horas',
          frequency: 'Diario',
          companies: ['Tigre Iguazú', 'Río Uruguay'],
          price: '',
          isActive: true
        },
        {
          id: 4,
          origin: 'Eldorado',
          destination: 'Corrientes',
          duration: '6 horas',
          frequency: 'Lunes a Viernes',
          companies: ['Expreso Singer'],
          isActive: true
        }
      ];

      setRoutes(defaultRoutes);
      localStorage.setItem('mainRoutes', JSON.stringify(defaultRoutes));
    };

    loadRoutes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Route className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Rutas Principales
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre las rutas más populares desde y hacia Misiones. 
            Información actualizada sobre horarios y frecuencias.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routes.map((route) => (
            <Card key={route.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Route className="h-5 w-5 mr-2 text-primary" />
                    {route.origin} → {route.destination}
                  </div>
                  <Badge variant="secondary">{route.frequency}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Duración</h4>
                    <p className="text-gray-600">{route.duration}</p>
                  </div>
                  {route.price && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Precio desde</h4>
                      <p className="text-gray-600 font-semibold text-green-600">{route.price}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Empresas</h4>
                  <div className="flex flex-wrap gap-2">
                    {route.companies.map((company, idx) => (
                      <span 
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {routes.length === 0 && (
          <div className="text-center py-12">
            <Route className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No hay rutas disponibles</h3>
            <p className="text-gray-400">Las rutas se mostrarán aquí una vez que sean configuradas.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default MainRoutes;
