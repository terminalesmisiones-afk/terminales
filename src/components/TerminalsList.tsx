
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal } from '@/types/terminal';
import TerminalCard from './TerminalCard';
import AdBannerSlot from './AdBannerSlot';

interface TerminalsListProps {
  terminals: Terminal[];
  adSlotPrefix?: string;
}

const TerminalsList: React.FC<TerminalsListProps> = ({ terminals, adSlotPrefix = 'home-grid' }) => {
  const navigate = useNavigate();

  // ... (handlers remain same)

  const handleViewSchedules = (id: string) => {
    navigate(`/terminal/${id}`);
  };

  const handleShare = (id: string, platform: 'whatsapp' | 'facebook' | 'telegram') => {
    // ... same logic ...
    const terminal = terminals.find(t => t.id === id);
    if (!terminal) return;

    const url = `${window.location.origin}/terminal/${id}`;
    const text = `Terminal de Ómnibus ${terminal.name}\n${terminal.address}\n\n¡Consulta todos los horarios actualizados!`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}\n${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
    }
  };

  const renderTerminalsWithAds = () => {
    const elements: JSX.Element[] = [];

    terminals.forEach((terminal, index) => {
      elements.push(
        <TerminalCard
          key={terminal.id}
          id={terminal.id}
          name={terminal.name}
          city={terminal.city}
          address={terminal.address}
          image={terminal.image}
          phone={terminal.phone}
          isActive={terminal.isActive}
          schedulesVisible={terminal.schedulesVisible}
          companyCount={terminal.companyCount}
          lastUpdated={terminal.lastUpdated}
          onViewSchedules={handleViewSchedules}
          onShare={handleShare}
        />
      );

      // Insert Granular Banners after EACH terminal
      // Position is 1-based index (Post-Terminal 1 = Pos 1)
      const pos = index + 1;

      elements.push(
        <React.Fragment key={`ad-granular-${pos}`}>
          {/* 1. Card Layout Ad (Flows in grid) */}
          <AdBannerSlot slot={`${adSlotPrefix}-pos-${pos}-card`} />

          {/* 2. Full Width Ad (Breaks grid) */}
          <AdBannerSlot slot={`${adSlotPrefix}-pos-${pos}-wide`} className="col-span-full" />
        </React.Fragment>
      );
    });

    return elements;
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderTerminalsWithAds()}
      </div>
    </div>
  );
};

export default TerminalsList;
