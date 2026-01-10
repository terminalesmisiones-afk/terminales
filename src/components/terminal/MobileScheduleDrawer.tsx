
import React from 'react';
import { Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Schedule } from '@/types/terminal';

interface MobileScheduleDrawerProps {
  terminal: {
    name: string;
    schedulesVisible: boolean;
  };
  schedules: Schedule[];
  filteredSchedules: Schedule[];
  companies: string[];
  searchTerm: string;
  selectedCompany: string;
  isScheduleDrawerOpen: boolean;
  onSearchTermChange: (value: string) => void;
  onCompanyChange: (company: string) => void;
  onDrawerOpenChange: (open: boolean) => void;
  onShareScheduleToWhatsApp: (schedule: Schedule) => void;
}

// Componente SVG optimizado del ícono oficial de WhatsApp con mejor resolución
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
);

const MobileScheduleDrawer: React.FC<MobileScheduleDrawerProps> = ({
  terminal,
  schedules,
  filteredSchedules,
  companies,
  searchTerm,
  selectedCompany,
  isScheduleDrawerOpen,
  onSearchTermChange,
  onCompanyChange,
  onDrawerOpenChange,
  onShareScheduleToWhatsApp
}) => {
  return (
    <div className="block lg:hidden mb-4">
      <Drawer open={isScheduleDrawerOpen} onOpenChange={onDrawerOpenChange}>
        <DrawerTrigger asChild>
          <Button
            className="w-full bg-primary hover:bg-primary-600 text-white text-base py-3"
            disabled={!terminal.schedulesVisible}
          >
            <Clock className="h-5 w-5 mr-2" />
            {terminal.schedulesVisible ? 'Ver Horarios' : 'Horarios no disponibles'}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="p-4 pb-6">
            <DrawerHeader>
              <DrawerTitle className="text-lg font-semibold">Horarios y Rutas - {terminal.name}</DrawerTitle>
            </DrawerHeader>

            {/* Filtros en el modal */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por empresa o destino..."
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                  className="pl-10 text-base py-3"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCompany === 'all' ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCompanyChange('all')}
                  className="text-sm px-4 py-2"
                >
                  Todas
                </Button>
                {companies.slice(1).map(company => (
                  <Button
                    key={company}
                    variant={selectedCompany === company ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCompanyChange(company)}
                    className="text-sm px-4 py-2"
                  >
                    {company}
                  </Button>
                ))}
              </div>
            </div>

            {/* Lista de horarios en modal - Mejorada para móvil */}
            <div className="max-h-96 overflow-y-auto">
              {filteredSchedules.length > 0 ? (
                <div className="space-y-4">
                  {filteredSchedules.map((schedule) => (
                    <div key={schedule.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-base mb-1">{schedule.company}</h3>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Destino:</span> {schedule.destination}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {schedule.remarks}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onShareScheduleToWhatsApp(schedule)}
                          className="ml-3 p-3 h-12 w-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
                          title="Compartir este horario en WhatsApp"
                        >
                          <WhatsAppIcon className="h-6 w-6" />
                        </Button>
                      </div>

                      <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Lun-Vie:</span>
                          <span className="font-medium text-gray-900">{schedule.departure_mon_fri || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Sábado:</span>
                          <span className="font-medium text-gray-900">{schedule.departure_sat || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Domingo:</span>
                          <span className="font-medium text-gray-900">{schedule.departure_sun || '-'}</span>
                        </div>
                      </div>

                      {schedule.platform && (
                        <div className="mt-3 text-right">
                          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 px-3 py-1 text-sm">
                            Plataforma: {schedule.platform}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron horarios</h3>
                  <p className="text-gray-500">
                    {searchTerm || selectedCompany !== 'all'
                      ? 'Intenta con otros filtros de búsqueda'
                      : 'Los horarios se actualizarán próximamente'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileScheduleDrawer;
