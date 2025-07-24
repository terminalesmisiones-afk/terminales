
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

    // Clear previous content safely
    const mapContainer = mapRef.current;
    mapContainer.innerHTML = '';

    // Validate and sanitize coordinates
    const lat = parseFloat(latitude.toString());
    const lng = parseFloat(longitude.toString());
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates provided');
      return;
    }

    // Create container div
    const containerDiv = document.createElement('div');
    containerDiv.className = 'relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden';

    // Create iframe safely
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = '0';
    iframe.setAttribute('allowfullscreen', 'true');
    
    const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

    // Create overlay div
    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'absolute top-2 right-2 bg-white p-2 rounded shadow-lg';

    // Create link safely
    const link = document.createElement('a');
    link.href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'text-sm text-blue-600 hover:text-blue-800 flex items-center';

    // Create SVG icon
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'w-4 h-4 mr-1');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('viewBox', '0 0 24 24');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14');

    svg.appendChild(path);
    link.appendChild(svg);
    link.appendChild(document.createTextNode('Ver en mapa completo'));

    // Assemble the DOM structure
    overlayDiv.appendChild(link);
    containerDiv.appendChild(iframe);
    containerDiv.appendChild(overlayDiv);
    mapContainer.appendChild(containerDiv);
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
