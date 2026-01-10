import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TerminalModal from './TerminalModal';
import { useSupabaseTerminals } from '@/hooks/useSupabaseTerminals';
import { useSupabaseAdmin } from '@/hooks/useSupabaseAdmin';
import { Terminal as ImportedTerminal } from '@/types/terminal';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

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
  id: string;
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
  google_sheet_url?: string;
}

const TerminalsManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState<any>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Use Supabase hooks
  const { terminals, loading, error, refreshTerminals } = useSupabaseTerminals();
  const { createTerminal, updateTerminal, deleteTerminal, loading: adminLoading } = useSupabaseAdmin();

  // Transform Supabase terminals to local format
  const localTerminals = terminals.map(terminal => ({
    id: terminal.id,
    name: terminal.name,
    city: terminal.city,
    address: terminal.address,
    phone: terminal.phone || '',
    email: '', // Will be added later
    latitude: terminal.latitude || 0,
    longitude: terminal.longitude || 0,
    isActive: terminal.isActive,
    schedulesVisible: terminal.schedulesVisible,
    description: terminal.description || '',
    municipalityInfo: terminal.municipalityInfo || '',
    image: terminal.image,
    companyCount: terminal.companyCount,
    lastUpdated: terminal.lastUpdated.split('T')[0],
    schedules: terminal.schedules || [],
    google_sheet_url: terminal.google_sheet_url
  }));

  const filteredTerminals = localTerminals.filter(terminal => {
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

  const handleEdit = (terminal: any) => {
    setEditingTerminal(terminal);
    setShowModal(true);
  };

  const handleSave = async (terminalData: any) => {
    try {
      console.log('Guardando terminal (Payload):', terminalData);



      // Transform for API (camelCase -> snake_case)
      const apiPayload = {
        ...terminalData,
        municipality_info: terminalData.municipalityInfo,
        schedules_visible: terminalData.schedulesVisible,
        is_active: terminalData.isActive
      };

      if (editingTerminal) {
        await updateTerminal(editingTerminal.id, apiPayload);
      } else {
        await createTerminal(apiPayload);
      }
      refreshTerminals();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving terminal:', error);
    }
  };

  const handleDelete = async (terminalId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta terminal?')) {
      try {
        await deleteTerminal(terminalId);
        refreshTerminals();
      } catch (error) {
        console.error('Error deleting terminal:', error);
      }
    }
  };

  const handleSync = async (terminal: any) => {
    if (!terminal.google_sheet_url) {
      toast({
        title: "Sin configuración",
        description: "Esta terminal no tiene una URL de Google Sheets configurada.",
        variant: "destructive"
      });
      return;
    }

    setSyncingId(terminal.id);
    try {
      const result = await api.syncTerminalById(terminal.id);
      toast({
        title: "Sincronización exitosa",
        description: `Se han actualizado ${result.count || ''} horarios correctamente.`,
      });
      refreshTerminals();
    } catch (error) {
      console.error('Error syncing terminal:', error);
      toast({
        title: "Error de sincronización",
        description: error instanceof Error ? error.message : "No se pudo sincronizar la terminal.",
        variant: "destructive"
      });
    } finally {
      setSyncingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-lg">Cargando terminales...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-lg text-red-600">Error: {error}</div>
          <Button onClick={refreshTerminals} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

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
            <div className="text-2xl font-bold text-primary">{localTerminals.length}</div>
            <p className="text-sm text-gray-600">Total Terminales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">
              {localTerminals.filter(t => t.isActive).length}
            </div>
            <p className="text-sm text-gray-600">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">
              {localTerminals.filter(t => t.schedulesVisible).length}
            </div>
            <p className="text-sm text-gray-600">Con Horarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {localTerminals.reduce((sum, t) => sum + t.companyCount, 0)}
            </div>
            <p className="text-sm text-gray-600">Total Empresas</p>
          </CardContent>
        </Card>
      </div>

      {/* Integración Google Sheets - Reemplazado por sincronización por terminal */}
      {/* <GoogleSheetsSync onSyncSuccess={refreshTerminals} /> */}

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
                          onClick={() => handleSync(terminal)}
                          disabled={!terminal.google_sheet_url || syncingId === terminal.id}
                          className={`h-8 w-8 p-0 ${!terminal.google_sheet_url ? 'text-gray-300' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'} ${syncingId === terminal.id ? 'animate-spin' : ''}`}
                          title={terminal.google_sheet_url ? "Sincronizar con Google Sheets" : "Configura una URL de Google Sheets para sincronizar"}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
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
