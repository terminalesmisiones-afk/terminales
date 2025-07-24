
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { notifyTerminalsUpdated } from '@/hooks/useTerminals';
import TerminalBasicInfoForm from './TerminalBasicInfoForm';
import TerminalLocationForm from './TerminalLocationForm';
import TerminalSchedulesForm from './TerminalSchedulesForm';
import TerminalSettingsForm from './TerminalSettingsForm';

interface Schedule {
  id: number;
  company: string;
  destination: string;
  departure: string;
  arrival: string;
  frequency: string;
  platform: string;
}

interface Terminal {
  id?: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  schedulesVisible: boolean;
  description: string;
  municipalityInfo: string;
  image: string;
  schedules?: Schedule[];
}

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  terminal?: Terminal | null;
  onSave: (terminal: Terminal) => void;
}

const TerminalModal: React.FC<TerminalModalProps> = ({ isOpen, onClose, terminal, onSave }) => {
  const [formData, setFormData] = useState<Terminal>({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    latitude: -27.367,
    longitude: -55.896,
    isActive: true,
    schedulesVisible: true,
    description: '',
    municipalityInfo: '',
    image: '',
    schedules: []
  });

  useEffect(() => {
    if (terminal) {
      setFormData({
        ...terminal,
        schedules: terminal.schedules || []
      });
    } else {
      setFormData({
        name: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        latitude: -27.367,
        longitude: -55.896,
        isActive: true,
        schedulesVisible: true,
        description: '',
        municipalityInfo: '',
        image: '',
        schedules: []
      });
    }
  }, [terminal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Guardando terminal con datos:', formData);
    
    onSave(formData);
    
    // Disparar evento personalizado para notificar cambios
    setTimeout(() => {
      notifyTerminalsUpdated();
    }, 100);
    
    onClose();
  };

  const handleFieldChange = (field: keyof Terminal, value: any) => {
    console.log(`Actualizando campo ${field}:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (lat: number, lng: number) => {
    console.log('Actualizando ubicación:', { lat, lng });
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleSchedulesChange = (schedules: Schedule[]) => {
    setFormData(prev => ({
      ...prev,
      schedules
    }));
  };

  const geocodeAddress = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.address) return;
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address + ', Misiones, Argentina')}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);
        
        console.log('Geocodificación exitosa:', { newLat, newLng });
        
        setFormData(prev => ({
          ...prev,
          latitude: newLat,
          longitude: newLng
        }));
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {terminal ? 'Editar Terminal' : 'Nueva Terminal'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6" onClick={(e) => e.stopPropagation()}>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Información General</TabsTrigger>
              <TabsTrigger value="location">Ubicación</TabsTrigger>
              <TabsTrigger value="schedules">Horarios</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <TerminalBasicInfoForm
                formData={formData}
                onFieldChange={handleFieldChange}
                onGeocodeAddress={geocodeAddress}
              />
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
              <TerminalLocationForm
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={handleLocationChange}
              />
            </TabsContent>

            <TabsContent value="schedules" className="space-y-6">
              <TerminalSchedulesForm
                terminalId={formData.id}
                terminalName={formData.name}
                schedules={formData.schedules || []}
                onSchedulesChange={handleSchedulesChange}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <TerminalSettingsForm
                isActive={formData.isActive}
                schedulesVisible={formData.schedulesVisible}
                onActiveChange={(checked) => handleFieldChange('isActive', checked)}
                onSchedulesVisibleChange={(checked) => handleFieldChange('schedulesVisible', checked)}
              />
            </TabsContent>
          </Tabs>

          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary-600">
                <Save className="h-4 w-4 mr-2" />
                {terminal ? 'Actualizar' : 'Crear'} Terminal
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TerminalModal;
