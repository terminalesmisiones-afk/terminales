
import React from 'react';

interface MapDraggableMarkerProps {
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

const MapDraggableMarker: React.FC<MapDraggableMarkerProps> = ({
  isDragging,
  onMouseDown
}) => {
  return (
    <div 
      className={`absolute z-30 cursor-move transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 active:scale-95 ${
        isDragging ? 'scale-110' : 'scale-100'
      }`}
      style={{ left: '50%', top: '50%' }}
      title="Arrastra para cambiar la ubicación"
      onMouseDown={onMouseDown}
    >
      <div className="relative">
        {/* Pin principal */}
        <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        {/* Sombra del pin */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-black/20 rounded-full blur-sm"></div>
        {/* Indicador de que es arrastrable */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default MapDraggableMarker;
