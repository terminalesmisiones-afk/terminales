
import React from 'react';
import { Target } from 'lucide-react';

const MapInstructionsPanel: React.FC = () => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Target className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-1">Instrucciones de Uso</h4>
          <p className="text-sm text-blue-700">
            <strong>Arrastra el marcador rojo:</strong> Posiciónalo exactamente donde está la terminal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapInstructionsPanel;
