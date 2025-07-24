
import React from 'react';
import { MapPin, Clock, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TerminalHeaderProps {
  terminal: {
    name: string;
    address: string;
    image: string;
    isActive: boolean;
    lastUpdated: string;
    companyCount: number;
  };
}

const TerminalHeader: React.FC<TerminalHeaderProps> = ({ terminal }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="relative h-80">
        {/* Fondo base con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-600 to-primary-700"></div>
        
        {/* Imagen de fondo con overlay y blend mode */}
        {terminal.image && (
          <div className="absolute inset-0">
            <img 
              src={terminal.image} 
              alt={terminal.name}
              className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/80 via-primary-600/60 to-primary-700/80"></div>
          </div>
        )}
        
        {/* Elementos decorativos mejorados */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Círculos de gradiente grandes */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-radial from-white/20 via-white/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-radial from-accent-500/30 via-accent-600/10 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-white/10 via-white/5 to-transparent rounded-full blur-xl"></div>
          
          {/* Círculos pequeños flotantes */}
          <div className="absolute top-16 right-32 w-24 h-24 bg-white/10 rounded-full blur-sm animate-pulse"></div>
          <div className="absolute bottom-20 left-16 w-16 h-16 bg-secondary-500/20 rounded-full blur-sm"></div>
          <div className="absolute top-32 left-1/4 w-12 h-12 bg-accent-500/30 rounded-full blur-sm animate-pulse"></div>
          
          {/* Patrón geométrico sutil mejorado */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-repeat" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Ccircle cx='60' cy='60' r='50' opacity='0.3'/%3E%3Ccircle cx='60' cy='60' r='25' opacity='0.2'/%3E%3Cpath d='M60 10v100M10 60h100' opacity='0.1'/%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          {/* Overlay con gradiente suave */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 via-transparent to-primary-900/20"></div>
        </div>
        
        {/* Contenido del header */}
        <div className="relative h-full flex items-end p-4 sm:p-6 lg:p-8 z-10">
          <div className="text-white w-full">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2 sm:gap-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-bold drop-shadow-2xl tracking-tight break-words">
                    {terminal.name}
                  </h1>
                  <Badge variant="secondary" className="bg-green-500/90 text-white border-0 backdrop-blur-sm shadow-lg self-start sm:self-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></div>
                      {terminal.isActive ? 'Activa' : 'Inactiva'}
                    </div>
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-white/95">
                  <div className="flex items-center backdrop-blur-sm bg-white/10 rounded-lg p-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-white/90 flex-shrink-0" />
                    <span className="drop-shadow-sm font-medium text-sm sm:text-base break-words">{terminal.address}</span>
                  </div>
                  <div className="flex items-center backdrop-blur-sm bg-white/10 rounded-lg p-3">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-white/90 flex-shrink-0" />
                    <span className="drop-shadow-sm font-medium text-xs sm:text-sm">Actualizado: {terminal.lastUpdated}</span>
                  </div>
                  <div className="flex items-center backdrop-blur-sm bg-white/10 rounded-lg p-3 sm:col-span-2 lg:col-span-1">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-white/90 flex-shrink-0" />
                    <span className="drop-shadow-sm font-medium text-sm sm:text-base">{terminal.companyCount} empresas disponibles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalHeader;
