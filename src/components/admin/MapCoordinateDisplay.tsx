
import React from 'react';

interface MapCoordinateDisplayProps {
  latitude: number;
  longitude: number;
  isDragging: boolean;
}

const MapCoordinateDisplay: React.FC<MapCoordinateDisplayProps> = ({
  latitude,
  longitude,
  isDragging
}) => {
  return (
    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-20 border">
      <div className="text-xs text-gray-600 mb-1 font-medium">📍 Ubicación Seleccionada</div>
      <div className="text-xs font-mono text-blue-600">Lat: {latitude.toFixed(6)}</div>
      <div className="text-xs font-mono text-blue-600">Lng: {longitude.toFixed(6)}</div>
      {isDragging ? (
        <div className="text-xs text-green-600 mt-1 font-medium">⚡ Arrastrando...</div>
      ) : (
        <div className="text-xs text-gray-500 mt-1">Arrastra el marcador rojo</div>
      )}
    </div>
  );
};

export default MapCoordinateDisplay;
