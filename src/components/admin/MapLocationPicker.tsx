
import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import InteractiveMapContainer from './InteractiveMapContainer';
import MapControls from './MapControls';
import MapCoordinateInputs from './MapCoordinateInputs';

interface MapLocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  city?: string;
  address?: string;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  city = '',
  address = ''
}) => {
  const [currentLat, setCurrentLat] = useState(latitude);
  const [currentLng, setCurrentLng] = useState(longitude);
  const [zoom, setZoom] = useState(15);

  useEffect(() => {
    // Sync local state when props change (e.g. from parent edit or initial load)
    setCurrentLat(latitude);
    setCurrentLng(longitude);
  }, [latitude, longitude]);

  // Propagate changes to parent
  useEffect(() => {
    if (currentLat !== latitude || currentLng !== longitude) {
      onLocationChange(currentLat, currentLng);
    }
  }, [currentLat, currentLng, latitude, longitude, onLocationChange]);

  const handleManualLatChange = (value: string) => {
    const lat = parseFloat(value);
    if (!isNaN(lat)) {
      setCurrentLat(lat);
    }
  };

  const handleManualLngChange = (value: string) => {
    const lng = parseFloat(value);
    if (!isNaN(lng)) {
      setCurrentLng(lng);
    }
  };

  const handleLeafletLocationChange = (lat: number, lng: number) => {
    setCurrentLat(lat);
    setCurrentLng(lng);
  };

  const searchLocation = async () => {
    try {
      const queries = [];
      if (address && city) queries.push(`${address}, ${city}, Misiones, Argentina`);
      if (city) {
        queries.push(`Terminal de Omnibus, ${city}, Misiones, Argentina`);
        queries.push(`Terminal ${city}, Misiones, Argentina`);
        queries.push(`${city}, Misiones, Argentina`);
      }
      queries.push('Misiones, Argentina');

      const uniqueQueries = [...new Set(queries)].filter(q => q.trim() !== '');

      console.log('Trying specific queries:', uniqueQueries);

      for (const query of uniqueQueries) {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
          const data = await response.json();

          if (data && data.length > 0) {
            const result = data[0];
            const newLat = parseFloat(result.lat);
            const newLng = parseFloat(result.lon);

            console.log(`Match found for "${query}":`, { newLat, newLng });

            setCurrentLat(newLat);
            setCurrentLng(newLng);
            setZoom(16);
            return;
          }
        } catch (err) {
          console.warn(`Search failed for "${query}"`, err);
        }
      }
      alert('No se pudo encontrar ninguna ubicación cercana. Intenta mover el mapa manualmente.');
    } catch (error) {
      console.error('Critical error in searchLocation:', error);
      alert('Error de conexión al buscar ubicación');
    }
  };

  const centerMap = () => {
    // Reset zoom or re-center if we had a "default" center stored, 
    // but for now just resetting zoom is okay, or we could pass a "force center" signal.
    setZoom(15);
  };

  // We don't need these anymore for Leaflet, passing defaults or ignoring
  const noOp = () => { };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-primary mr-2" />
          <div>
            <h3 className="font-medium text-gray-900">Seleccionar Ubicación Exacta</h3>
            <p className="text-sm text-gray-600">
              Arrastra el marcador rojo o haz clic en el mapa
            </p>
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

      <InteractiveMapContainer
        latitude={currentLat}
        longitude={currentLng}
        zoom={zoom}
        isDragging={false} // Not used by Leaflet impl
        onZoomIn={noOp} // Not used
        onZoomOut={noOp} // Not used
        onCenter={noOp} // Not used
        onMarkerMouseDown={noOp} // Not used
        onLeafletLocationChange={handleLeafletLocationChange}
      />
    </div>
  );
};

export default MapLocationPicker;
