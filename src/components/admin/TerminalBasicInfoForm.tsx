
import React from 'react';
import { MapPin, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

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
}

interface TerminalBasicInfoFormProps {
  formData: Terminal;
  onFieldChange: (field: keyof Terminal, value: any) => void;
  onGeocodeAddress: (e: React.MouseEvent) => void;
}

const TerminalBasicInfoForm: React.FC<TerminalBasicInfoFormProps> = ({
  formData,
  onFieldChange,
  onGeocodeAddress
}) => {
  const { toast } = useToast();

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Simular upload - en producción sería una llamada a API
        const mockUrl = `/lovable-uploads/${file.name}`;
        onFieldChange('image', mockUrl);
        
        toast({
          title: "Imagen subida",
          description: `La imagen ${file.name} se ha subido correctamente.`,
        });
      }
    };
    input.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre de la Terminal</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            placeholder="Ej: Terminal de Posadas"
            required
          />
        </div>

        <div>
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => onFieldChange('city', e.target.value)}
            placeholder="Ej: Posadas"
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Dirección</Label>
          <div className="flex space-x-2">
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onFieldChange('address', e.target.value)}
              placeholder="Ej: Av. Quaranta 2570"
              required
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={onGeocodeAddress}
              size="sm"
              className="flex-shrink-0"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Ubicar
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
            placeholder="Ej: +54 376 443-3333"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            placeholder="Ej: terminal@posadas.com"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Imagen de la Terminal</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                value={formData.image}
                onChange={(e) => onFieldChange('image', e.target.value)}
                placeholder="URL de la imagen o subir archivo"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleImageUpload}
                size="sm"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Puedes ingresar una URL o subir una imagen desde tu computadora
            </p>
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Vista previa"
                  className="w-full max-w-xs rounded border"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            placeholder="Descripción breve de la terminal"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="municipalityInfo">Información del Municipio</Label>
          <Textarea
            id="municipalityInfo"
            value={formData.municipalityInfo}
            onChange={(e) => onFieldChange('municipalityInfo', e.target.value)}
            placeholder="Información turística y general sobre la ciudad"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default TerminalBasicInfoForm;
