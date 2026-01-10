
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ScheduleImporter from './ScheduleImporter';

interface Schedule {
  id: string | number;
  company: string;
  destination: string;
  remarks: string;
  departure_mon_fri: string;
  departure_sat: string;
  departure_sun: string;
  platform?: string;
}

interface ScheduleManagerProps {
  terminalId?: number | string;
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
    remarks: '',
    departure_mon_fri: '',
    departure_sat: '',
    departure_sun: '',
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
      remarks: '',
      departure_mon_fri: '',
      departure_sat: '',
      departure_sun: '',
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
      remarks: schedule.remarks || '',
      departure_mon_fri: schedule.departure_mon_fri || '',
      departure_sat: schedule.departure_sat || '',
      departure_sun: schedule.departure_sun || '',
      platform: schedule.platform || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string | number) => {
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
    const csvContent = 'Empresa,Destino,Turno,Lun-Vie,Sab,Dom,Plataforma\n' +
      'Ejemplo S.A.,Buenos Aires,Mañana,08:00,08:00,09:00,5\n' +
      'Transporte XYZ,Corrientes,Tarde,14:30,14:30,,3';

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
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
      remarks: '',
      departure_mon_fri: '',
      departure_sat: '',
      departure_sun: '',
      platform: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-blue-600">
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
            <Button
              onClick={() => setShowImporter(!showImporter)}
              variant="outline"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button onClick={handleAddScheduleClick} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Horario
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showImporter && (
          <div className="mb-6">
            <ScheduleImporter onImport={handleImport} />
          </div>
        )}

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
                    <Label htmlFor="destination">Destino</Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      required
                    />
                  </div>
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
                    <Label htmlFor="remarks">Turno</Label>
                    <Input
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Mañana, Tarde, Noche"
                    />
                  </div>
                  <div>
                    <Label htmlFor="platform">Plataforma (Opcional)</Label>
                    <Input
                      id="platform"
                      value={formData.platform}
                      onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2 grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="departure_mon_fri">Lun-Vie</Label>
                      <Input
                        id="departure_mon_fri"
                        type="time"
                        value={formData.departure_mon_fri}
                        onChange={(e) => setFormData(prev => ({ ...prev, departure_mon_fri: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="departure_sat">Sábado</Label>
                      <Input
                        id="departure_sat"
                        type="time"
                        value={formData.departure_sat}
                        onChange={(e) => setFormData(prev => ({ ...prev, departure_sat: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="departure_sun">Domingo</Label>
                      <Input
                        id="departure_sun"
                        type="time"
                        value={formData.departure_sun}
                        onChange={(e) => setFormData(prev => ({ ...prev, departure_sun: e.target.value }))}
                      />
                    </div>
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
                <TableHead>Destino</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Lun-Vie</TableHead>
                <TableHead>Sáb</TableHead>
                <TableHead>Dom</TableHead>
                <TableHead>Plat</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(schedules) && schedules.map((schedule) => (
                <TableRow key={schedule.id || Math.random()}>
                  <TableCell>{schedule.destination}</TableCell>
                  <TableCell className="font-medium">{schedule.company}</TableCell>
                  <TableCell>{schedule.remarks}</TableCell>
                  <TableCell>{schedule.departure_mon_fri}</TableCell>
                  <TableCell>{schedule.departure_sat}</TableCell>
                  <TableCell>{schedule.departure_sun}</TableCell>
                  <TableCell>{schedule.platform}</TableCell>
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
