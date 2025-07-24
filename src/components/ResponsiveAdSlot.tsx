import React from 'react';
import AdBannerSlot from './AdBannerSlot';

interface ResponsiveAdSlotProps {
  position: number;
  className?: string;
}

const ResponsiveAdSlot: React.FC<ResponsiveAdSlotProps> = ({ position, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Mobile Banner */}
      <div className="block sm:hidden">
        <AdBannerSlot 
          position={position} 
          type="mobile"
          showOnMobile={true}
          showOnTablet={false}
          showOnDesktop={false}
        />
      </div>
      
      {/* Tablet Banner */}
      <div className="hidden sm:block lg:hidden">
        <AdBannerSlot 
          position={position + 1} 
          type="tablet"
          showOnMobile={false}
          showOnTablet={true}
          showOnDesktop={false}
        />
      </div>
      
      {/* Desktop Banner */}
      <div className="hidden lg:block">
        <AdBannerSlot 
          position={position + 2} 
          type="desktop"
          showOnMobile={false}
          showOnTablet={false}
          showOnDesktop={true}
        />
      </div>
    </div>
  );
};

export default ResponsiveAdSlot;