
import React, { useEffect, useRef } from 'react';
import MapCoordinateDisplay from './MapCoordinateDisplay';
import MapZoomControls from './MapZoomControls';
import MapDraggableMarker from './MapDraggableMarker';
import MapInstructions from './MapInstructions';

interface InteractiveMapContainerProps {
  latitude: number;
  longitude: number;
  zoom: number;
  isDragging: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
  onMarkerMouseDown: (e: React.MouseEvent) => void;
}

const InteractiveMapContainer: React.FC<InteractiveMapContainerProps> = ({
  latitude,
  longitude,
  zoom,
  isDragging,
  onZoomIn,
  onZoomOut,
  onCenter,
  onMarkerMouseDown
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const iframe = mapRef.current.querySelector('#location-map') as HTMLIFrameElement;
    if (iframe) {
      const zoomFactor = Math.pow(2, 15 - zoom);
      const bbox = zoomFactor * 0.01;
      iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - bbox},${latitude - bbox},${longitude + bbox},${latitude + bbox}&layer=mapnik`;
    }
  }, [latitude, longitude, zoom]);

  return (
    <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
      <iframe
        id="location-map"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik`}
        allowFullScreen
      />
      
      <MapCoordinateDisplay 
        latitude={latitude} 
        longitude={longitude} 
        isDragging={isDragging} 
      />
      
      <MapDraggableMarker 
        isDragging={isDragging}
        onMouseDown={onMarkerMouseDown}
      />
      
      <MapZoomControls 
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onCenter={onCenter}
      />
      
      <MapInstructions />
      
      <div ref={mapRef} className="hidden" />
    </div>
  );
};

export default InteractiveMapContainer;
