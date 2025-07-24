import React from 'react';
import { Clock, Search, Info, Facebook, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Schedule } from '@/types/terminal';

interface DesktopScheduleTableProps {
  terminal: {
    schedulesVisible: boolean;
  };
  filteredSchedules: Schedule[];
  companies: string[];
  searchTerm: string;
  selectedCompany: string;
  onSearchTermChange: (value: string) => void;
  onCompanyChange: (company: string) => void;
  onShareSchedule: (schedule: Schedule, platform: 'whatsapp' | 'facebook' | 'telegram') => void;
}

const DesktopScheduleTable: React.FC<DesktopScheduleTableProps> = ({
  terminal,
  filteredSchedules,
  companies,
  searchTerm,
  selectedCompany,
  onSearchTermChange,
  onCompanyChange,
  onShareSchedule
}) => {
  return (
    <div className="hidden lg:block">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por empresa o destino..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCompany === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => onCompanyChange('all')}
          >
            Todas
          </Button>
          {companies.slice(1).map(company => (
            <Button
              key={company}
              variant={selectedCompany === company ? "default" : "outline"}
              size="sm"
              onClick={() => onCompanyChange(company)}
            >
              {company}
            </Button>
          ))}
        </div>
      </div>

      {/* Mostrar estado de horarios */}
      {!terminal.schedulesVisible && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              Los horarios de esta terminal están ocultos temporalmente.
            </p>
          </div>
        </div>
      )}

      {/* Tabla de Horarios */}
      {terminal.schedulesVisible && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Salida</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Compartir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    {schedule.company}
                  </TableCell>
                  <TableCell>{schedule.destination}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-700 bg-green-50">
                      {schedule.departure}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{schedule.platform}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onShareSchedule(schedule, 'whatsapp')}
                        className="p-2 h-10 w-10 hover:bg-green-50 hover:text-green-600 bg-green-500 hover:bg-green-600 text-white animate-pulse hover:animate-none transition-all duration-300 hover:scale-110 rounded-full"
                        title="Compartir en WhatsApp"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onShareSchedule(schedule, 'facebook')}
                        className="p-1 h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                        title="Compartir en Facebook"
                      >
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onShareSchedule(schedule, 'telegram')}
                        className="p-1 h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                        title="Compartir en Telegram"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {terminal.schedulesVisible && filteredSchedules.length === 0 && (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron horarios</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCompany !== 'all' 
              ? 'Intenta con otros filtros de búsqueda' 
              : 'Los horarios se actualizarán próximamente'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default DesktopScheduleTable;
