
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal } from '@/types/terminal';
import TerminalCard from './TerminalCard';
import AdBannerSlot from './AdBannerSlot';

interface TerminalsListProps {
  terminals: Terminal[];
}

const TerminalsList: React.FC<TerminalsListProps> = ({ terminals }) => {
  const navigate = useNavigate();

  const handleViewSchedules = (id: string) => {
    navigate(`/terminal/${id}`);
  };

  const handleShare = (id: string, platform: 'whatsapp' | 'facebook' | 'telegram') => {
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

      if ((index + 1) % 3 === 0 && index < terminals.length - 1) {
        const bannerIndex = Math.floor(index / 3);
        elements.push(
          <div key={`ad-${index}`} className="col-span-full space-y-4">
            <AdBannerSlot position={bannerIndex} type="desktop" />
            <AdBannerSlot position={bannerIndex + 1} type="mobile" />
          </div>
        );
      }
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
