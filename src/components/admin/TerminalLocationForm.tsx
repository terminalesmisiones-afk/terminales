
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapLocationPicker from './MapLocationPicker';

interface TerminalLocationFormProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  city?: string;
  address?: string;
}

const TerminalLocationForm: React.FC<TerminalLocationFormProps> = ({
  latitude,
  longitude,
  onLocationChange,
  city,
  address
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
          city={city}
          address={address}
        />
      </CardContent>
    </Card>
  );
};

export default TerminalLocationForm;
