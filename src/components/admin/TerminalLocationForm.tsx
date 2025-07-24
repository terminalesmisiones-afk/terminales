
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapLocationPicker from './MapLocationPicker';

interface TerminalLocationFormProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const TerminalLocationForm: React.FC<TerminalLocationFormProps> = ({
  latitude,
  longitude,
  onLocationChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Seleccionar Ubicación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MapLocationPicker
          latitude={latitude}
          longitude={longitude}
          onLocationChange={onLocationChange}
        />
      </CardContent>
    </Card>
  );
};

export default TerminalLocationForm;
