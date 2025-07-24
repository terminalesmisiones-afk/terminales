
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TerminalSettingsFormProps {
  isActive: boolean;
  schedulesVisible: boolean;
  onActiveChange: (checked: boolean) => void;
  onSchedulesVisibleChange: (checked: boolean) => void;
}

const TerminalSettingsForm: React.FC<TerminalSettingsFormProps> = ({
  isActive,
  schedulesVisible,
  onActiveChange,
  onSchedulesVisibleChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configuración</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
};

export default TerminalSettingsForm;
