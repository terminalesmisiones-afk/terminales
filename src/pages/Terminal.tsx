import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Info, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TerminalMap from '@/components/TerminalMap';
import AdBannerSlot from '@/components/AdBannerSlot';
import TerminalHeader from '@/components/terminal/TerminalHeader';
import MobileScheduleDrawer from '@/components/terminal/MobileScheduleDrawer';
import DesktopScheduleTable from '@/components/terminal/DesktopScheduleTable';
import SharingButtons from '@/components/terminal/SharingButtons';
import { useSEO } from '@/hooks/useSEO';
import { useSharingConfig } from '@/hooks/useSharingConfig';

interface TerminalData {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  image: string;
  description: string;
  municipalityInfo: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  schedulesVisible: boolean;
  lastUpdated: string;
  companyCount: number;
  schedules: Schedule[];
}

interface Schedule {
  id: number;
  company: string;
  destination: string;
  departure: string;
  arrival: string;
  frequency: string;
  platform: string;
}

const Terminal = () => {
  const { id } = useParams();
  const [terminal, setTerminal] = useState<TerminalData | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);
  const { config: sharingConfig } = useSharingConfig();

  // Configurar SEO dinámico
  useSEO({
    title: terminal ? `Terminal de ${terminal.name} - ${terminal.city} | Terminales Misiones` : 'Cargando Terminal | Terminales Misiones',
    description: terminal ? `Horarios actualizados de la Terminal de ${terminal.name} en ${terminal.city}. ${terminal.companyCount} empresas disponibles. ${terminal.address}` : 'Terminal de ómnibus en Misiones',
    image: terminal?.image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=630&fit=crop',
    url: window.location.href
  });

  // Función para cargar terminales desde localStorage
  const loadTerminalFromStorage = () => {
    try {
      const storedTerminals = localStorage.getItem('terminals');
      if (storedTerminals) {
        const terminals = JSON.parse(storedTerminals);
        console.log('Terminales cargadas desde localStorage:', terminals);
        
        // Buscar terminal por ID (convertir a string para compatibilidad)
        const terminalId = id?.toString();
        const foundTerminal = terminals.find((t: any) => t.id.toString() === terminalId);
        
        if (foundTerminal) {
          console.log('Terminal encontrada:', foundTerminal);
          
          // Convertir el formato del admin al formato esperado por la página
          const terminalData: TerminalData = {
            id: foundTerminal.id.toString(),
            name: foundTerminal.name,
            city: foundTerminal.city,
            address: foundTerminal.address,
            phone: foundTerminal.phone || '',
            email: foundTerminal.email || '',
            image: foundTerminal.image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
            description: foundTerminal.description || `Terminal de ómnibus de ${foundTerminal.city}`,
            municipalityInfo: foundTerminal.municipalityInfo || `Información sobre ${foundTerminal.city}`,
            latitude: foundTerminal.latitude,
            longitude: foundTerminal.longitude,
            isActive: foundTerminal.isActive,
            schedulesVisible: foundTerminal.schedulesVisible,
            lastUpdated: foundTerminal.lastUpdated,
            companyCount: foundTerminal.companyCount,
            schedules: foundTerminal.schedules || []
          };
          
          setTerminal(terminalData);
          setSchedules(terminalData.schedules);
          console.log('Horarios cargados:', terminalData.schedules);
        } else {
          console.log('Terminal no encontrada con ID:', terminalId);
          setTerminal(null);
        }
      }
    } catch (error) {
      console.error('Error cargando terminal desde localStorage:', error);
      setTerminal(null);
    }
  };

  useEffect(() => {
    console.log('Cargando terminal con ID:', id);
    loadTerminalFromStorage();
    setLoading(false);

    // Escuchar cambios en localStorage para actualizaciones en tiempo real
    const handleStorageChange = () => {
      console.log('Detectado cambio en localStorage, recargando terminal...');
      loadTerminalFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // También verificar cambios cada 2 segundos para actualizaciones desde el admin
    const interval = setInterval(() => {
      loadTerminalFromStorage();
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [id]);

  const companies = ['all', ...new Set(schedules.map(schedule => schedule.company))];

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = selectedCompany === 'all' || schedule.company === selectedCompany;
    
    return matchesSearch && matchesCompany;
  });

  const shareToWhatsApp = () => {
    const text = `Terminal de Ómnibus ${terminal?.name}\n\n${terminal?.address}\n${terminal?.phone}\n\n¡Consulta todos los horarios actualizados aquí!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}\n${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareToTelegram = () => {
    const text = `Terminal de Ómnibus ${terminal?.name}\n${terminal?.address}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareSchedule = (schedule: Schedule, platform: 'whatsapp' | 'facebook' | 'telegram') => {
    const text = `🚌 ${schedule.company}\n📍 ${schedule.destination}\n🕐 Salida: ${schedule.departure}\n🕑 Llegada: ${schedule.arrival}\n📅 ${schedule.frequency}`;
    const url = window.location.href;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}\n${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
    }
  };

  const shareScheduleToWhatsApp = (schedule: Schedule) => {
    // Simplified message format - only destination and departure time
    const horarioText = `🚌 *${schedule.company}*\n📍 ${schedule.destination}\n🕐 ${schedule.departure}`;
    const guiaText = `\n\n${sharingConfig.customMessage || sharingConfig.defaultShareText}`;
    const url = `\n\n🔗 ${window.location.href}`;
    
    const fullMessage = `${horarioText}${guiaText}${url}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de la terminal...</p>
        </div>
      </div>
    );
  }

  if (!terminal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Terminal no encontrada</h2>
          <p className="text-gray-600 mb-4">La terminal que buscas no existe o ha sido eliminada.</p>
          <Link to="/" className="text-primary hover:text-primary-600 font-medium">
            <ArrowLeft className="h-4 w-4 inline mr-2" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón Volver */}
        <div className="mb-6">
          <Link 
            to="/"
            className="inline-flex items-center text-primary hover:text-primary-600 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a todas las terminales
          </Link>
        </div>

        {/* Header de la Terminal */}
        <TerminalHeader terminal={terminal} />

        {/* Banner de Publicidad - Header */}
        <div className="mb-6 space-y-4">
          <AdBannerSlot position={0} type="desktop" />
          <AdBannerSlot position={0} type="mobile" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* HORARIOS Y RUTAS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Horarios y Rutas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Drawer móvil */}
                <MobileScheduleDrawer
                  terminal={terminal}
                  schedules={schedules}
                  filteredSchedules={filteredSchedules}
                  companies={companies}
                  searchTerm={searchTerm}
                  selectedCompany={selectedCompany}
                  isScheduleDrawerOpen={isScheduleDrawerOpen}
                  onSearchTermChange={setSearchTerm}
                  onCompanyChange={setSelectedCompany}
                  onDrawerOpenChange={setIsScheduleDrawerOpen}
                  onShareScheduleToWhatsApp={shareScheduleToWhatsApp}
                />

                {/* Tabla de escritorio */}
                <DesktopScheduleTable
                  terminal={terminal}
                  filteredSchedules={filteredSchedules}
                  companies={companies}
                  searchTerm={searchTerm}
                  selectedCompany={selectedCompany}
                  onSearchTermChange={setSearchTerm}
                  onCompanyChange={setSelectedCompany}
                  onShareSchedule={shareSchedule}
                />
              </CardContent>
            </Card>

            {/* BOTONES DE COMPARTIR */}
            <SharingButtons
              onShareToWhatsApp={shareToWhatsApp}
              onShareToFacebook={shareToFacebook}
              onShareToTelegram={shareToTelegram}
            />

            {/* INFORMACIÓN DEL MUNICIPIO */}
            {terminal.municipalityInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Sobre {terminal.city}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {terminal.municipalityInfo}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Banners Publicitarios - Sidebar */}
            <div className="space-y-4">
              <AdBannerSlot position={3} type="desktop" />
              <AdBannerSlot position={4} type="desktop" />
              <AdBannerSlot position={5} type="desktop" />
              <AdBannerSlot position={3} type="mobile" />
              <AdBannerSlot position={4} type="mobile" />
              <AdBannerSlot position={5} type="mobile" />
            </div>

            {/* Mapa */}
            <Card>
              <CardHeader>
                <CardTitle>Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <TerminalMap
                  latitude={terminal.latitude}
                  longitude={terminal.longitude}
                  name={terminal.name}
                  address={terminal.address}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Banner de Publicidad - Footer */}
        <div className="mt-8 space-y-4">
          <AdBannerSlot position={2} type="desktop" />
          <AdBannerSlot position={2} type="mobile" />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terminal;
