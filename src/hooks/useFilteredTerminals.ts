
import React, { useState, useEffect } from 'react';
import { Terminal } from '@/types/terminal';
import { usePublicTerminals } from '@/hooks/usePublicTerminals';
import { filterTerminals } from '@/utils/terminalUtils';

export const useFilteredTerminals = (searchQuery: string, selectedCity: string) => {
  const { terminals: allTerminals, loading, error } = usePublicTerminals();
  const [filteredTerminals, setFilteredTerminals] = useState<Terminal[]>([]);

  useEffect(() => {
    // Always filter, even if empty, to ensure state consistency
    if (allTerminals) {
      console.log('Filtrando terminales con:', { searchQuery, selectedCity });
      const filtered = filterTerminals(allTerminals, searchQuery, selectedCity);
      console.log('Terminales filtradas:', filtered.length);
      setFilteredTerminals(filtered);
    }
  }, [searchQuery, selectedCity, allTerminals]);

  return { terminals: filteredTerminals, loading, error };
};
