
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Image, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput, sanitizeHTML, validateFile } from '@/utils/security';
import { api } from '@/services/api';

interface Banner {
  id: string | number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  htmlCode?: string;
  uploadType: 'url' | 'file' | 'html';
  position: string;
  terminal: string;
  deviceType: string;
  showOnMobile: boolean;
  showOnTablet: boolean;
  showOnDesktop: boolean;
  isActive: boolean;
  startDate: string;
  endDate: string;
  clicks: number;
  impressions: number;
}

const BannerManager = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    htmlCode: '',
    uploadType: 'url', // 'url', 'file', 'html'
    position: 'header',
    terminal: 'all',
    deviceType: 'desktop',
    showOnMobile: true,
    showOnTablet: true,
    showOnDesktop: true,
    isActive: true,
    startDate: '',
    endDate: ''
  });

  const positions = [
    { value: 'header', label: 'Header (Todo el sitio)' },
    { value: 'footer', label: 'Footer (Todo el sitio)' },
    { value: 'home-middle', label: 'Inicio (Bajo Buscador)' },
    { value: 'terminal-top', label: 'Terminal (Bajo Título)' },
    { value: 'terminal-middle', label: 'Terminal (Bajo Horarios/Compartir)' },
    { value: 'sidebar-map-bottom', label: 'Sidebar (Bajo Mapa)' },
    { value: 'terminals-page-companies', label: 'Página Terminales - Empresas' },
    { value: 'terminals-page-private', label: 'Página Terminales - Particulares' },

    // --- GRANULAR GRID SLOTS (Inicio) ---
    // Pos 1
    { value: 'home-grid-pos-1-card', label: 'Inicio - Posición 1 (Tarjeta)' },
    { value: 'home-grid-pos-1-wide', label: 'Inicio - Posición 1 (Ancho Completo)' },
    // Pos 2
    { value: 'home-grid-pos-2-card', label: 'Inicio - Posición 2 (Tarjeta)' },
    { value: 'home-grid-pos-2-wide', label: 'Inicio - Posición 2 (Ancho Completo)' },
    // Pos 3
    { value: 'home-grid-pos-3-card', label: 'Inicio - Posición 3 (Tarjeta)' },
    { value: 'home-grid-pos-3-wide', label: 'Inicio - Posición 3 (Ancho Completo)' },
    // Pos 4
    { value: 'home-grid-pos-4-card', label: 'Inicio - Posición 4 (Tarjeta)' },
    { value: 'home-grid-pos-4-wide', label: 'Inicio - Posición 4 (Ancho Completo)' },
    // Pos 5
    { value: 'home-grid-pos-5-card', label: 'Inicio - Posición 5 (Tarjeta)' },
    { value: 'home-grid-pos-5-wide', label: 'Inicio - Posición 5 (Ancho Completo)' },
    // Pos 6
    { value: 'home-grid-pos-6-card', label: 'Inicio - Posición 6 (Tarjeta)' },
    { value: 'home-grid-pos-6-wide', label: 'Inicio - Posición 6 (Ancho Completo)' },
    // Pos 7
    { value: 'home-grid-pos-7-card', label: 'Inicio - Posición 7 (Tarjeta)' },
    { value: 'home-grid-pos-7-wide', label: 'Inicio - Posición 7 (Ancho Completo)' },
    // Pos 8
    { value: 'home-grid-pos-8-card', label: 'Inicio - Posición 8 (Tarjeta)' },
    { value: 'home-grid-pos-8-wide', label: 'Inicio - Posición 8 (Ancho Completo)' },
    // Pos 9
    { value: 'home-grid-pos-9-card', label: 'Inicio - Posición 9 (Tarjeta)' },
    { value: 'home-grid-pos-9-wide', label: 'Inicio - Posición 9 (Ancho Completo)' },

    // --- GRANULAR GRID SLOTS (Pág. Terminales) ---
    // Pos 1
    { value: 'terminals-page-grid-pos-1-card', label: 'Pág. Terminales - Posición 1 (Tarjeta)' },
    { value: 'terminals-page-grid-pos-1-wide', label: 'Pág. Terminales - Posición 1 (Ancho Completo)' },
    // Pos 2
    { value: 'terminals-page-grid-pos-2-card', label: 'Pág. Terminales - Posición 2 (Tarjeta)' },
    { value: 'terminals-page-grid-pos-2-wide', label: 'Pág. Terminales - Posición 2 (Ancho Completo)' },
    // Pos 3
    { value: 'terminals-page-grid-pos-3-card', label: 'Pág. Terminales - Posición 3 (Tarjeta)' },
    { value: 'terminals-page-grid-pos-3-wide', label: 'Pág. Terminales - Posición 3 (Ancho Completo)' },
    // Pos 4
    { value: 'terminals-page-grid-pos-4-card', label: 'Pág. Terminales - Posición 4 (Tarjeta)' },
    { value: 'terminals-page-grid-pos-4-wide', label: 'Pág. Terminales - Posición 4 (Ancho Completo)' },
    // Pos 5
    { value: 'terminals-page-grid-pos-5-card', label: 'Pág. Terminales - Posición 5 (Tarjeta)' },
    { value: 'terminals-page-grid-pos-5-wide', label: 'Pág. Terminales - Posición 5 (Ancho Completo)' },
    // Pos 6
    { value: 'terminals-page-grid-pos-6-card', label: 'Pág. Terminales - Posición 6 (Tarjeta)' },
    { value: 'terminals-page-grid-pos-6-wide', label: 'Pág. Terminales - Posición 6 (Ancho Completo)' },
    // Pos 7
    { value: 'terminals-page-grid-pos-7-card', label: 'Pág. Terminales - Posición 7 (Tarjeta)' },
    { value: 'terminals-page-grid-pos-7-wide', label: 'Pág. Terminales - Posición 7 (Ancho Completo)' },
    // Pos 8
    { value: 'terminals-page-grid-pos-8-card', label: 'Pág. Terminales - Posición 8 (Tarjeta)' },
    { value: 'terminals-page-grid-pos-8-wide', label: 'Pág. Terminales - Posición 8 (Ancho Completo)' },
    // Pos 9
    { value: 'terminals-page-grid-pos-9-card', label: 'Pág. Terminales - Posición 9 (Tarjeta)' },
    { value: 'terminals-page-grid-pos-9-wide', label: 'Pág. Terminales - Posición 9 (Ancho Completo)' },

    { value: 'sidebar-2', label: 'Sidebar 2 (Medio)' },
    { value: 'sidebar-3', label: 'Sidebar 3 (Inferior)' },
    { value: 'content-top', label: 'Contenido (Arriba)' },
    { value: 'content-bottom', label: 'Contenido (Abajo)' }
  ];

  const terminals = [
    { value: 'all', label: 'Todas las Terminales' },
    { value: 'Posadas', label: 'Posadas' },
    { value: 'Oberá', label: 'Oberá' },
    { value: 'Puerto Iguazú', label: 'Puerto Iguazú' },
    { value: 'Eldorado', label: 'Eldorado' }
  ];

  const deviceTypes = [
    { value: 'desktop', label: 'Escritorio', dimensions: '1200x300px' },
    { value: 'tablet', label: 'Tablet', dimensions: '800x200px' },
    { value: 'mobile', label: 'Móvil', dimensions: '400x250px' }
  ];

  const fetchBanners = async () => {
    setLoading(true);
    console.log('[BannerManager] Fetching banners...');
    try {
      // Test Ping
      try {
        const ping = await fetch('http://localhost:3005/api/ping');
        console.log('[BannerManager] Ping result:', ping.status, await ping.json());
      } catch (e) {
        console.error('[BannerManager] Ping failed:', e);
      }

      const data = await api.getAdminBanners();
      console.log('[BannerManager] Raw data received:', data);

      // Map DB snake_case to frontend camelCase
      const mappedData = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.image_url || '',
        linkUrl: item.link_url || '',
        htmlCode: item.html_code || '',
        uploadType: item.upload_type || 'url',
        position: item.position || 'header',
        terminal: item.terminal_id || 'all',
        deviceType: item.device_type || 'all',
        showOnMobile: Boolean(item.show_on_mobile),
        showOnTablet: Boolean(item.show_on_tablet),
        showOnDesktop: Boolean(item.show_on_desktop),
        isActive: Boolean(item.is_active),
        startDate: item.start_date || '',
        endDate: item.end_date || '',
        clicks: item.clicks || 0,
        impressions: item.impressions || 0
      }));
      console.log('[BannerManager] Mapped banners:', mappedData);
      setBanners(mappedData);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({ title: "Error", description: "No se pudieron cargar los banners.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "El título es requerido", variant: "destructive" });
      return;
    }

    const payload = {
      ...formData,
      uploadType: formData.uploadType as 'url' | 'file' | 'html',
    };

    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, payload);
        toast({ title: "Banner actualizado", description: "Los cambios se han guardado." });
      } else {
        await api.createBanner(payload);
        toast({ title: "Banner creado", description: "El nuevo banner está listo." });
      }

      setShowForm(false);
      setEditingBanner(null);
      resetForm();
      fetchBanners();

    } catch (error) {
      console.error('Error saving banner:', error);
      toast({ title: "Error", description: "Fallo al guardar el banner.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      linkUrl: '',
      htmlCode: '',
      uploadType: 'url',
      position: 'header',
      terminal: 'all',
      deviceType: 'desktop',
      showOnMobile: true,
      showOnTablet: true,
      showOnDesktop: true,
      isActive: true,
      startDate: '',
      endDate: ''
    });
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      htmlCode: banner.htmlCode || '',
      uploadType: banner.uploadType,
      position: banner.position,
      terminal: banner.terminal,
      deviceType: banner.deviceType,
      showOnMobile: banner.showOnMobile,
      showOnTablet: banner.showOnTablet,
      showOnDesktop: banner.showOnDesktop,
      isActive: banner.isActive,
      startDate: banner.startDate,
      endDate: banner.endDate
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este banner?')) {
      try {
        await api.deleteBanner(id);
        toast({ title: "Eliminado", description: "Banner eliminado correctamente." });
        fetchBanners();
      } catch (error) {
        console.error('Delete error:', error);
        toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
      }
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await api.updateBanner(banner.id, { ...banner, isActive: !banner.isActive });
      fetchBanners(); // Refresh to see update
      toast({ title: "Estado actualizado", description: `Banner ${!banner.isActive ? 'activado' : 'desactivado'}.` });
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const selectedDeviceType = deviceTypes.find(dt => dt.value === formData.deviceType);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });

      if (!validation.valid) {
        toast({ title: "Error", description: validation.error, variant: "destructive" });
        return;
      }

      try {
        // Use API uploadFile 
        const response = await api.uploadFile(file);
        setFormData(prev => ({ ...prev, imageUrl: response.url }));
        toast({ title: "Imagen subida", description: "Archivo cargado correctamente." });
      } catch (error: any) {
        console.error('Upload error:', error);
        toast({
          title: "Error",
          description: error.message || "Error al subir imagen.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Banners (v2.0)</h2>
          <p className="text-gray-600">Administra la publicidad en el sitio web</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingBanner(null); setShowForm(true); }} className="bg-primary hover:bg-primary-600">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Banner
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Dimensiones recomendadas:</strong> Escritorio: 1200x300px, Tablet: 800x200px, Móvil: 400x250px
        </AlertDescription>
      </Alert>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingBanner ? 'Editar Banner' : 'Nuevo Banner'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título del Banner</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: sanitizeInput(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="uploadType">Tipo de Banner</Label>
                  <Select value={formData.uploadType} onValueChange={(value) => setFormData(prev => ({ ...prev, uploadType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="url">URL de Imagen</SelectItem>
                      <SelectItem value="file">Archivo Local</SelectItem>
                      <SelectItem value="html">Código HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.uploadType === 'url' && (
                  <div>
                    <Label htmlFor="imageUrl">URL de la Imagen</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      required
                    />
                  </div>
                )}

                {formData.uploadType === 'file' && (
                  <div>
                    <Label htmlFor="imageFile">Subir Archivo</Label>
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      required={!formData.imageUrl}
                    />
                    {formData.imageUrl && (
                      <p className="text-xs text-green-600 mt-1">Imagen cargada: {formData.imageUrl.split('/').pop()}</p>
                    )}
                  </div>
                )}

                {formData.uploadType === 'html' && (
                  <div className="md:col-span-2">
                    <Label htmlFor="htmlCode">Código HTML</Label>
                    <Textarea
                      id="htmlCode"
                      value={formData.htmlCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, htmlCode: e.target.value }))}
                      placeholder="<script>...</script>"
                      rows={4}
                      required
                    />
                  </div>
                )}
                {formData.uploadType !== 'html' && (
                  <div>
                    <Label htmlFor="linkUrl">URL de Destino</Label>
                    <Input
                      id="linkUrl"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="position">Posición</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(pos => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="terminal">Terminal</Label>
                  <Select value={formData.terminal} onValueChange={(value) => setFormData(prev => ({ ...prev, terminal: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {terminals.map(term => (
                        <SelectItem key={term.value} value={term.value}>
                          {term.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deviceType">Tipo de Dispositivo</Label>
                  <Select value={formData.deviceType} onValueChange={(value) => setFormData(prev => ({ ...prev, deviceType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map(device => (
                        <SelectItem key={device.value} value={device.value}>
                          {device.label} ({device.dimensions})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Mostrar en Dispositivos</Label>
                  <div className="flex gap-4 mt-2">
                    {/* Mobile Switch */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showOnMobile"
                        checked={formData.showOnMobile}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showOnMobile: checked }))}
                      />
                      <Label htmlFor="showOnMobile">Móvil</Label>
                    </div>
                    {/* Tablet Switch */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showOnTablet"
                        checked={formData.showOnTablet}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showOnTablet: checked }))}
                      />
                      <Label htmlFor="showOnTablet">Tablet</Label>
                    </div>
                    {/* Desktop Switch */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showOnDesktop"
                        checked={formData.showOnDesktop}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showOnDesktop: checked }))}
                      />
                      <Label htmlFor="showOnDesktop">Escritorio</Label>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Banner Activo</Label>
                </div>
                <div>
                  <Label htmlFor="startDate">Fecha de Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingBanner ? 'Actualizar' : 'Crear'} Banner
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Banners</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Terminal</TableHead>
                <TableHead>Dispositivos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Estadísticas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No hay banners creados
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {banner.uploadType === 'html' ? (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <FileText className="h-6 w-6 text-gray-500" />
                          </div>
                        ) : (
                          <img
                            src={banner.imageUrl || '/placeholder.svg'}
                            alt={banner.title}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=60&fit=crop'; }}
                          />
                        )}
                        <div>
                          <div className="font-medium">{banner.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[150px]">
                            {banner.uploadType === 'html' ? 'Código HTML' : banner.linkUrl}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{banner.position}</Badge>
                    </TableCell>
                    <TableCell>{banner.terminal}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {banner.showOnMobile && <Badge variant="outline" className="text-xs">M</Badge>}
                        {banner.showOnTablet && <Badge variant="outline" className="text-xs">T</Badge>}
                        {banner.showOnDesktop && <Badge variant="outline" className="text-xs">D</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={banner.isActive ? "default" : "secondary"}>
                        {banner.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{banner.startDate || '-'}</div>
                        <div>{banner.endDate || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{banner.impressions} vistas</div>
                        <div>{banner.clicks} clicks</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(banner)}
                        >
                          {banner.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BannerManager;
