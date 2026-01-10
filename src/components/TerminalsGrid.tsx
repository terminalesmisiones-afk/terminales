
import React from 'react';
import { TerminalsGridProps } from '@/types/terminal';
import { useFilteredTerminals } from '@/hooks/useFilteredTerminals';
import TerminalsList from './TerminalsList';
import NoTerminalsFound from './NoTerminalsFound';

const TerminalsGrid: React.FC<TerminalsGridProps> = ({ searchQuery = '', selectedCity = '', adSlotPrefix = 'home-grid' }) => {
  const { terminals: filteredTerminals, loading, error } = useFilteredTerminals(searchQuery, selectedCity);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500">Cargando terminales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <p className="text-sm mt-2">Por favor, verifica tu conexión a internet o intenta más tarde.</p>
      </div>
    );
  }

  if (filteredTerminals.length === 0) {
    return <NoTerminalsFound searchQuery={searchQuery} selectedCity={selectedCity} />;
  }

  return <TerminalsList terminals={filteredTerminals} adSlotPrefix={adSlotPrefix} />;
};

export default TerminalsGrid;
