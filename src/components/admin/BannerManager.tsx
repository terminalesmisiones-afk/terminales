
import React, { useState } from 'react';
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

interface Banner {
  id: number;
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
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: 1,
      title: 'Publicidad Restaurant Central',
      imageUrl: '/placeholder.svg',
      linkUrl: 'https://restaurantcentral.com',
      uploadType: 'url' as const,
      position: 'header',
      terminal: 'Posadas',
      deviceType: 'desktop',
      showOnMobile: true,
      showOnTablet: true,
      showOnDesktop: true,
      isActive: true,
      startDate: '2024-06-01',
      endDate: '2024-07-01',
      clicks: 156,
      impressions: 2340
    }
  ]);

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
    { value: 'header', label: 'Header' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'footer', label: 'Footer' },
    { value: 'content', label: 'Entre Contenido' }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newBanner: Banner = {
      id: editingBanner ? editingBanner.id : Date.now(),
      ...formData,
      uploadType: formData.uploadType as 'url' | 'file' | 'html',
      clicks: editingBanner ? editingBanner.clicks : 0,
      impressions: editingBanner ? editingBanner.impressions : 0
    };

    if (editingBanner) {
      setBanners(prev => prev.map(b => b.id === editingBanner.id ? newBanner : b));
    } else {
      setBanners(prev => [...prev, newBanner]);
    }

    setShowForm(false);
    setEditingBanner(null);
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

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este banner?')) {
      setBanners(prev => prev.filter(b => b.id !== id));
    }
  };

  const toggleActive = (id: number) => {
    setBanners(prev => prev.map(b => 
      b.id === id ? { ...b, isActive: !b.isActive } : b
    ));
  };

  const selectedDeviceType = deviceTypes.find(dt => dt.value === formData.deviceType);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Banners</h2>
          <p className="text-gray-600">Administra la publicidad en el sitio web</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-600">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Banner
        </Button>
      </div>

      {/* Información sobre dimensiones recomendadas */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Dimensiones recomendadas:</strong> Escritorio: 1200x300px, Tablet: 800x200px, Móvil: 400x250px (más alto para mejor visibilidad)
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
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="uploadType">Tipo de Banner</Label>
                  <Select value={formData.uploadType} onValueChange={(value: 'url' | 'file' | 'html') => setFormData(prev => ({ ...prev, uploadType: value }))}>
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
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // En producción, aquí subirías el archivo
                          const mockUrl = URL.createObjectURL(file);
                          setFormData(prev => ({ ...prev, imageUrl: mockUrl }));
                        }
                      }}
                      required={!formData.imageUrl}
                    />
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, SVG hasta 5MB</p>
                  </div>
                )}
                
                {formData.uploadType === 'html' && (
                  <div className="md:col-span-2">
                    <Label htmlFor="htmlCode">Código HTML</Label>
                    <Textarea
                      id="htmlCode"
                      value={formData.htmlCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, htmlCode: e.target.value }))}
                      placeholder="Pega aquí tu código HTML (ej. Google AdSense, scripts de terceros)"
                      rows={4}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Código HTML válido para embebidos</p>
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
                  {selectedDeviceType && (
                    <p className="text-xs text-gray-500 mt-1">
                      Dimensión recomendada: {selectedDeviceType.dimensions}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Mostrar en Dispositivos</Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showOnMobile"
                        checked={formData.showOnMobile}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showOnMobile: checked }))}
                      />
                      <Label htmlFor="showOnMobile">Móvil</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showOnTablet"
                        checked={formData.showOnTablet}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showOnTablet: checked }))}
                      />
                      <Label htmlFor="showOnTablet">Tablet</Label>
                    </div>
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
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {banner.uploadType === 'html' ? (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <FileText className="h-6 w-6 text-gray-500" />
                        </div>
                      ) : (
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{banner.title}</div>
                        <div className="text-sm text-gray-500">
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
                      <div>{banner.startDate}</div>
                      <div>{banner.endDate}</div>
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
                        onClick={() => toggleActive(banner.id)}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BannerManager;
