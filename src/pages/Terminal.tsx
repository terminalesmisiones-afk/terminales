import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { api } from '@/services/api';
import { MapPin, Clock, Info, ArrowLeft, TrendingUp } from 'lucide-react';
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
  longContent?: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  schedulesVisible: boolean;
  lastUpdated: string;
  companyCount: number;
  schedules: Schedule[];
}

interface Schedule {
  id: string | number;
  company: string;
  destination: string;
  remarks: string;
  departure_mon_fri: string;
  departure_sat: string;
  departure_sun: string;
  platform?: string;
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

  // Import api
  // (Assuming import is added at top, if not I will add it in a sec)

  useEffect(() => {
    const fetchTerminal = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await api.getTerminalById(id);

        // Transform data from API (snake_case) to Component (camelCase)
        const terminalData: TerminalData = {
          id: data.id,
          name: data.name,
          city: data.city,
          address: data.address,
          phone: data.phone || '',
          email: data.email || '',
          image: data.image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
          description: data.description || `Terminal de ómnibus de ${data.city}`,
          municipalityInfo: data.municipality_info || `Información sobre ${data.city}`,
          longContent: data.long_content,
          latitude: Number(data.latitude) || 0,
          longitude: Number(data.longitude) || 0,
          isActive: Boolean(data.is_active),
          schedulesVisible: Boolean(data.schedules_visible),
          lastUpdated: data.updated_at || new Date().toISOString(),
          companyCount: 0, // Calculate from schedules
          schedules: []
        };

        const schedules = data.schedules?.map((s: any) => ({
          id: s.id,
          company: s.company,
          destination: s.destination,
          remarks: s.remarks,
          departure_mon_fri: s.departure_mon_fri,
          departure_sat: s.departure_sat,
          departure_sun: s.departure_sun,
          platform: s.platform
        })) || [];

        // Count unique companies
        const uniqueCompanies = new Set(schedules.map((s: any) => s.company)).size;
        terminalData.companyCount = uniqueCompanies;
        terminalData.schedules = schedules;

        setTerminal(terminalData);
        setSchedules(schedules);
      } catch (error) {
        console.error('Error loading terminal:', error);
        setTerminal(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTerminal();
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
    const text = `🚌 ${schedule.company}\n📍 ${schedule.destination}\n🕐 Lun-Vie: ${schedule.departure_mon_fri || '-'}\n🕐 Sab: ${schedule.departure_sat || '-'}\n🕐 Dom: ${schedule.departure_sun || '-'}`;
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
    // Simplified message format
    const horarioText = `🚌 *${schedule.company}*\n📍 ${schedule.destination}\n🕐 L-V: ${schedule.departure_mon_fri || '-'}\n🕐 S: ${schedule.departure_sat || '-'}\n🕐 D: ${schedule.departure_sun || '-'}`;
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
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
        <Footer />
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

        {/* Banner de Publicidad - Header (Terminal Top) */}
        <div className="mb-6">
          <AdBannerSlot slot="terminal-top" />
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

            {/* Banner de Publicidad - Middle (Entre botones e info) */}
            <div className="my-6">
              <AdBannerSlot slot="terminal-middle" />
            </div>

            {/* DESCRIPCIÓN DE LA TERMINAL - ACCORDION */}
            <div className="space-y-4">
              {terminal.description && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="description" className="border rounded-lg bg-white px-4 shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center text-lg font-semibold text-gray-900">
                        <Info className="h-5 w-5 mr-2" />
                        Sobre la Terminal
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed pb-4">
                      {terminal.description}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* INFORMACIÓN DEL MUNICIPIO - ACCORDION */}
              {terminal.municipalityInfo && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="municipality" className="border rounded-lg bg-white px-4 shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center text-lg font-semibold text-gray-900">
                        <Info className="h-5 w-5 mr-2" />
                        Sobre {terminal.city}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed pb-4">
                      {terminal.municipalityInfo}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Banners Publicitarios - Sidebar */}
            <div className="space-y-4">
              <AdBannerSlot slot="sidebar-1" />
              <AdBannerSlot slot="sidebar-2" />
              <AdBannerSlot slot="sidebar-3" />
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

            {/* Banner de Publicidad - Sidebar Bottom (Bajo Mapa) */}
            <div>
              <AdBannerSlot slot="sidebar-map-bottom" />
            </div>

            {/* Publicitá Acá Call to Action */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">¿Querés destacar tu negocio?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Llega a miles de pasajeros que visitan esta terminal cada día.
                </p>
                <Link to="/publicidad">
                  <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                    Publicitá Acá
                  </span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Banner de Publicidad - Footer */}
        {/* Banner de Publicidad - Footer */}
        <div className="mt-8">
          <AdBannerSlot slot="content-bottom" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terminal;
