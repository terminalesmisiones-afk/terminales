
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
        console.log('Contenido del archivo:', text.substring(0, 200) + '...');

        const lines = text.split(/\r?\n/); // Handle Windows/Unix line endings
        if (lines.length < 2) {
          setError('El archivo parece estar vacío o solo tiene cabecera.');
          setIsLoading(false);
          return;
        }

        // Detect delimiter (comma or semicolon) using header
        const header = lines[0];
        const delimiter = header.includes(';') ? ';' : ',';
        console.log(`Delimitador detectado: "${delimiter}"`);

        const schedules = lines.slice(1).map((line, index) => {
          if (!line.trim()) return null;

          // Regex to split by delimiter respecting quotes
          const regex = new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
          const values = line.split(regex).map(v => v.trim().replace(/^"|"$/g, ''));

          // Expected format: Empresa, Destino, Turno, Lun-Vie, Sab, Dom, Plataforma
          if (values.length < 2) return null;

          return {
            id: Date.now() + index,
            company: values[0] || '',
            destination: values[1] || '',
            remarks: values[2] || '',
            departure_mon_fri: values[3] || '',
            departure_sat: values[4] || '',
            departure_sun: values[5] || '',
            platform: values[6] || ''
          };
        }).filter((schedule): schedule is any => schedule !== null && !!schedule.company && !!schedule.destination);

        if (schedules.length === 0) {
          alert('Error: No se pudieron leer horarios del archivo. Verifica el formato.');
          setError('No se encontraron horarios válidos. Revisa el delimitador y las columnas.');
        } else {
          alert(`¡Éxito! Se han leído ${schedules.length} horarios.`);
          onImport(schedules);
        }
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Error al procesar el archivo. Verifica el formato.');
        setIsLoading(false);
      }
    };
    reader.readAsText(file, 'ISO-8859-1'); // Try Latin1 to handle accents if UTF-8 fails, though usually UTF-8 is better. Let's stick to auto/UTF8 default for readAsText but maybe BOM handles it.
    // Actually, let's use default encoding (UTF-8 generally) but maybe needed for Excel CSVs.
    // Let's standard readAsText(file) first.
  };

  const handleGoogleSheetsImport = async () => {
    if (!googleSheetsUrl) return;

    setIsLoading(true);
    setError('');

    try {
      // Convertir URL de Google Sheets a formato CSV
      let csvUrl = googleSheetsUrl;
      if (googleSheetsUrl.includes('docs.google.com/spreadsheets')) {
        csvUrl = googleSheetsUrl.replace('/edit#gid=', '/export?format=csv&gid=');
        if (!csvUrl.includes('/export?')) {
          // Fallback for simple link
          csvUrl = googleSheetsUrl.replace(/\/edit.*$/, '/export?format=csv');
        }
      }

      console.log('Fetching CSV from:', csvUrl);
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error('Error de red al obtener Google Sheets');
      const text = await response.text();

      console.log('Contenido Google Sheets:', text.substring(0, 200));

      const lines = text.split(/\r?\n/);
      const schedules = lines.slice(1).map((line, index) => {
        if (!line.trim()) return null;
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));

        if (values.length < 2) return null;

        return {
          id: Date.now() + index,
          company: values[0] || '',
          destination: values[1] || '',
          remarks: values[2] || '',
          departure_mon_fri: values[3] || '',
          departure_sat: values[4] || '',
          departure_sun: values[5] || '',
          platform: values[6] || ''
        };
      }).filter((schedule): schedule is any => schedule !== null && !!schedule.company && !!schedule.destination);

      if (schedules.length === 0) {
        alert('No se encontraron horarios en el Google Sheet. Verifica que la hoja no esté vacía.');
      } else {
        alert(`¡Éxito! Importados ${schedules.length} horarios desde Google Sheets.`);
        onImport(schedules);
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError('Error al importar desde Google Sheets. Verifica que el enlace sea PÚBLICO ("Cualquier persona con el enlace").');
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'Empresa,Destino,Turno,Lun-Vie,Sab,Dom,Plataforma\n' +
      'Ejemplo S.A.,Buenos Aires,Mañana,08:00,08:00,09:00,5\n' +
      'Transporte XYZ,Corrientes,Tarde,14:30,14:30,,3';

    // Add BOM for Excel compatibility
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
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
            <strong>Empresa, Destino, Turno, Lun-Vie, Sáb, Dom, Plataforma</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleImporter;
