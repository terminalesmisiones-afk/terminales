
import { useState, useEffect, useCallback } from 'react';
import { Terminal } from '@/types/terminal';
import { countUniqueCompanies, getDefaultTerminals } from '@/utils/terminalUtils';

export const useTerminals = () => {
  const getTerminals = useCallback((): Terminal[] => {
    try {
      const storedTerminals = localStorage.getItem('terminals');
      if (storedTerminals) {
        const parsed = JSON.parse(storedTerminals);
        console.log('Terminales cargadas desde localStorage:', parsed);
        
        return parsed.map((terminal: any) => {
          const schedules = terminal.schedules || [];
          const realCompanyCount = countUniqueCompanies(schedules);
          
          // Asegurar que el ID sea string para consistencia
          return {
            id: terminal.id.toString(),
            name: terminal.name,
            city: terminal.city,
            address: terminal.address,
            image: terminal.image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
            phone: terminal.phone,
            isActive: terminal.isActive,
            schedulesVisible: terminal.schedulesVisible,
            companyCount: realCompanyCount,
            lastUpdated: terminal.lastUpdated,
            latitude: terminal.latitude,
            longitude: terminal.longitude,
            schedules: schedules
          };
        });
      }
    } catch (error) {
      console.error('Error loading terminals from localStorage:', error);
    }

    const defaultTerminals = getDefaultTerminals();

    // Guardar las terminales por defecto en localStorage con IDs numéricos para el admin
    localStorage.setItem('terminals', JSON.stringify(defaultTerminals.map(t => ({
      id: parseInt(t.id),
      name: t.name,
      city: t.city,
      address: t.address,
      phone: t.phone,
      email: '',
      latitude: t.latitude,
      longitude: t.longitude,
      isActive: t.isActive,
      schedulesVisible: t.schedulesVisible,
      description: '',
      municipalityInfo: '',
      image: t.image,
      companyCount: t.companyCount,
      lastUpdated: t.lastUpdated,
      schedules: t.schedules
    }))));

    return defaultTerminals;
  }, []);

  const [allTerminals, setAllTerminals] = useState<Terminal[]>(getTerminals());

  // Función para refrescar terminales
  const refreshTerminals = useCallback(() => {
    console.log('Refrescando terminales...');
    const updatedTerminals = getTerminals();
    console.log('Terminales actualizadas:', updatedTerminals.length);
    setAllTerminals(updatedTerminals);
  }, [getTerminals]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'terminals' || e.key === null) {
        console.log('Detectado cambio en localStorage desde otra pestaña, recargando terminales...');
        refreshTerminals();
      }
    };

    // Escuchar cambios en localStorage desde otras pestañas
    window.addEventListener('storage', handleStorageChange);
    
    // Crear un evento personalizado para detectar cambios en la misma pestaña
    const handleCustomStorageChange = (event: CustomEvent) => {
      console.log('Detectado evento personalizado de cambio en localStorage');
      refreshTerminals();
    };
    
    // Escuchar eventos personalizados
    window.addEventListener('terminalsUpdated', handleCustomStorageChange as EventListener);
    
    // Polling para detectar cambios cada 500ms (más frecuente)
    const interval = setInterval(() => {
      const currentTerminals = getTerminals();
      const currentCount = allTerminals.length;
      const newCount = currentTerminals.length;
      
      // Si cambió el número de terminales o el contenido
      if (newCount !== currentCount || JSON.stringify(currentTerminals) !== JSON.stringify(allTerminals)) {
        console.log('Cambios detectados en terminales:', {
          previousCount: currentCount,
          newCount: newCount,
          terminals: currentTerminals.map(t => ({ id: t.id, name: t.name }))
        });
        setAllTerminals(currentTerminals);
      }
    }, 500); // Cada 500ms para detección más rápida

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('terminalsUpdated', handleCustomStorageChange as EventListener);
      clearInterval(interval);
    };
  }, [allTerminals, getTerminals, refreshTerminals]);

  return allTerminals;
};

// Función auxiliar para disparar eventos personalizados cuando se actualiza localStorage
export const notifyTerminalsUpdated = () => {
  console.log('Disparando evento de actualización de terminales');
  window.dispatchEvent(new CustomEvent('terminalsUpdated'));
};
