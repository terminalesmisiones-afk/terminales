
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AdBannerSlotProps {
  position: number;
  type: 'desktop' | 'mobile' | 'tablet';
  showOnMobile?: boolean;
  showOnTablet?: boolean;  
  showOnDesktop?: boolean;
}

const AdBannerSlot: React.FC<AdBannerSlotProps> = ({ 
  position, 
  type,
  showOnMobile = true,
  showOnTablet = true,
  showOnDesktop = true 
}) => {
  // En producción, estos banners vendrían de la API/base de datos
  // filtrados por posición, tipo de dispositivo y estado activo
  const banners = [
    {
      id: 1,
      title: 'Restaurante El Buen Sabor',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=300&fit=crop',
      link: '#',
      description: 'La mejor comida casera a pasos de la terminal'
    },
    {
      id: 2,
      title: 'Hotel Terminal Plaza',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=300&fit=crop',
      link: '#',
      description: 'Hospedaje cómodo y accesible para viajeros'
    },
    {
      id: 3,
      title: 'Farmacia 24hs',
      image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&h=300&fit=crop',
      link: '#',
      description: 'Medicamentos y primeros auxilios las 24 horas'
    }
  ];

  const banner = banners[position % banners.length];

  // Verificar si el banner debe mostrarse en este dispositivo
  const shouldShow = () => {
    if (type === 'mobile' && !showOnMobile) return false;
    if (type === 'tablet' && !showOnTablet) return false;
    if (type === 'desktop' && !showOnDesktop) return false;
    return true;
  };

  if (!shouldShow()) return null;

  // Clases CSS responsivas basadas en el tipo y configuración
  const getResponsiveClasses = () => {
    let classes = 'overflow-hidden hover:shadow-lg transition-shadow cursor-pointer';
    
    if (type === 'mobile') {
      classes += ' block sm:hidden h-32 w-full max-w-sm mx-auto';
    } else if (type === 'tablet') {
      classes += ' hidden sm:block lg:hidden h-28 w-full max-w-4xl mx-auto';
    } else { // desktop
      classes += ' hidden lg:block h-32 xl:h-40 w-full max-w-6xl mx-auto';
    }
    
    return classes;
  };

  return (
    <Card className={getResponsiveClasses()}>
      <CardContent className="p-0 h-full">
        <div className="relative h-full group">
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="p-2 sm:p-4 text-white">
              <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1">{banner.title}</h3>
              <p className="text-xs sm:text-sm lg:text-base text-white/90 hidden sm:block">
                {banner.description}
              </p>
            </div>
          </div>
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
            <span className="bg-black/20 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded">
              Publicidad
            </span>
          </div>
          {/* Dimensiones recomendadas como comentario informativo */}
          <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-black/40 text-white text-xs px-1 py-0.5 rounded">
              {type === 'mobile' ? 'Móvil: 400x250px' : type === 'tablet' ? 'Tablet: 800x200px' : 'Desktop: 1200x300px'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdBannerSlot;
