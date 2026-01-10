
import React, { useState } from 'react';
import { Save, Upload, Eye, Globe, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { api } from '@/services/api';

const SeoManager = () => {
  const { toast } = useToast();
  const [seoData, setSeoData] = useState({
    title: 'Terminales Misiones - Horarios de Colectivos',
    description: 'Sistema integral para consultar horarios de colectivos en todas las terminales de ómnibus de la Provincia de Misiones, Argentina.',
    keywords: 'terminales, omnibus, colectivos, misiones, argentina, horarios, transporte',
    ogImage: '/og-image.jpg',
    favicon: '/favicon.ico',
    appleTouchIcon: '/apple-touch-icon.png',
    themeColor: '#2563EB',
    author: 'Terminales Misiones',
    siteUrl: 'https://terminales-misiones.lovable.app'
  });

  // Aplicar configuración SEO actual
  useSEO({
    title: seoData.title,
    description: seoData.description,
    image: seoData.ogImage,
    url: seoData.siteUrl
  });

  const handleInputChange = (field: string, value: string) => {
    setSeoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Save to Backend
      await api.saveSettings('seo_config', seoData);

      // Update meta tags dynamically
      document.title = seoData.title;

      // Update meta tags existing
      const updateMetaTag = (property: string, content: string, isName = false) => {
        const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
        let metaTag = document.querySelector(selector) as HTMLMetaElement;

        if (!metaTag) {
          metaTag = document.createElement('meta');
          if (isName) {
            metaTag.name = property;
          } else {
            metaTag.setAttribute('property', property);
          }
          document.head.appendChild(metaTag);
        }

        metaTag.content = content;
      };

      // Update all meta tags
      updateMetaTag('description', seoData.description, true);
      updateMetaTag('keywords', seoData.keywords, true);
      updateMetaTag('author', seoData.author, true);
      updateMetaTag('theme-color', seoData.themeColor, true);

      // Open Graph
      updateMetaTag('og:title', seoData.title);
      updateMetaTag('og:description', seoData.description);
      updateMetaTag('og:image', `${seoData.siteUrl}${seoData.ogImage}`);
      updateMetaTag('og:url', seoData.siteUrl);

      // Twitter
      updateMetaTag('twitter:title', seoData.title, true);
      updateMetaTag('twitter:description', seoData.description, true);
      updateMetaTag('twitter:image', `${seoData.siteUrl}${seoData.ogImage}`, true);

      // Update favicon if changed
      const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (faviconLink) {
        faviconLink.href = seoData.favicon;
      }

      toast({
        title: "Configuración guardada",
        description: "Los cambios SEO se han guardado en el servidor.",
      });
    } catch (error) {
      console.error('Error saving SEO:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración SEO.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (field: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Error",
            description: "El archivo es demasiado grande. Máximo 5MB.",
            variant: "destructive",
          });
          return;
        }

        try {
          // Use our API upload instead of direct Supabase if possible, or keep as is if working.
          // Since user uses Supabase storage directly here, we keep it, but normally we should move to backend proxy if we want to remove Supabase dependency fully.
          // For now, keeping as is to avoid breaking working upload logic. 
          // Wait, 'import' inside function is unusual but works.
          const { supabase } = await import('@/integrations/supabase/client');

          const fileName = `seo-${field}-${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('terminal-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error('Supabase storage error:', error);
            throw error;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('terminal-images')
            .getPublicUrl(data.path);

          console.log(`SEO ${field} image uploaded successfully:`, publicUrl);
          handleInputChange(field, publicUrl);

          toast({
            title: "Imagen subida",
            description: `La imagen ${file.name} se ha subido correctamente.`,
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: "Error",
            description: "Error al subir la imagen. Intenta nuevamente.",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  // Load saved config on init
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getSettings('seo_config');
        if (data) {
          setSeoData(data);
        }
      } catch (error) {
        console.error('Error loading SEO config:', error);
      }
    };
    loadSettings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO & Meta Tags</h2>
          <p className="text-gray-600">Gestiona la configuración SEO del sitio web</p>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary-600">
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Configuración General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título del Sitio</Label>
              <Input
                id="title"
                value={seoData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Título principal del sitio"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción Meta</Label>
              <Textarea
                id="description"
                value={seoData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descripción que aparece en buscadores"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="keywords">Palabras Clave</Label>
              <Input
                id="keywords"
                value={seoData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                placeholder="Separadas por comas"
              />
            </div>

            <div>
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                value={seoData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="Nombre del autor o empresa"
              />
            </div>

            <div>
              <Label htmlFor="siteUrl">URL del Sitio</Label>
              <Input
                id="siteUrl"
                value={seoData.siteUrl}
                onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                placeholder="https://tu-dominio.com"
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Scripts de Seguimiento (Tracking)</h3>
              <div className="space-y-2">
                <Label htmlFor="headScripts">Scripts de Cabecera (HEAD)</Label>
                <p className="text-xs text-gray-500">Ej: Facebook Pixel, Google Analytics. (Se inyectan en &lt;head&gt;)</p>
                <Textarea
                  id="headScripts"
                  value={(seoData as any).headScripts || ''}
                  onChange={(e) => handleInputChange('headScripts', e.target.value)}
                  placeholder="<script>...</script>"
                  className="font-mono text-xs h-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyScripts">Scripts de Cuerpo (BODY)</Label>
                <p className="text-xs text-gray-500">Ej: Chat Widgets. (Se inyectan después de &lt;body&gt;)</p>
                <Textarea
                  id="bodyScripts"
                  value={(seoData as any).bodyScripts || ''}
                  onChange={(e) => handleInputChange('bodyScripts', e.target.value)}
                  placeholder="<script>...</script>"
                  className="font-mono text-xs h-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redes Sociales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Open Graph & Redes Sociales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Imagen de Portada (Open Graph)</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value={seoData.ogImage}
                  onChange={(e) => handleInputChange('ogImage', e.target.value)}
                  placeholder="/og-image.jpg"
                />
                <Button
                  variant="outline"
                  onClick={() => handleImageUpload('ogImage')}
                  size="sm"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Recomendado: 1200x630px, formato JPG o PNG
              </p>
              {seoData.ogImage && (
                <div className="mt-2">
                  <img
                    src={seoData.ogImage}
                    alt="Vista previa"
                    className="w-full max-w-xs rounded border"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Vista Previa en Redes Sociales</Label>
              <div className="border rounded-lg p-4 bg-gray-50 mt-2">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-gray-300 rounded flex-shrink-0 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {seoData.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {seoData.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {seoData.siteUrl}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Iconos y Favicon */}
      <Card>
        <CardHeader>
          <CardTitle>Iconos y Favicon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Favicon</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value={seoData.favicon}
                  onChange={(e) => handleInputChange('favicon', e.target.value)}
                  placeholder="/favicon.ico"
                />
                <Button
                  variant="outline"
                  onClick={() => handleImageUpload('favicon')}
                  size="sm"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                32x32px, formato ICO o PNG
              </p>
            </div>

            <div>
              <Label>Apple Touch Icon</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value={seoData.appleTouchIcon}
                  onChange={(e) => handleInputChange('appleTouchIcon', e.target.value)}
                  placeholder="/apple-touch-icon.png"
                />
                <Button
                  variant="outline"
                  onClick={() => handleImageUpload('appleTouchIcon')}
                  size="sm"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                180x180px, formato PNG
              </p>
            </div>

            <div>
              <Label htmlFor="themeColor">Color del Tema</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="themeColor"
                  type="color"
                  value={seoData.themeColor}
                  onChange={(e) => handleInputChange('themeColor', e.target.value)}
                  className="w-12 h-8 p-1 rounded cursor-pointer"
                />
                <Input
                  value={seoData.themeColor}
                  onChange={(e) => handleInputChange('themeColor', e.target.value)}
                  placeholder="#2563EB"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Color para navegadores móviles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Previa del HTML */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa del HTML</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            <pre>{`<head>
  <title>${seoData.title}</title>
  <meta name="description" content="${seoData.description}" />
  <meta name="keywords" content="${seoData.keywords}" />
  <meta name="author" content="${seoData.author}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="${seoData.title}" />
  <meta property="og:description" content="${seoData.description}" />
  <meta property="og:image" content="${seoData.siteUrl}${seoData.ogImage}" />
  <meta property="og:url" content="${seoData.siteUrl}" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${seoData.title}" />
  <meta name="twitter:description" content="${seoData.description}" />
  <meta name="twitter:image" content="${seoData.siteUrl}${seoData.ogImage}" />
  
  <!-- Icons -->
  <link rel="icon" href="${seoData.favicon}" />
  <link rel="apple-touch-icon" href="${seoData.appleTouchIcon}" />
  <meta name="theme-color" content="${seoData.themeColor}" />
</head>`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeoManager;
