
import React, { useState, useEffect } from 'react';
import { Truck, Phone, Mail, MapPin, Globe, Share2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TransportCompany {
  id: number;
  name: string;
  logo: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  website: string;
  description: string;
  ticketOffices: string;
  isActive: boolean;
}

// Componente SVG optimizado del ícono oficial de WhatsApp
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
);

const TransportCompanies = () => {
  const [companies, setCompanies] = useState<TransportCompany[]>([]);

  useEffect(() => {
    const loadCompanies = () => {
      try {
        const stored = localStorage.getItem('transportCompanies');
        if (stored) {
          const parsedCompanies = JSON.parse(stored);
          setCompanies(parsedCompanies.filter((company: TransportCompany) => company.isActive));
          return;
        }
      } catch (error) {
        console.error('Error loading companies:', error);
      }

      // Empresas por defecto si no hay datos guardados
      const defaultCompanies: TransportCompany[] = [
        {
          id: 1,
          name: 'Crucero del Norte',
          logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&auto=format&q=80',
          phone: '+54 376 442-7788',
          whatsapp: '+54 9 376 442-7788',
          email: 'info@crucero-norte.com.ar',
          address: 'Av. Quaranta 2580, Posadas, Misiones',
          website: 'https://crucero-norte.com.ar',
          description: 'Empresa líder en transporte de pasajeros en el nordeste argentino',
          ticketOffices: 'Terminal Posadas, Terminal Oberá, Terminal Puerto Iguazú',
          isActive: true
        },
        {
          id: 2,
          name: 'Río Uruguay',
          logo: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&auto=format&q=80',
          phone: '+54 376 443-5566',
          whatsapp: '+54 9 376 443-5566',
          email: 'contacto@riouruguay.com.ar',
          address: 'Av. Sarmiento 1234, Posadas, Misiones',
          website: 'https://riouruguay.com.ar',
          description: 'Conectando el noreste argentino con servicios de calidad',
          ticketOffices: 'Terminal Posadas, Terminal Corrientes',
          isActive: true
        },
        {
          id: 3,
          name: 'Tigre Iguazú',
          logo: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop&auto=format&q=80',
          phone: '+54 376 444-9988',
          whatsapp: '+54 9 376 444-9988',
          email: 'info@tigreiguazu.com.ar',
          address: 'Ruta Nacional 12, Puerto Iguazú, Misiones',
          website: 'https://tigreiguazu.com.ar',
          description: 'Especialista en turismo internacional y rutas hacia las Cataratas',
          ticketOffices: 'Terminal Puerto Iguazú, Terminal Posadas',
          isActive: true
        },
        {
          id: 4,
          name: 'Expreso Singer',
          logo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=200&fit=crop&auto=format&q=80',
          phone: '+54 376 445-1122',
          whatsapp: '+54 9 376 445-1122',
          email: 'info@expresosinger.com.ar',
          address: 'Av. Libertad 789, Eldorado, Misiones',
          website: 'https://expresosinger.com.ar',
          description: 'Transporte regional especializado en rutas provinciales',
          ticketOffices: 'Terminal Eldorado, Terminal Oberá',
          isActive: true
        }
      ];

      setCompanies(defaultCompanies);
      localStorage.setItem('transportCompanies', JSON.stringify(defaultCompanies));
    };

    loadCompanies();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  const handleShareCompany = (company: TransportCompany) => {
    const shareText = `🚌 *${company.name}*\n\n📍 ${company.address}\n📞 ${company.phone}\n💬 WhatsApp disponible\n\n${company.description}\n\n🏢 Boleterías: ${company.ticketOffices}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Empresa ${company.name}`,
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback para WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="main-container py-8 lg:py-12">
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex items-center justify-center mb-4">
            <Truck className="h-10 w-10 lg:h-12 lg:w-12 text-primary" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Empresas de Transporte
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Conoce todas las empresas de transporte que operan en Misiones. 
            Información sobre servicios, contacto y ubicaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center space-y-3 mb-3">
                  <div className="relative w-full h-32 lg:h-40 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&auto=format&q=80';
                      }}
                    />
                  </div>
                  <div className="text-center w-full">
                    <CardTitle className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                      {company.name}
                    </CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Activa
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-0">
                <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                  {company.description}
                </p>
                
                <div className="space-y-3">
                  {company.phone && (
                    <div className="flex items-center text-sm lg:text-base">
                      <Phone className="h-4 w-4 lg:h-5 lg:w-5 mr-3 text-primary flex-shrink-0" />
                      <a href={`tel:${company.phone}`} className="hover:text-primary break-all transition-colors">
                        {company.phone}
                      </a>
                    </div>
                  )}
                  
                  {company.whatsapp && (
                    <div className="flex items-center text-sm lg:text-base">
                      <WhatsAppIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-3 text-green-600 flex-shrink-0" />
                      <a 
                        href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}`} 
                        className="hover:text-green-600 break-all transition-colors" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>
                    </div>
                  )}
                  
                  {company.email && (
                    <div className="flex items-center text-sm lg:text-base">
                      <Mail className="h-4 w-4 lg:h-5 lg:w-5 mr-3 text-primary flex-shrink-0" />
                      <a href={`mailto:${company.email}`} className="hover:text-primary break-all transition-colors">
                        {company.email}
                      </a>
                    </div>
                  )}
                  
                  {company.address && (
                    <div className="flex items-start text-sm lg:text-base">
                      <MapPin className="h-4 w-4 lg:h-5 lg:w-5 mr-3 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 leading-relaxed">{company.address}</span>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="flex items-center text-sm lg:text-base">
                      <Globe className="h-4 w-4 lg:h-5 lg:w-5 mr-3 text-primary flex-shrink-0" />
                      <a 
                        href={company.website} 
                        className="hover:text-primary break-all transition-colors" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Sitio Web
                      </a>
                    </div>
                  )}
                </div>
                
                {company.ticketOffices && (
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm lg:text-base">Boleterías</h4>
                    <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">
                      {company.ticketOffices}
                    </p>
                  </div>
                )}

                {/* Botón de compartir */}
                <div className="pt-3 border-t border-gray-100">
                  <Button
                    onClick={() => handleShareCompany(company)}
                    variant="outline"
                    size="sm"
                    className="w-full text-sm lg:text-base py-2 lg:py-3 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir Empresa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {companies.length === 0 && (
          <div className="text-center py-12 lg:py-16">
            <Truck className="h-16 w-16 lg:h-20 lg:w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl lg:text-2xl font-semibold text-gray-500 mb-2">
              No hay empresas disponibles
            </h3>
            <p className="text-gray-400 text-base lg:text-lg">
              Las empresas se mostrarán aquí una vez que sean configuradas.
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default TransportCompanies;
