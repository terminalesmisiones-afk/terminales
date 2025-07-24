import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TerminalModal from './TerminalModal';

interface Schedule {
  id: number;
  company: string;
  destination: string;
  departure: string;
  arrival: string;
  frequency: string;
  platform: string;  
}

interface Terminal {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  schedulesVisible: boolean;
  description: string;
  municipalityInfo: string;
  image: string;
  companyCount: number;
  lastUpdated: string;
  schedules?: Schedule[];
}

const TerminalsManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState<Terminal | null>(null);

  // Función para contar empresas únicas basado en horarios reales
  const countUniqueCompanies = (schedules: Schedule[] = []): number => {
    const uniqueCompanies = new Set(schedules.map(schedule => schedule.company.trim().toLowerCase()));
    return uniqueCompanies.size;
  };

  // Cargar terminales desde localStorage o usar las por defecto
  const loadTerminals = (): Terminal[] => {
    try {
      const stored = localStorage.getItem('terminals');
      if (stored) {
        const terminals = JSON.parse(stored);
        // Actualizar el contador de empresas para cada terminal
        return terminals.map((terminal: Terminal) => ({
          ...terminal,
          companyCount: countUniqueCompanies(terminal.schedules || [])
        }));
      }
    } catch (error) {
      console.error('Error loading terminals:', error);
    }

    // Lista completa de terminales de la Provincia de Misiones
    const defaultTerminals = [
      // Terminales principales con horarios
      {
        id: 1,
        name: 'Posadas',
        city: 'Posadas',
        address: 'Av. Quaranta 2570, Posadas, Misiones',
        phone: '+54 376 443-3333',
        email: 'terminal@posadas.com',
        latitude: -27.367,
        longitude: -55.896,
        isActive: true,
        schedulesVisible: true,
        description: 'Terminal principal de la ciudad de Posadas, capital de la provincia',
        municipalityInfo: 'Posadas es la capital de la provincia de Misiones, Argentina. Conocida por su arquitectura colonial y su proximidad a las Cataratas del Iguazú.',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
        companyCount: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        schedules: [
          { id: 1, company: 'Empresa Crucero del Norte', destination: 'Buenos Aires', departure: '08:00', arrival: '18:00', frequency: 'Diario', platform: '1' },
          { id: 2, company: 'Singer', destination: 'Córdoba', departure: '10:30', arrival: '22:30', frequency: 'Diario', platform: '2' },
          { id: 3, company: 'Expreso Singer', destination: 'Resistencia', departure: '14:00', arrival: '18:00', frequency: 'Diario', platform: '3' },
          { id: 4, company: 'Via Bariloche', destination: 'Bariloche', departure: '20:00', arrival: '14:00+1', frequency: 'Martes, Jueves, Sábado', platform: '4' },
          { id: 5, company: 'Empresa Crucero del Norte', destination: 'Iguazú', departure: '06:30', arrival: '10:30', frequency: 'Diario', platform: '5' }
        ]
      },
      {
        id: 2,
        name: 'Oberá',
        city: 'Oberá',
        address: 'Av. Sarmiento 444, Oberá, Misiones',
        phone: '+54 3755 42-2222',
        email: 'terminal@obera.com',
        latitude: -27.486,
        longitude: -55.119,
        isActive: true,
        schedulesVisible: true,
        description: 'Terminal de ómnibus de Oberá, capital nacional del inmigrante',
        municipalityInfo: 'Oberá es conocida como la "Capital Nacional del Inmigrante" por su diversidad cultural y el Festival Nacional del Inmigrante.',
        image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
        companyCount: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        schedules: [
          { id: 1, company: 'Empresa Crucero del Norte', destination: 'Posadas', departure: '07:00', arrival: '08:30', frequency: 'Diario', platform: '1' },
          { id: 2, company: 'Singer', destination: 'Buenos Aires', departure: '21:30', arrival: '11:30+1', frequency: 'Diario', platform: '2' },
          { id: 3, company: 'Expreso Oberá', destination: 'Puerto Iguazú', departure: '09:00', arrival: '13:00', frequency: 'Lunes a Viernes', platform: '3' }
        ]
      },
      {
        id: 3,
        name: 'Puerto Iguazú',
        city: 'Puerto Iguazú',
        address: 'Av. Córdoba 264, Puerto Iguazú, Misiones',
        phone: '+54 3757 42-1111',
        email: 'terminal@iguazu.com',
        latitude: -25.597,
        longitude: -54.578,
        isActive: true,
        schedulesVisible: true,
        description: 'Terminal turística de Puerto Iguazú, puerta de entrada a las Cataratas',
        municipalityInfo: 'Puerto Iguazú es la puerta de entrada a las mundialmente famosas Cataratas del Iguazú, una de las Siete Maravillas Naturales del Mundo.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
        companyCount: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        schedules: [
          { id: 1, company: 'Empresa Crucero del Norte', destination: 'Buenos Aires', departure: '19:30', arrival: '09:30+1', frequency: 'Diario', platform: '1' },
          { id: 2, company: 'Singer', destination: 'Posadas', departure: '16:00', arrival: '20:00', frequency: 'Diario', platform: '2' },
          { id: 3, company: 'Rio Uruguay', destination: 'Córdoba', departure: '22:00', arrival: '10:00+1', frequency: 'Martes, Jueves, Domingo', platform: '3' },
          { id: 4, company: 'Expreso Iguazú', destination: 'Oberá', departure: '12:00', arrival: '16:00', frequency: 'Lunes a Viernes', platform: '4' }
        ]
      },
      // Resto de terminales de Misiones (sin horarios iniciales)
      {
        id: 4,
        name: 'Eldorado',
        city: 'Eldorado',
        address: 'Av. San Martín 1850, Eldorado, Misiones',
        phone: '+54 3751 42-4444',
        email: 'terminal@eldorado.com',
        latitude: -26.401,
        longitude: -54.616,
        isActive: true,
        schedulesVisible: false,
        description: 'Terminal de Eldorado, importante centro productivo',
        municipalityInfo: 'Eldorado es un importante centro productivo de la provincia, conocido por sus plantaciones de yerba mate y té.',
        image: 'https://images.unsplash.com/photo-1441716844725-09cedc13b55f?w=400&h=300&fit=crop',
        companyCount: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        schedules: []
      },
      {
        id: 5,
        name: 'Apóstoles',
        city: 'Apóstoles',
        address: 'Av. Tres Fronteras 230, Apóstoles, Misiones',
        phone: '+54 3758 42-1234',
        email: 'terminal@apostoles.com',
        latitude: -27.908,
        longitude: -55.768,
        isActive: true,
        schedulesVisible: false,
        description: 'Terminal de Apóstoles',
        municipalityInfo: 'Apóstoles es conocida por su producción agrícola y ganadera, destacándose en la yerba mate.',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
        companyCount: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        schedules: []
      },
      {
        id: 6,
        name: 'San Vicente',
        city: 'San Vicente',
        address: 'Ruta Provincial 17, San Vicente, Misiones',
        phone: '+54 3755 49-1111',
        email: 'terminal@sanvicente.com',
        latitude: -26.618,
        longitude: -54.129,
        isActive: true,
        schedulesVisible: false,
        description: 'Terminal de San Vicente',
        municipalityInfo: 'San Vicente es un municipio ubicado en el centro de la provincia de Misiones.',
        image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
        companyCount: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        schedules: []
      },
      {
        id: 7,
        name: 'Montecarlo',
        city: 'Montecarlo',
        address: 'Av. Libertad 445, Montecarlo, Misiones',
        phone: '+54 3751 48-2222',
        email: 'terminal@montecarlo.com',
        latitude: -26.567,
        longitude: -54.743,
        isActive: true,
        schedulesVisible: false,
        description: 'Terminal de Montecarlo',
        municipalityInfo: 'Montecarlo es conocida por su producción citrícola y como centro turístico regional.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
        companyCount: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        schedules: []
      },
      {
        id: 8,
        name: 'Aristóbulo del Valle',
        city: 'Aristóbulo del Valle',
        address: 'Av. San Martín 123, Aristóbulo del Valle, Misiones',
        phone: '+54 3755 47-1234',
        email: 'terminal@aristobulo.com',
        latitude: -27.099,
        longitude: -54.878,
        isActive: true,
        schedulesVisible: false,
        description: 'Terminal de Aristóbulo del Valle',
        municipalityInfo: 'Aristóbulo del Valle es un municipio del centro de Misiones, rodeado de naturaleza.',
        image: 'https://images.unsplash.com/photo-1441716844725-09cedc13b55f?w=400&h=300&fit=crop',
        companyCount: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        schedules: []
      },
      {
        id: 9,
        name: 'Leandro N. Alem',
        city: 'Leandro N. Alem',
        address: 'Av. San Martín 567, Leandro N. Alem, Misiones',
        phone: '+54 3755 42-5678',
        email: 'terminal@alem.com',
        latitude: -27.599,
        longitude: -55.323,
        isActive: true,
        schedulesVisible: false,
        description: 'Terminal de Leandro N. Alem',
        municipalityInfo: 'Leandro N. Alem es un importante centro agrícola de la provincia de Misiones.',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
        companyCount: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        schedules: []
      },
      {
        id: 10,
        name: 'Jardín América',
        city: 'Jardín América',
        address: 'Ruta Nacional 12, Jardín América, Misiones',
        phone: '+54 3751 49-3333',
        email: 'terminal@jardinamerica.com',
        latitude: -27.034,
        longitude: -55.226,
        isActive: true,
        schedulesVisible: false,
        description: 'Terminal de Jardín América',
        municipalityInfo: 'Jardín América es conocida por su producción agrícola y desarrollo industrial.',
        image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
        companyCount: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        schedules: []
      }
    ].map(terminal => ({
      ...terminal,
      companyCount: countUniqueCompanies(terminal.schedules || [])
    }));

    // Guardar las terminales por defecto en localStorage
    localStorage.setItem('terminals', JSON.stringify(defaultTerminals));
    return defaultTerminals;
  };

  const [terminals, setTerminals] = useState<Terminal[]>(loadTerminals());

  // Guardar terminales en localStorage cada vez que cambien
  const saveTerminals = (newTerminals: Terminal[]) => {
    // Actualizar contador de empresas antes de guardar
    const terminalsWithUpdatedCount = newTerminals.map(terminal => ({
      ...terminal,
      companyCount: countUniqueCompanies(terminal.schedules || []),
      lastUpdated: new Date().toISOString().split('T')[0] // Actualizar fecha automáticamente
    }));
    
    setTerminals(terminalsWithUpdatedCount);
    localStorage.setItem('terminals', JSON.stringify(terminalsWithUpdatedCount));
    console.log('Terminales guardadas con fecha actualizada:', terminalsWithUpdatedCount);
    
    // Disparar evento para notificar cambios en tiempo real
    window.dispatchEvent(new Event('storage'));
  };

  const filteredTerminals = terminals.filter(terminal => {
    const matchesSearch = 
      terminal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      terminal.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      terminal.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      selectedFilter === 'all' ||
      (selectedFilter === 'active' && terminal.isActive) ||
      (selectedFilter === 'inactive' && !terminal.isActive) ||
      (selectedFilter === 'visible' && terminal.schedulesVisible) ||
      (selectedFilter === 'hidden' && !terminal.schedulesVisible);
    
    return matchesSearch && matchesFilter;
  });

  const handleCreate = () => {
    setEditingTerminal(null);
    setShowModal(true);
  };

  const handleEdit = (terminal: Terminal) => {
    setEditingTerminal(terminal);
    setShowModal(true);
  };

  const handleSave = (terminalData: Terminal) => {
    console.log('Guardando terminal:', terminalData);
    
    if (editingTerminal) {
      const updatedTerminals = terminals.map(t => 
        t.id === editingTerminal.id ? { 
          ...terminalData, 
          id: editingTerminal.id,
          lastUpdated: new Date().toISOString().split('T')[0]
        } : t
      );
      saveTerminals(updatedTerminals);
    } else {
      const newTerminal = {
        ...terminalData,
        id: Date.now(),
        companyCount: countUniqueCompanies(terminalData.schedules || []),
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      console.log('Nueva terminal creada:', newTerminal);
      saveTerminals([...terminals, newTerminal]);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta terminal?')) {
      const updatedTerminals = terminals.filter(t => t.id !== id);
      saveTerminals(updatedTerminals);
    }
  };

  const toggleVisibility = (id: number) => {
    const updatedTerminals = terminals.map(t => 
      t.id === id ? { ...t, schedulesVisible: !t.schedulesVisible } : t
    );
    saveTerminals(updatedTerminals);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Terminales</h2>
          <p className="text-gray-600">Administra todas las terminales del sistema</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary-600">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Terminal
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{terminals.length}</div>
            <p className="text-sm text-gray-600">Total Terminales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">
              {terminals.filter(t => t.isActive).length}
            </div>
            <p className="text-sm text-gray-600">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">
              {terminals.filter(t => t.schedulesVisible).length}
            </div>
            <p className="text-sm text-gray-600">Con Horarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {terminals.reduce((sum, t) => sum + t.companyCount, 0)}
            </div>
            <p className="text-sm text-gray-600">Total Empresas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar terminales por nombre o ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedFilter === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                Todas
              </Button>
              <Button
                variant={selectedFilter === 'active' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter('active')}
              >
                Activas
              </Button>
              <Button
                variant={selectedFilter === 'inactive' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter('inactive')}
              >
                Inactivas
              </Button>
              <Button
                variant={selectedFilter === 'visible' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter('visible')}
              >
                Con Horarios
              </Button>
              <Button
                variant={selectedFilter === 'hidden' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter('hidden')}
              >
                Sin Horarios
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Terminales Simplificada */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Terminales de Misiones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Terminal</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Horarios</TableHead>
                  <TableHead>Empresas</TableHead>
                  <TableHead>Última actualización</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTerminals.map((terminal) => (
                  <TableRow key={terminal.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">Terminal {terminal.name}</div>
                        <div className="text-sm text-gray-500">{terminal.city}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={terminal.isActive ? "default" : "secondary"}>
                        {terminal.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={terminal.schedulesVisible ? "default" : "outline"}>
                        {terminal.schedulesVisible ? 'Visibles' : 'Ocultos'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{terminal.companyCount}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">{terminal.lastUpdated}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(terminal)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVisibility(terminal.id)}
                          className="h-8 w-8 p-0"
                        >
                          {terminal.schedulesVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(terminal.id)}
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

          {filteredTerminals.length === 0 && (
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto text-gray-400 mb-4 flex items-center justify-center">
                🚌
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron terminales</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera terminal para comenzar'}
              </p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Terminal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TerminalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        terminal={editingTerminal}
        onSave={handleSave}
      />
    </div>
  );
};

export default TerminalsManager;
