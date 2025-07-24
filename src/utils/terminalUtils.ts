
import { Terminal, Schedule } from '@/types/terminal';

export const countUniqueCompanies = (schedules: Schedule[] = []): number => {
  const uniqueCompanies = new Set(schedules.map(schedule => schedule.company.trim().toLowerCase()));
  return uniqueCompanies.size;
};

export const getDefaultTerminals = (): Terminal[] => {
  const defaultTerminals = [
    {
      id: '1',
      name: 'Posadas',
      city: 'Posadas',
      address: 'Av. Quaranta 2570, Posadas, Misiones',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
      phone: '+54 376 443-3333',
      isActive: true,
      schedulesVisible: true,
      companyCount: 0,
      lastUpdated: '2024-06-26',
      latitude: -27.367,
      longitude: -55.896,
      schedules: [
        { id: 1, company: 'Empresa Crucero del Norte', destination: 'Buenos Aires', departure: '08:00', arrival: '18:00', frequency: 'Diario', platform: '1' },
        { id: 2, company: 'Singer', destination: 'Córdoba', departure: '10:30', arrival: '22:30', frequency: 'Diario', platform: '2' },
        { id: 3, company: 'Expreso Singer', destination: 'Resistencia', departure: '14:00', arrival: '18:00', frequency: 'Diario', platform: '3' },
        { id: 4, company: 'Via Bariloche', destination: 'Bariloche', departure: '20:00', arrival: '14:00+1', frequency: 'Martes, Jueves, Sábado', platform: '4' },
        { id: 5, company: 'Empresa Crucero del Norte', destination: 'Iguazú', departure: '06:30', arrival: '10:30', frequency: 'Diario', platform: '5' }
      ]
    },
    {
      id: '2',
      name: 'Oberá',
      city: 'Oberá',
      address: 'Av. Sarmiento 444, Oberá, Misiones',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      phone: '+54 3755 42-2222',
      isActive: true,
      schedulesVisible: true,
      companyCount: 0,
      lastUpdated: '2024-06-25',
      latitude: -27.486,
      longitude: -55.119,
      schedules: [
        { id: 1, company: 'Empresa Crucero del Norte', destination: 'Posadas', departure: '07:00', arrival: '08:30', frequency: 'Diario', platform: '1' },
        { id: 2, company: 'Singer', destination: 'Buenos Aires', departure: '21:30', arrival: '11:30+1', frequency: 'Diario', platform: '2' },
        { id: 3, company: 'Expreso Oberá', destination: 'Puerto Iguazú', departure: '09:00', arrival: '13:00', frequency: 'Lunes a Viernes', platform: '3' }
      ]
    },
    {
      id: '3',
      name: 'Puerto Iguazú',
      city: 'Puerto Iguazú',
      address: 'Av. Córdoba 264, Puerto Iguazú, Misiones',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      phone: '+54 3757 42-1111',
      isActive: true,
      schedulesVisible: false,
      companyCount: 0,
      lastUpdated: '2024-06-20',
      latitude: -25.597,
      longitude: -54.578,
      schedules: [
        { id: 1, company: 'Empresa Crucero del Norte', destination: 'Buenos Aires', departure: '19:30', arrival: '09:30+1', frequency: 'Diario', platform: '1' },
        { id: 2, company: 'Singer', destination: 'Posadas', departure: '16:00', arrival: '20:00', frequency: 'Diario', platform: '2' },
        { id: 3, company: 'Rio Uruguay', destination: 'Córdoba', departure: '22:00', arrival: '10:00+1', frequency: 'Martes, Jueves, Domingo', platform: '3' },
        { id: 4, company: 'Expreso Iguazú', destination: 'Oberá', departure: '12:00', arrival: '16:00', frequency: 'Lunes a Viernes', platform: '4' }
      ]
    },
    {
      id: '4',
      name: 'Eldorado',
      city: 'Eldorado',
      address: 'Av. San Martín 1850, Eldorado, Misiones',
      image: 'https://images.unsplash.com/photo-1441716844725-09cedc13b55f?w=400&h=300&fit=crop',
      phone: '+54 3751 42-4444',
      isActive: false,
      schedulesVisible: false,
      companyCount: 0,
      lastUpdated: '2024-06-15',
      latitude: -26.401,
      longitude: -54.616,
      schedules: []
    },
    {
      id: '5',
      name: 'Apóstoles',
      city: 'Apóstoles',
      address: 'San Martín 1234, Apóstoles, Misiones',
      image: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=400&h=300&fit=crop',
      phone: '+54 3758 42-5555',
      isActive: true,
      schedulesVisible: false,
      companyCount: 0,
      lastUpdated: '2024-06-18',
      latitude: -27.908,
      longitude: -55.756,
      schedules: []
    },
    {
      id: '6',
      name: 'Montecarlo',
      city: 'Montecarlo',
      address: 'Av. Argentina 567, Montecarlo, Misiones',
      image: 'https://images.unsplash.com/photo-1517702145080-e4a4d91435bb?w=400&h=300&fit=crop',
      phone: '+54 3751 48-6666',
      isActive: true,
      schedulesVisible: true,
      companyCount: 0,
      lastUpdated: '2024-06-24',
      latitude: -26.568,
      longitude: -54.730,
      schedules: [
        { id: 1, company: 'Empresa Montecarlo', destination: 'Posadas', departure: '06:00', arrival: '09:00', frequency: 'Diario', platform: '1' },
        { id: 2, company: 'Singer', destination: 'Eldorado', departure: '15:30', arrival: '17:00', frequency: 'Lunes a Viernes', platform: '2' }
      ]
    }
  ].map(terminal => ({
    ...terminal,
    companyCount: countUniqueCompanies(terminal.schedules)
  }));

  return defaultTerminals;
};

export const filterTerminals = (terminals: Terminal[], searchQuery: string, selectedCity: string): Terminal[] => {
  let filtered = [...terminals];

  filtered = filtered.filter(terminal => terminal.isActive);

  if (selectedCity && selectedCity.trim() !== '') {
    filtered = filtered.filter(terminal => 
      terminal.city.toLowerCase().includes(selectedCity.toLowerCase().trim())
    );
  }

  if (searchQuery && searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(terminal => 
      terminal.name.toLowerCase().includes(query) ||
      terminal.city.toLowerCase().includes(query) ||
      terminal.address.toLowerCase().includes(query)
    );
  }

  return filtered;
};
