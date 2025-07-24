
import { useState, useEffect } from 'react';

interface SharingConfig {
  defaultShareText: string;
  customMessage: string;
}

const DEFAULT_SHARING_CONFIG: SharingConfig = {
  defaultShareText: "📱 *Guía Publi - Tu guía de transporte público*\n✅ Horarios actualizados\n✅ Información confiable\n✅ Todas las terminales de ómnibus",
  customMessage: "📱 *Guía Publi - Tu guía de transporte público*\n✅ Horarios actualizados\n✅ Información confiable\n✅ Todas las terminales de ómnibus"
};

export const useSharingConfig = () => {
  const [config, setConfig] = useState<SharingConfig>(DEFAULT_SHARING_CONFIG);

  useEffect(() => {
    const loadConfig = () => {
      try {
        const storedConfig = localStorage.getItem('sharingConfig');
        if (storedConfig) {
          const parsedConfig = JSON.parse(storedConfig);
          // Ensure backward compatibility
          const fullConfig = {
            ...DEFAULT_SHARING_CONFIG,
            ...parsedConfig,
            customMessage: parsedConfig.customMessage || parsedConfig.defaultShareText || DEFAULT_SHARING_CONFIG.customMessage
          };
          setConfig(fullConfig);
        }
      } catch (error) {
        console.error('Error loading sharing config:', error);
      }
    };

    loadConfig();

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      loadConfig();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateConfig = (newConfig: Partial<SharingConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('sharingConfig', JSON.stringify(updatedConfig));
  };

  return { config, updateConfig };
};
