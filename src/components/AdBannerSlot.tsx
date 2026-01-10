import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useBanners } from '@/hooks/useBanners';

// Custom hook for media queries
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener); // Fallback listener
    media.addEventListener('change', listener);
    return () => {
      window.removeEventListener('resize', listener);
      media.removeEventListener('change', listener);
    };
  }, [matches, query]);

  return matches;
}

interface AdBannerSlotProps {
  slot: string;
  type?: 'desktop' | 'mobile' | 'tablet';
  showOnMobile?: boolean;
  showOnTablet?: boolean;
  showOnDesktop?: boolean;
  className?: string;
}

const AdBannerSlot: React.FC<AdBannerSlotProps> = ({
  slot,
  type,
  showOnMobile = true,
  showOnTablet = true,
  showOnDesktop = true,
  className = ''
}) => {
  // Fetch ALL banners
  const { banners: fetchedBanners } = useBanners();

  // Media queries
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  // Find the Specific Banner for this Slot
  const banner = fetchedBanners.find(b => b.position === slot && b.isActive);

  // Checking visibility conditions
  const shouldShow = () => {
    if (!banner) return false;

    // Legacy mode (strict type passed)
    if (type) {
      if (type === 'mobile' && !showOnMobile) return false;
      if (type === 'tablet' && !showOnTablet) return false;
      if (type === 'desktop' && !showOnDesktop) return false;
      return true;
    }

    // Smart mode (check current device against banner config)
    if (isMobile && !banner.showOnMobile) return false;
    if (isTablet && !banner.showOnTablet) return false;
    if (isDesktop && !banner.showOnDesktop) return false;

    return true;
  };

  if (!shouldShow() || !banner) return null;

  // Clases CSS responsivas
  const getResponsiveClasses = () => {
    let classes = `overflow-hidden hover:shadow-lg transition-shadow cursor-pointer mb-4 ${className}`;

    if (type) {
      if (type === 'mobile') {
        classes += ' block sm:hidden h-auto w-full max-w-sm mx-auto';
      } else if (type === 'tablet') {
        classes += ' hidden sm:block lg:hidden h-auto w-full max-w-4xl mx-auto';
      } else { // desktop
        classes += ' hidden lg:block h-auto w-full max-w-6xl mx-auto';
      }
    } else {
      // Universal sizing defaults
      classes += ' h-auto w-full mx-auto max-w-6xl';
    }

    return classes;
  };

  return (
    <Card className={getResponsiveClasses()}>
      <CardContent className="p-0 h-full">
        <div className="relative h-full group flex justify-center items-center bg-gray-50">
          {banner.uploadType === 'html' ? (
            <div
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: banner.htmlCode || '' }}
            />
          ) : (
            <a
              href={banner.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full relative"
            >
              <img
                src={`${banner.imageUrl}?t=${new Date().getTime()}`}
                alt={banner.title}
                className="w-full h-auto max-h-[300px] object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdBannerSlot;
