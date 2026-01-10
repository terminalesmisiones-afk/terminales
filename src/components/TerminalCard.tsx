
import React from 'react';
import { Clock, MapPin, Phone, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface TerminalCardProps {
  id: string;
  name: string;
  city: string;
  address: string;
  image: string;
  phone?: string;
  isActive: boolean;
  schedulesVisible: boolean;
  companyCount: number;
  lastUpdated: string;
  onViewSchedules: (id: string) => void;
  onShare: (id: string, platform: 'whatsapp' | 'facebook' | 'telegram') => void;
}

// Componente SVG optimizado del ícono oficial de WhatsApp
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
);

const TerminalCard: React.FC<TerminalCardProps> = ({
  id,
  name,
  city,
  address,
  image,
  phone,
  isActive,
  schedulesVisible,
  companyCount,
  lastUpdated,
  onViewSchedules,
  onShare
}) => {
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Actualizado hoy';
    if (diffDays === 2) return 'Actualizado ayer';
    if (diffDays <= 7) return `Actualizado hace ${diffDays} días`;
    return `Última actualización: ${date.toLocaleDateString()}`;
  };

  const getUpdateStatus = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Verde por 7 días en lugar de 3
    if (diffDays <= 7) return 'recent'; // Verde por 7 días
    if (diffDays <= 14) return 'moderate'; // Amarillo
    return 'outdated'; // Rojo
  };

  const updateStatus = getUpdateStatus(lastUpdated);
  const statusColor = {
    recent: 'text-green-600',
    moderate: 'text-yellow-600',
    outdated: 'text-red-600'
  }[updateStatus];

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative cursor-pointer" onClick={() => onViewSchedules(id)}>
          <div className="relative w-full h-48 lg:h-56 overflow-hidden bg-gray-100">
            <img
              src={image}
              alt={`Terminal ${name}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop&auto=format&q=80';
              }}
            />
          </div>
          <div className="absolute top-3 left-3">
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={`${isActive ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-500 text-white'} px-3 py-1 text-sm font-medium`}
            >
              {isActive ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge
              variant="outline"
              className="bg-white/95 text-gray-700 border-gray-300 px-3 py-1 text-sm backdrop-blur-sm"
            >
              {schedulesVisible ? (
                <><Eye className="h-3 w-3 mr-1" /> Horarios visibles</>
              ) : (
                <><EyeOff className="h-3 w-3 mr-1" /> Horarios ocultos</>
              )}
            </Badge>
          </div>
          {/* Overlay para indicar que es clickeable */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="bg-white/95 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg backdrop-blur-sm">
              <ExternalLink className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent
        className="p-4 lg:p-6 cursor-pointer relative"
        onClick={() => onViewSchedules(id)}
      >
        <div className="space-y-4">
          {/* Título y ciudad */}
          <div>
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors mb-1">
              Terminal {name}
            </h3>
            <p className="text-sm lg:text-base font-medium text-primary">{city}</p>
          </div>

          {/* Dirección */}
          <div className="flex items-start text-sm lg:text-base text-gray-600">
            <MapPin className="h-4 w-4 lg:h-5 lg:w-5 mr-3 mt-0.5 flex-shrink-0 text-primary" />
            <span className="line-clamp-2 leading-relaxed">{address}</span>
          </div>

          {/* Teléfono */}
          {phone && (
            <div className="flex items-center text-sm lg:text-base text-gray-600">
              <Phone className="h-4 w-4 lg:h-5 lg:w-5 mr-3 flex-shrink-0 text-primary" />
              <span>{phone}</span>
            </div>
          )}

          {/* Información adicional */}
          <div className="flex items-center justify-between text-xs lg:text-sm pt-3 border-t border-gray-100">
            <span className="text-gray-500 font-medium">{companyCount} empresas</span>
            <span className={`flex items-center ${statusColor} font-medium`}>
              <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
              {formatLastUpdated(lastUpdated)}
            </span>
          </div>

          {/* Main Action Button - embedded in content visually or just removed if card is clickable? 
              User generally likes buttons. Let's keep the button but maybe inside content or just omit footer.
              Wait, if I remove CardFooter, I lose the main button too.
              The user said "sacar esa función [compartir]". 
              Let's keep the main "Ver Horarios" button but remove the share icons below it.
          */}
        </div>
      </CardContent>

      <CardFooter className="p-4 lg:p-6 pt-0">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewSchedules(id);
          }}
          className="w-full bg-primary hover:bg-primary-600 text-white text-sm lg:text-base py-3 lg:py-4 shadow-sm hover:shadow-md transition-all"
          disabled={!schedulesVisible}
        >
          <ExternalLink className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
          {schedulesVisible ? 'Ver Horarios' : 'Horarios no disponibles'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TerminalCard;
