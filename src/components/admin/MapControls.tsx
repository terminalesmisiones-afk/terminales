
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
    <div className="flex gap-2">
      <Button onClick={onSearchLocation} variant="outline" size="sm">
        <Target className="h-4 w-4 mr-1" />
        Buscar San Vicente
      </Button>
      <Button onClick={onCenterMap} variant="outline" size="sm">
        <Move className="h-4 w-4 mr-1" />
        Centrar
      </Button>
    </div>
  );
};

export default MapControls;
