
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Route, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface MainRoute {
  id: number;
  origin: string;
  destination: string;
  duration: string;
  frequency: string;
  companies: string[];
  price?: string;
  isActive: boolean;
  lastUpdated: string;
}

const RoutesManager = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<MainRoute | null>(null);
  const [formData, setFormData] = useState<Omit<MainRoute, 'id' | 'lastUpdated'>>({
    origin: '',
    destination: '',
    duration: '',
    frequency: '',
    companies: [],
    price: '',
    isActive: true
  });

  const loadRoutes = (): MainRoute[] => {
    try {
      const stored = localStorage.getItem('mainRoutes');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading routes:', error);
    }

    const defaultRoutes: MainRoute[] = [
      {
        id: 1,
        origin: 'Posadas',
        destination: 'Buenos Aires',
        duration: '12 horas',
        frequency: 'Diario',
        companies: ['Crucero del Norte', 'Río Uruguay'],
        price: '$45.000',
        isActive: true,
        lastUpdated: new Date().toISOString().split('T')[0]
      },
      {
        id: 2,
        origin: 'Oberá',
        destination: 'Córdoba',
        duration: '10 horas',
        frequency: '3 veces por semana',
        companies: ['Crucero del Norte'],
        price: '$38.000',
        isActive: true,
        lastUpdated: new Date().toISOString().split('T')[0]
      },
      {
        id: 3,
        origin: 'Puerto Iguazú',
        destination: 'Posadas',
        duration: '4 horas',
        frequency: 'Diario',
        companies: ['Tigre Iguazú', 'Río Uruguay'],
        price: '$12.000',
        isActive: true,
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    ];

    localStorage.setItem('mainRoutes', JSON.stringify(defaultRoutes));
    return defaultRoutes;
  };

  const [routes, setRoutes] = useState<MainRoute[]>(loadRoutes());

  const saveRoutes = (newRoutes: MainRoute[]) => {
    setRoutes(newRoutes);
    localStorage.setItem('mainRoutes', JSON.stringify(newRoutes));
  };

  const filteredRoutes = routes.filter(route =>
    route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingRoute(null);
    setFormData({
      origin: '',
      destination: '',
      duration: '',
      frequency: '',
      companies: [],
      price: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (route: MainRoute) => {
    setEditingRoute(route);
    setFormData({
      origin: route.origin,
      destination: route.destination,
      duration: route.duration,
      frequency: route.frequency,
      companies: route.companies,
      price: route.price || '',
      isActive: route.isActive
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingRoute) {
      const updatedRoutes = routes.map(r =>
        r.id === editingRoute.id ? {
          ...formData,
          id: editingRoute.id,
          lastUpdated: new Date().toISOString().split('T')[0]
        } : r
      );
      saveRoutes(updatedRoutes);
    } else {
      const newRoute: MainRoute = {
        ...formData,
        id: Date.now(),
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      saveRoutes([...routes, newRoute]);
    }

    setShowModal(false);
    toast({
      title: "Ruta guardada",
      description: "La ruta se ha guardado correctamente.",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta ruta?')) {
      const updatedRoutes = routes.filter(r => r.id !== id);
      saveRoutes(updatedRoutes);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rutas Principales</h2>
          <p className="text-gray-600">Gestiona las rutas principales del sistema</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary-600">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Ruta
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{routes.length}</div>
            <p className="text-sm text-gray-600">Total Rutas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">
              {routes.filter(r => r.isActive).length}
            </div>
            <p className="text-sm text-gray-600">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">
              {routes.filter(r => r.frequency === 'Diario').length}
            </div>
            <p className="text-sm text-gray-600">Rutas Diarias</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar rutas por origen o destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Rutas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Rutas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Empresas</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Route className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">{route.origin} → {route.destination}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {route.duration}
                      </div>
                    </TableCell>
                    <TableCell>{route.frequency}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {route.companies.map((company, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {company}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{route.price || 'No especificado'}</TableCell>
                    <TableCell>
                      <Badge variant={route.isActive ? "default" : "secondary"}>
                        {route.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(route)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(route.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edición */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRoute ? 'Editar Ruta' : 'Nueva Ruta'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="origin">Origen</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="Ciudad de origen"
                  required
                />
              </div>

              <div>
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="Ciudad de destino"
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration">Duración</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="Ej: 12 horas"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="frequency">Frecuencia</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diario">Diario</SelectItem>
                    <SelectItem value="Lunes a Viernes">Lunes a Viernes</SelectItem>
                    <SelectItem value="3 veces por semana">3 veces por semana</SelectItem>
                    <SelectItem value="2 veces por semana">2 veces por semana</SelectItem>
                    <SelectItem value="Semanal">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="companies">Empresas (separadas por comas)</Label>
                <Input
                  id="companies"
                  value={formData.companies.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    companies: e.target.value.split(',').map(c => c.trim()).filter(c => c) 
                  }))}
                  placeholder="Empresa 1, Empresa 2, Empresa 3"
                />
              </div>

              <div>
                <Label htmlFor="price">Precio (opcional)</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Ej: $45.000"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary-600">
              {editingRoute ? 'Actualizar' : 'Crear'} Ruta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoutesManager;
