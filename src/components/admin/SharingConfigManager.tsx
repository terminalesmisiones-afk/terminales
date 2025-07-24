
import React, { useState } from 'react';
import { Share2, Save, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSharingConfig } from '@/hooks/useSharingConfig';
import { useToast } from '@/hooks/use-toast';

const SharingConfigManager: React.FC = () => {
  const { config, updateConfig } = useSharingConfig();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    defaultShareText: config.defaultShareText,
    customMessage: config.customMessage || "📱 *Guía Publi - Tu guía de transporte público*\n✅ Horarios actualizados\n✅ Información confiable\n✅ Todas las terminales de ómnibus"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    toast({
      title: "Configuración guardada",
      description: "La configuración de compartir se ha actualizado correctamente.",
    });
  };

  const resetToDefault = () => {
    const defaultText = "📱 *Guía Publi - Tu guía de transporte público*\n✅ Horarios actualizados\n✅ Información confiable\n✅ Todas las terminales de ómnibus";
    setFormData({ 
      defaultShareText: defaultText,
      customMessage: defaultText
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Configuración de Compartir WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="customMessage">Mensaje personalizado para WhatsApp</Label>
            <Textarea
              id="customMessage"
              value={formData.customMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
              placeholder="Mensaje que aparecerá al compartir horarios..."
              className="min-h-32 resize-none"
              rows={6}
            />
            <p className="text-sm text-gray-500 mt-2">
              Este mensaje aparecerá al compartir horarios individuales en WhatsApp.
            </p>
          </div>

          <div>
            <Label htmlFor="shareText">Texto predeterminado para compartir terminales</Label>
            <Textarea
              id="shareText"
              value={formData.defaultShareText}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultShareText: e.target.value }))}
              placeholder="Texto para compartir información general de terminales..."
              className="min-h-32 resize-none"
              rows={6}
            />
            <p className="text-sm text-gray-500 mt-2">
              Texto para compartir información general de las terminales.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Guardar Configuración
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetToDefault}
            >
              Restaurar Predeterminado
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Vista previa del mensaje simplificado:
          </h4>
          <div className="text-sm text-gray-700 whitespace-pre-line bg-white p-3 rounded border">
            🚌 *Empresa Ejemplo*
            📍 Buenos Aires
            🕐 08:00

            {formData.customMessage}
            
            🔗 [URL de la terminal]
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * El mensaje se ha simplificado: solo incluye destino y hora de salida (sin llegada, frecuencia ni plataforma)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SharingConfigManager;
