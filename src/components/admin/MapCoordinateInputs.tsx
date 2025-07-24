
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MapCoordinateInputsProps {
  latitude: number;
  longitude: number;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
}

const MapCoordinateInputs: React.FC<MapCoordinateInputsProps> = ({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="manual-lat">Latitud</Label>
        <Input
          id="manual-lat"
          type="number"
          step="any"
          value={latitude.toFixed(6)}
          onChange={(e) => onLatitudeChange(e.target.value)}
          placeholder="Ej: -26.123456"
        />
      </div>
      <div>
        <Label htmlFor="manual-lng">Longitud</Label>
        <Input
          id="manual-lng"
          type="number"
          step="any"
          value={longitude.toFixed(6)}
          onChange={(e) => onLongitudeChange(e.target.value)}
          placeholder="Ej: -54.123456"
        />
      </div>
    </div>
  );
};

export default MapCoordinateInputs;
