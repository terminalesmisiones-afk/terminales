
import React from 'react';
import { TerminalsGridProps } from '@/types/terminal';
import { useFilteredTerminals } from '@/hooks/useFilteredTerminals';
import TerminalsList from './TerminalsList';
import NoTerminalsFound from './NoTerminalsFound';

const TerminalsGrid: React.FC<TerminalsGridProps> = ({ searchQuery = '', selectedCity = '' }) => {
  const filteredTerminals = useFilteredTerminals(searchQuery, selectedCity);

  if (filteredTerminals.length === 0) {
    return <NoTerminalsFound searchQuery={searchQuery} selectedCity={selectedCity} />;
  }

  return <TerminalsList terminals={filteredTerminals} />;
};

export default TerminalsGrid;
