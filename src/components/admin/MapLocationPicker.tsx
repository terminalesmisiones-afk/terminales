
import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import InteractiveMapContainer from './InteractiveMapContainer';
import MapControls from './MapControls';
import MapCoordinateInputs from './MapCoordinateInputs';
import MapInstructionsPanel from './MapInstructionsPanel';

interface MapLocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange
}) => {
  const [currentLat, setCurrentLat] = useState(latitude);
  const [currentLng, setCurrentLng] = useState(longitude);
  const [zoom, setZoom] = useState(15);
  const [isDragging, setIsDragging] = useState(false);
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentLat(latitude);
    setCurrentLng(longitude);
  }, [latitude, longitude]);

  // Map interaction handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const mapContainer = document.querySelector('.relative.w-full.h-80') as HTMLElement;
      if (!mapContainer) return;
      
      const rect = mapContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const clampedX = Math.max(0, Math.min(x, rect.width));
      const clampedY = Math.max(0, Math.min(y, rect.height));
      
      const draggableMarker = mapContainer.querySelector('[title="Arrastra para cambiar la ubicación"]') as HTMLElement;
      if (draggableMarker) {
        draggableMarker.style.left = `${clampedX}px`;
        draggableMarker.style.top = `${clampedY}px`;
      }
      
      const { lat, lng } = pixelsToCoords(clampedX, clampedY, rect, currentLat, currentLng, zoom);
      console.log('Arrastrando marcador a:', { lat, lng, x: clampedX, y: clampedY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const mapContainer = document.querySelector('.relative.w-full.h-80') as HTMLElement;
      if (!mapContainer) return;
      
      const rect = mapContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const clampedX = Math.max(0, Math.min(x, rect.width));
      const clampedY = Math.max(0, Math.min(y, rect.height));
      
      const { lat, lng } = pixelsToCoords(clampedX, clampedY, rect, currentLat, currentLng, zoom);
      
      console.log('Marcador posicionado en:', { lat, lng });
      
      setCurrentLat(lat);
      setCurrentLng(lng);
      setIsDragging(false);
      onLocationChange(lat, lng);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, currentLat, currentLng, zoom, onLocationChange]);

  const pixelsToCoords = (x: number, y: number, rect: DOMRect, lat: number, lng: number, currentZoom: number) => {
    const mapWidth = rect.width;
    const mapHeight = rect.height;
    
    const zoomFactor = Math.pow(2, 15 - currentZoom);
    const latRange = 0.02 * zoomFactor;
    const lngRange = 0.02 * zoomFactor;
    
    const newLng = (lng - lngRange / 2) + (x / mapWidth) * lngRange;
    const newLat = (lat + latRange / 2) - (y / mapHeight) * latRange;
    
    return { lat: newLat, lng: newLng };
  };

  const handleMarkerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    console.log('Iniciando arrastre del marcador');
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 1, 18);
    setZoom(newZoom);
    console.log('Zoom in:', newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 1, 10);
    setZoom(newZoom);
    console.log('Zoom out:', newZoom);
  };

  const handleCenterMap = () => {
    const mapContainer = document.querySelector('.relative.w-full.h-80') as HTMLElement;
    const draggableMarker = mapContainer?.querySelector('[title="Arrastra para cambiar la ubicación"]') as HTMLElement;
    if (draggableMarker) {
      draggableMarker.style.left = '50%';
      draggableMarker.style.top = '50%';
    }
    console.log('Centrar mapa');
  };

  const handleManualLatChange = (value: string) => {
    const lat = parseFloat(value);
    if (!isNaN(lat)) {
      setCurrentLat(lat);
      onLocationChange(lat, currentLng);
    }
  };

  const handleManualLngChange = (value: string) => {
    const lng = parseFloat(value);
    if (!isNaN(lng)) {
      setCurrentLng(lng);
      onLocationChange(currentLat, lng);
    }
  };

  const searchLocation = async () => {
    try {
      const query = `San Vicente, Misiones, Argentina`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);
        
        console.log('Ubicación encontrada:', { newLat, newLng });
        
        setCurrentLat(newLat);
        setCurrentLng(newLng);
        setZoom(16);
        onLocationChange(newLat, newLng);
      }
    } catch (error) {
      console.error('Error buscando ubicación:', error);
    }
  };

  const centerMap = () => {
    setZoom(15);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-primary mr-2" />
          <div>
            <h3 className="font-medium text-gray-900">Seleccionar Ubicación Exacta</h3>
            <p className="text-sm text-gray-600">Arrastra el marcador rojo para posicionar la terminal exactamente</p>
          </div>
        </div>
        <MapControls
          onSearchLocation={searchLocation}
          onCenterMap={centerMap}
        />
      </div>
      
      <MapCoordinateInputs
        latitude={currentLat}
        longitude={currentLng}
        onLatitudeChange={handleManualLatChange}
        onLongitudeChange={handleManualLngChange}
      />
      
      <MapInstructionsPanel />
      
      <InteractiveMapContainer
        latitude={currentLat}
        longitude={currentLng}
        zoom={zoom}
        isDragging={isDragging}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={handleCenterMap}
        onMarkerMouseDown={handleMarkerMouseDown}
      />
    </div>
  );
};

export default MapLocationPicker;
