
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TerminalsGrid from '@/components/TerminalsGrid';
import Footer from '@/components/Footer';
import ResponsiveAdSlot from '@/components/ResponsiveAdSlot';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Ubicación del usuario:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Usuario denegó la geolocalización o error:', error.message);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  }, []);

  const handleSearch = (query: string, city: string) => {
    setSearchQuery(query);
    setSelectedCity(city);
  };

  const handleNearestTerminal = (latitude: number, longitude: number) => {
    console.log('Buscando terminal más cercana en:', { latitude, longitude });
    
    // Obtener terminales desde localStorage o usar las por defecto
    const getStoredTerminals = () => {
      try {
        const stored = localStorage.getItem('terminals');
        if (stored) {
          const terminals = JSON.parse(stored);
          console.log('Terminales para búsqueda de cercanía:', terminals);
          return terminals;
        }
      } catch (error) {
        console.error('Error loading terminals:', error);
      }
      
      return [
        { id: 1, name: 'Posadas', latitude: -27.367, longitude: -55.896 },
        { id: 2, name: 'Oberá', latitude: -27.486, longitude: -55.119 },
        { id: 3, name: 'Puerto Iguazú', latitude: -25.597, longitude: -54.578 }
      ];
    };

    const terminals = getStoredTerminals().map((t: any) => ({
      id: t.id.toString(),
      name: t.name,
      lat: t.latitude || t.lat || -27.367,
      lng: t.longitude || t.lng || -55.896
    }));

    console.log('Terminales procesadas para cercanía:', terminals);

    let nearestTerminal = terminals[0];
    let shortestDistance = calculateDistance(latitude, longitude, terminals[0].lat, terminals[0].lng);

    terminals.forEach(terminal => {
      const distance = calculateDistance(latitude, longitude, terminal.lat, terminal.lng);
      console.log(`Distancia a ${terminal.name}: ${distance} km`);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestTerminal = terminal;
      }
    });

    console.log('Terminal más cercana encontrada:', nearestTerminal, 'Distancia:', shortestDistance, 'km');
    navigate(`/terminal/${nearestTerminal.id}`);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-4 md:px-0">
        <HeroSection 
          onSearch={handleSearch}
          onNearestTerminal={handleNearestTerminal}
        />
        
        {/* Ad space after hero */}
        <ResponsiveAdSlot position={0} className="my-6" />
        
        <div className="py-12">
          <TerminalsGrid searchQuery={searchQuery} selectedCity={selectedCity} />
        </div>
        
        {/* Ad space after terminals */}
        <ResponsiveAdSlot position={3} className="my-6" />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
