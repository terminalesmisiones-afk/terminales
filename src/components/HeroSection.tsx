
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeroSectionProps {
  onSearch: (query: string, city: string) => void;
  onNearestTerminal: (latitude: number, longitude: number) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, onNearestTerminal }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, '');
  };

  return (
    <section className="relative bg-gradient-to-br from-primary to-secondary text-white py-16 md:py-24">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">
          Horarios de Ómnibus
          <br />
          <span className="text-yellow-300">Provincia de Misiones</span>
        </h1>
        <p className="text-lg md:text-xl mb-12 text-white/90 max-w-3xl mx-auto">
          Encuentra información actualizada sobre todas las terminales de ómnibus, 
          horarios de salida y llegada, y planifica tu viaje de manera fácil y rápida.
        </p>

        <div className="max-w-2xl mx-auto">
          {/* Buscador */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por ciudad"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-base bg-white/95 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 w-full text-sm sm:text-base"
              />
            </div>
            
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-3 rounded-lg font-semibold w-full sm:w-auto text-sm sm:text-base"
            >
              Buscar
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
