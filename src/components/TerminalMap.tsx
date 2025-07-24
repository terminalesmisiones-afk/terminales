
import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface TerminalMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

const TerminalMap: React.FC<TerminalMapProps> = ({ latitude, longitude, name, address }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Crear el contenedor del mapa
    const mapContainer = mapRef.current;
    mapContainer.innerHTML = `
      <div class="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          style="border: 0;"
          src="https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}"
          allowfullscreen
        ></iframe>
        <div class="absolute top-2 right-2 bg-white p-2 rounded shadow-lg">
          <a 
            href="https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
            Ver en mapa completo
          </a>
        </div>
      </div>
    `;
  }, [latitude, longitude, name, address]);

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <MapPin className="h-5 w-5 text-primary mr-2" />
        <div>
          <h3 className="font-medium text-gray-900">Ubicación</h3>
          <p className="text-sm text-gray-600">{address}</p>
        </div>
      </div>
      <div ref={mapRef}></div>
    </div>
  );
};

export default TerminalMap;
