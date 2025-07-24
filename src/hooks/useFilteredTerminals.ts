
import { useState, useEffect } from 'react';
import { Terminal } from '@/types/terminal';
import { useSupabaseTerminals } from '@/hooks/useSupabaseTerminals';
import { filterTerminals } from '@/utils/terminalUtils';

export const useFilteredTerminals = (searchQuery: string, selectedCity: string) => {
  const { terminals: allTerminals, loading, error } = useSupabaseTerminals();
  const [filteredTerminals, setFilteredTerminals] = useState<Terminal[]>([]);

  useEffect(() => {
    if (!loading && !error) {
      console.log('Filtrando terminales con:', { searchQuery, selectedCity });
      const filtered = filterTerminals(allTerminals, searchQuery, selectedCity);
      console.log('Terminales filtradas:', filtered.length, filtered);
      setFilteredTerminals(filtered);
    }
  }, [searchQuery, selectedCity, allTerminals, loading, error]);

  return filteredTerminals;
};
