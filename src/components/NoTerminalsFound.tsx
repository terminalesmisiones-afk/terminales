
import React from 'react';
import { Search } from 'lucide-react';

interface NoTerminalsFoundProps {
  searchQuery: string;
  selectedCity: string;
}

const NoTerminalsFound: React.FC<NoTerminalsFoundProps> = ({ searchQuery, selectedCity }) => {
  return (
    <div className="max-w-[1200px] mx-auto text-center py-12">
      <div className="text-gray-500">
        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No se encontraron terminales</h3>
        <p>Intenta con otros términos de búsqueda o selecciona otra ciudad.</p>
        {(searchQuery || selectedCity) && (
          <div className="mt-4 text-sm space-y-1">
            {searchQuery && <p>Búsqueda: "{searchQuery}"</p>}
            {selectedCity && <p>Ciudad: "{selectedCity}"</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoTerminalsFound;
