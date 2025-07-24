
import React from 'react';

interface MapZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
}

const MapZoomControls: React.FC<MapZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter
}) => {
  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
      <button 
        className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg hover:bg-white hover:scale-105 transition-all border" 
        onClick={onZoomIn}
        title="Acercar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="21 21l-4.35-4.35"></path>
          <line x1="8" y1="11" x2="14" y2="11"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
        </svg>
      </button>
      <button 
        className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg hover:bg-white hover:scale-105 transition-all border" 
        onClick={onZoomOut}
        title="Alejar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="21 21l-4.35-4.35"></path>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button 
        className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg hover:bg-white hover:scale-105 transition-all border" 
        onClick={onCenter}
        title="Centrar en ubicación"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6"></path>
          <path d="m21 12-6 0m-6 0-6 0"></path>
        </svg>
      </button>
    </div>
  );
};

export default MapZoomControls;
