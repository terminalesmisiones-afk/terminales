
import React from 'react';
import { Target, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapControlsProps {
  onSearchLocation: () => void;
  onCenterMap: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  onSearchLocation,
  onCenterMap
}) => {
  return (
    <div className="flex gap-2 w-full sm:w-auto">
      <Button onClick={onSearchLocation} variant="outline" size="sm" className="w-full sm:w-auto">
        <Target className="h-4 w-4 mr-1" />
        Buscar en Mapa
      </Button>
      <Button onClick={onCenterMap} variant="outline" size="sm" className="w-full sm:w-auto">
        <Move className="h-4 w-4 mr-1" />
        Centrar
      </Button>
    </div>
  );
};

export default MapControls;
