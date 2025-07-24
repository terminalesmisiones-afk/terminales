
import React from 'react';

const MapInstructions: React.FC = () => {
  return (
    <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-20 border">
      <div className="text-sm text-gray-700 text-center font-medium">
        🎯 Arrastra el marcador rojo: posiciónalo exactamente donde está la terminal.
      </div>
    </div>
  );
};

export default MapInstructions;
