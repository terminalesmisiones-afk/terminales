
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TerminalSettingsFormProps {
  isActive: boolean;
  schedulesVisible: boolean;
  onActiveChange: (checked: boolean) => void;
  onSchedulesVisibleChange: (checked: boolean) => void;
  googleSheetUrl: string;
  onGoogleSheetUrlChange: (url: string) => void;
}

const TerminalSettingsForm: React.FC<TerminalSettingsFormProps> = ({
  isActive,
  schedulesVisible,
  onActiveChange,
  onSchedulesVisibleChange,
  googleSheetUrl,
  onGoogleSheetUrlChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configuración</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500">Estado y Visibilidad</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Terminal Activa</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={onActiveChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="schedulesVisible">Horarios Visibles</Label>
            <Switch
              id="schedulesVisible"
              checked={schedulesVisible}
              onCheckedChange={onSchedulesVisibleChange}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-500">Sincronización Automática</h3>
          <div className="space-y-2">
            <Label htmlFor="googleSheetUrl">URL de Google Sheets (CSV)</Label>
            <div className="text-xs text-gray-500 mb-2">
              Pega aquí el enlace público de tu hoja de cálculo para habilitar el botón de "Sincronizar" en el listado.
            </div>
            {/* We need to import Input first */}
            <input
              id="googleSheetUrl"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={googleSheetUrl}
              onChange={(e) => onGoogleSheetUrlChange(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TerminalSettingsForm;
