
import { useState, useEffect } from 'react';
import { Terminal } from '@/types/terminal';
import { useTerminals } from '@/hooks/useTerminals';
import { filterTerminals } from '@/utils/terminalUtils';

export const useFilteredTerminals = (searchQuery: string, selectedCity: string) => {
  const allTerminals = useTerminals();
  const [filteredTerminals, setFilteredTerminals] = useState<Terminal[]>(allTerminals);

  useEffect(() => {
    console.log('Filtrando terminales con:', { searchQuery, selectedCity });
    const filtered = filterTerminals(allTerminals, searchQuery, selectedCity);
    console.log('Terminales filtradas:', filtered.length, filtered);
    setFilteredTerminals(filtered);
  }, [searchQuery, selectedCity, allTerminals]);

  return filteredTerminals;
};
