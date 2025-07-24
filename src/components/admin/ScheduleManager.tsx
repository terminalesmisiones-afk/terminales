
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ScheduleImporter from './ScheduleImporter';

interface Schedule {
  id: number;
  company: string;
  destination: string;
  departure: string;
  arrival: string;
  frequency: string;
  platform: string;
}

interface ScheduleManagerProps {
  terminalId?: number;
  terminalName?: string;
  schedules: Schedule[];
  onSchedulesChange: (schedules: Schedule[]) => void;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ 
  terminalId, 
  terminalName = '',
  schedules, 
  onSchedulesChange 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    destination: '',
    departure: '',
    arrival: '',
    frequency: '',
    platform: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newSchedule: Schedule = {
      id: editingSchedule ? editingSchedule.id : Date.now(),
      ...formData
    };

    let updatedSchedules;
    if (editingSchedule) {
      updatedSchedules = schedules.map(s => s.id === editingSchedule.id ? newSchedule : s);
    } else {
      updatedSchedules = [...schedules, newSchedule];
    }

    onSchedulesChange(updatedSchedules);
    setShowForm(false);
    setEditingSchedule(null);
    setFormData({
      company: '',
      destination: '',
      departure: '',
      arrival: '',
      frequency: '',
      platform: ''
    });
  };

  const handleFormClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      company: schedule.company,
      destination: schedule.destination,
      departure: schedule.departure,
      arrival: schedule.arrival,
      frequency: schedule.frequency,
      platform: schedule.platform
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      const updatedSchedules = schedules.filter(s => s.id !== id);
      onSchedulesChange(updatedSchedules);
    }
  };

  const handleImport = (importedSchedules: Schedule[]) => {
    const updatedSchedules = [...schedules, ...importedSchedules];
    onSchedulesChange(updatedSchedules);
    setShowImporter(false);
  };

  const downloadTemplate = () => {
    const terminalNameForFile = terminalName ? terminalName.replace(/\s+/g, '_') : 'Terminal';
    const csvContent = 'Empresa,Destino,Salida,Llegada,Frecuencia\n' +
      'Ejemplo S.A.,Buenos Aires,08:00,20:00,Diario\n' +
      'Transporte XYZ,Corrientes,10:30,14:00,Lunes a Viernes';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla_horarios_${terminalNameForFile}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddScheduleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowForm(true);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowForm(false);
    setEditingSchedule(null);
    setFormData({
      company: '',
      destination: '',
      departure: '',
      arrival: '',
      frequency: '',
      platform: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Horarios de la Terminal
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={downloadTemplate}
              variant="outline" 
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Plantilla
            </Button>
            <Dialog open={showImporter} onOpenChange={setShowImporter}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Importar Horarios</DialogTitle>
                </DialogHeader>
                <ScheduleImporter onImport={handleImport} />
              </DialogContent>
            </Dialog>
            <Button onClick={handleAddScheduleClick} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Horario
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <Card className="mb-6" onClick={handleFormClick}>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingSchedule ? 'Editar Horario' : 'Nuevo Horario'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" onClick={handleFormClick}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="destination">Destino</Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="departure">Horario de Salida</Label>
                    <Input
                      id="departure"
                      type="time"
                      value={formData.departure}
                      onChange={(e) => setFormData(prev => ({ ...prev, departure: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="arrival">Horario de Llegada</Label>
                    <Input
                      id="arrival"
                      type="time"
                      value={formData.arrival}
                      onChange={(e) => setFormData(prev => ({ ...prev, arrival: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frecuencia</Label>
                    <Input
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                      placeholder="ej: Diario, Lunes a Viernes"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelClick}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingSchedule ? 'Actualizar' : 'Agregar'} Horario
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {schedules.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Salida</TableHead>
                <TableHead>Llegada</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.company}</TableCell>
                  <TableCell>{schedule.destination}</TableCell>
                  <TableCell>{schedule.departure}</TableCell>
                  <TableCell>{schedule.arrival}</TableCell>
                  <TableCell>{schedule.frequency}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay horarios configurados</h3>
            <p className="text-gray-500 mb-4">Agrega los primeros horarios para esta terminal</p>
            <Button onClick={handleAddScheduleClick}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Horario
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleManager;
