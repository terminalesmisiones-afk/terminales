import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import SearchAutocomplete from './SearchAutocomplete';

interface HeroSectionProps {
  onSearch: (query: string, city: string) => void;
  onNearestTerminal: (latitude: number, longitude: number) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, onNearestTerminal }) => {
  // Autocomplete handles state internally now


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
          {/* Autocomplete Search */}
          <div className="relative z-10">
            <SearchAutocomplete onSearch={onSearch} />
            <div className="mt-8">
              <Link to="/publicidad" className="inline-flex items-center gap-2 text-white/90 hover:text-white hover:underline transition-all">
                <TrendingUp className="h-5 w-5" />
                <span>¿Tenes una empresa? Publicitá acá</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
