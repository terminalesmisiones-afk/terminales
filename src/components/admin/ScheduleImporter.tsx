
import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Link, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface ScheduleImporterProps {
  onImport: (schedules: any[]) => void;
}

const ScheduleImporter: React.FC<ScheduleImporterProps> = ({ onImport }) => {
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const schedules = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          return {
            id: Date.now() + index,
            company: values[0] || '',
            destination: values[1] || '',
            departure: values[2] || '',
            arrival: values[3] || '',
            frequency: values[4] || '',
            platform: values[5] || ''
          };
        }).filter(schedule => schedule.company && schedule.destination);

        onImport(schedules);
        setIsLoading(false);
      } catch (err) {
        setError('Error al procesar el archivo. Verifica el formato.');
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleGoogleSheetsImport = async () => {
    if (!googleSheetsUrl) return;

    setIsLoading(true);
    setError('');

    try {
      // Convertir URL de Google Sheets a formato CSV
      const csvUrl = googleSheetsUrl.replace('/edit#gid=', '/export?format=csv&gid=');
      const response = await fetch(csvUrl);
      const text = await response.text();
      
      const lines = text.split('\n');
      const schedules = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return {
          id: Date.now() + index,
          company: values[0] || '',
          destination: values[1] || '',
          departure: values[2] || '',
          arrival: values[3] || '',
          frequency: values[4] || '',
          platform: values[5] || ''
        };
      }).filter(schedule => schedule.company && schedule.destination);

      onImport(schedules);
      setIsLoading(false);
    } catch (err) {
      setError('Error al importar desde Google Sheets. Verifica la URL y permisos.');
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'Empresa,Destino,Salida,Llegada,Frecuencia,Plataforma\n' +
      'Ejemplo S.A.,Buenos Aires,08:00,20:00,Diario,Plataforma 1\n' +
      'Transporte XYZ,Corrientes,10:30,14:00,Lunes a Viernes,Plataforma 2';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_horarios.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2" />
          Importar Horarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Plantilla */}
        <div className="space-y-2">
          <Label>1. Descargar Plantilla</Label>
          <Button 
            onClick={downloadTemplate}
            variant="outline"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Plantilla CSV
          </Button>
        </div>

        {/* Subir archivo */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">2. Subir Archivo Excel/CSV</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
        </div>

        {/* Google Sheets */}
        <div className="space-y-2">
          <Label htmlFor="sheets-url">3. O Importar desde Google Sheets</Label>
          <div className="flex gap-2">
            <Input
              id="sheets-url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={googleSheetsUrl}
              onChange={(e) => setGoogleSheetsUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              onClick={handleGoogleSheetsImport}
              disabled={!googleSheetsUrl || isLoading}
            >
              <Link className="h-4 w-4 mr-2" />
              Importar
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Asegúrate de que la hoja de Google Sheets sea pública o compartida con permisos de lectura
          </p>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Formato requerido:</h4>
          <p className="text-sm text-blue-800">
            El archivo debe tener las siguientes columnas en orden:
            <br />
            <strong>Empresa, Destino, Salida, Llegada, Frecuencia, Plataforma</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleImporter;
