
import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface InteractiveMapContainerProps {
  latitude: number;
  longitude: number;
  zoom: number;
  isDragging: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
  onMarkerMouseDown: (e: React.MouseEvent) => void;
  // New prop to communicate back to parent from Leaflet interactions
  onLeafletLocationChange?: (lat: number, lng: number) => void;
}

// Component to update map view when props change
const MapUpdater: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Component to handle marker dragging
const DraggableMarker: React.FC<{
  position: [number, number],
  onChange: (lat: number, lng: number) => void
}> = ({ position, onChange }) => {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onChange(lat, lng);
        }
      },
    }),
    [onChange],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
};

// Component to handle map clicks
const MapClickHandler: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};


const InteractiveMapContainer: React.FC<InteractiveMapContainerProps> = ({
  latitude,
  longitude,
  zoom,
  onLeafletLocationChange
}) => {
  // If no change handler provided, we can't do much interactive stuff safely, but assuming we have it.
  // We need to inject this handler from the parent. Since we are refactoring, we might need to update parent to pass this.
  // For now, let's assume parent passes `onLeafletLocationChange`.
  // Wait, the parent `MapLocationPicker` passes `onLocationChange` to `InteractiveMapContainer`? No, it didn't before.
  // I need to update `MapLocationPicker` to pass the change handler to this container.

  // But for this step, I am just rewriting this component. I will add the prop to the interface above.

  const handleLocationChange = (lat: number, lng: number) => {
    if (onLeafletLocationChange) {
      onLeafletLocationChange(lat, lng);
    } else {
      console.warn('onLeafletLocationChange not provided to InteractiveMapContainer');
    }
  };

  return (
    <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 z-0">
      <MapContainer
        center={[latitude || -27.367, longitude || -55.896]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true} // Allow zooming with wheel
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={[latitude, longitude]} zoom={zoom} />

        <DraggableMarker
          position={[latitude, longitude]}
          onChange={handleLocationChange}
        />

        <MapClickHandler onClick={handleLocationChange} />

      </MapContainer>
    </div>
  );
};

export default InteractiveMapContainer;
