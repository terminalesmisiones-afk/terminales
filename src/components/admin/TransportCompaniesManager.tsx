import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2, Phone, Mail, Upload, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput, sanitizeHTML, isValidEmail, isValidPhone, isValidURL, validateFile } from '@/utils/security';
import { api } from '@/services/api';

interface TransportCompany {
  id: string | number;
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
  lastUpdated: string;
}

const TransportCompaniesManager = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingCompany, setEditingCompany] = useState<TransportCompany | null>(null);
  const [companies, setCompanies] = useState<TransportCompany[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Omit<TransportCompany, 'id' | 'lastUpdated'>>({
    name: '',
    logo: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    website: '',
    description: '',
    ticketOffices: '',
    isActive: true
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setViewMode(window.innerWidth < 768 ? 'cards' : 'table');
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminCompanies();
      // Map backend snake_case to frontend camelCase
      const mappedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        logo: item.logo || '',
        phone: item.phone || '',
        whatsapp: item.whatsapp || '',
        email: item.email || '',
        address: item.address || '',
        website: item.website || '',
        description: item.description || '',
        ticketOffices: item.ticket_offices || '', // mapping from DB column
        isActive: Boolean(item.is_active),
        lastUpdated: item.last_updated || item.updated_at || new Date().toISOString().split('T')[0]
      }));
      setCompanies(mappedData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las empresas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      logo: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      website: '',
      description: '',
      ticketOffices: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (company: TransportCompany) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      logo: company.logo,
      phone: company.phone || '',
      whatsapp: company.whatsapp || '',
      email: company.email || '',
      address: company.address || '',
      website: company.website || '',
      description: company.description || '',
      ticketOffices: company.ticketOffices || '',
      isActive: company.isActive
    });
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'El nombre de la empresa es requerido';
    else if (formData.name.trim().length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres';
    if (formData.email && !isValidEmail(formData.email)) errors.email = 'El formato del email no es válido';
    if (formData.phone && !isValidPhone(formData.phone)) errors.phone = 'El formato del teléfono no es válido';
    if (formData.whatsapp && !isValidPhone(formData.whatsapp)) errors.whatsapp = 'El formato del WhatsApp no es válido';
    if (formData.website && !isValidURL(formData.website)) errors.website = 'El formato de la URL no es válido';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({ title: "Error de validación", description: "Por favor, corrige los errores.", variant: "destructive" });
      return;
    }

    const sanitizedData = {
      ...formData,
      name: sanitizeInput(formData.name.trim()),
      phone: sanitizeInput(formData.phone.trim()),
      whatsapp: sanitizeInput(formData.whatsapp.trim()),
      email: sanitizeInput(formData.email.trim().toLowerCase()),
      address: sanitizeInput(formData.address.trim()),
      website: sanitizeInput(formData.website.trim()),
      description: sanitizeHTML(formData.description),
      ticketOffices: sanitizeInput(formData.ticketOffices.trim())
    };

    try {
      if (editingCompany) {
        await api.updateCompany(editingCompany.id, {
          ...sanitizedData,
          isActive: formData.isActive
        });
        toast({ title: "Empresa actualizada", description: "Los cambios se han guardado correctamente." });
      } else {
        await api.createCompany({
          ...sanitizedData,
          isActive: formData.isActive
        });
        toast({ title: "Empresa creada", description: "La nueva empresa se ha creado correctamente." });
      }
      setShowModal(false);
      setValidationErrors({});
      fetchCompanies(); // Refresh list
    } catch (error) {
      console.error('Error saving company:', error);
      toast({ title: "Error", description: "No se pudo guardar la empresa.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta empresa?')) {
      try {
        await api.deleteCompany(id);
        toast({ title: "Empresa eliminada", description: "La empresa ha sido eliminada." });
        fetchCompanies();
      } catch (error) {
        console.error('Error deleting company:', error);
        toast({ title: "Error", description: "No se pudo eliminar la empresa.", variant: "destructive" });
      }
    }
  };

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const validation = validateFile(file, { maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] });
        if (!validation.valid) {
          toast({ title: "Error en el archivo", description: validation.error, variant: "destructive" });
          return;
        }

        try {
          // Use real API upload
          const response = await api.uploadFile(file);
          setFormData(prev => ({ ...prev, logo: response.url }));
          toast({ title: "Logo subido", description: `El logo ${file.name} se ha subido correctamente.` });
        } catch (error) {
          console.error('Upload error:', error);
          toast({ title: "Error de subida", description: "No se pudo subir la imagen.", variant: "destructive" });
        }
      }
    };
    input.click();
  };

  const CompanyCard = ({ company }: { company: TransportCompany }) => (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <img
              src={company.logo || '/placeholder.svg'}
              alt={company.name}
              className="w-12 h-8 object-contain rounded"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=60&fit=crop'; }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{company.name}</h3>
              <div className="flex items-center mt-1">
                <Badge variant={company.isActive ? "default" : "secondary"} className="text-xs">
                  {company.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(company)} className="h-8 px-3">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDelete(company.id)} className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Empresas de Transporte</h2>
          <p className="text-gray-600">Gestiona las empresas de transporte del sistema</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary-600 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{companies.length}</div>
            <p className="text-sm text-gray-600">Total Empresas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">
              {companies.filter(c => c.isActive).length}
            </div>
            <p className="text-sm text-gray-600">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">
              {companies.filter(c => c.whatsapp).length}
            </div>
            <p className="text-sm text-gray-600">Con WhatsApp</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {isMobile ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''} encontrada{filteredCompanies.length !== 1 ? 's' : ''}
          </div>
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Actualización</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={company.logo || '/placeholder.svg'}
                            alt={company.name}
                            className="w-12 h-8 object-contain rounded"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=60&fit=crop'; }}
                          />
                          <div>
                            <div className="font-medium">{company.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {company.phone}
                          </div>
                          {company.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {company.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm text-gray-600">{company.address}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={company.isActive ? "default" : "secondary"}>
                          {company.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">{company.lastUpdated}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(company)} className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(company.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className={`${isMobile ? 'max-w-[95vw] h-[90vh] overflow-y-auto' : 'max-w-2xl max-h-[90vh] overflow-y-auto'}`}>
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
            </DialogTitle>
          </DialogHeader>

          {Object.keys(validationErrors).length > 0 && (
            <Alert className="mx-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                Por favor, corrige los errores en el formulario antes de continuar.
              </AlertDescription>
            </Alert>
          )}

          <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'} py-4 px-6`}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Nombre de la Empresa</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Empresa Crucero del Norte"
                  required
                  className={`mt-1 ${validationErrors.name ? 'border-red-500' : ''}`}
                />
                {validationErrors.name && <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium">Logo de la Empresa</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={formData.logo}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                    placeholder="URL del logo"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleLogoUpload} size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {formData.logo && (
                  <img
                    src={formData.logo}
                    alt="Vista previa"
                    className="w-32 h-20 object-contain mt-2 rounded border"
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&h=100&fit=crop'; }}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ej: +54 376 442-7788"
                  className={`mt-1 ${validationErrors.phone ? 'border-red-500' : ''}`}
                />
                {validationErrors.phone && <p className="text-sm text-red-600 mt-1">{validationErrors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="Ej: +54 9 376 442-7788"
                  className={`mt-1 ${validationErrors.whatsapp ? 'border-red-500' : ''}`}
                />
                {validationErrors.whatsapp && <p className="text-sm text-red-600 mt-1">{validationErrors.whatsapp}</p>}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Ej: info@empresa.com"
                  className={`mt-1 ${validationErrors.email ? 'border-red-500' : ''}`}
                />
                {validationErrors.email && <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="address" className="text-sm font-medium">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Dirección principal"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="website" className="text-sm font-medium">Sitio Web</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://empresa.com"
                  className={`mt-1 ${validationErrors.website ? 'border-red-500' : ''}`}
                />
                {validationErrors.website && <p className="text-sm text-red-600 mt-1">{validationErrors.website}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la empresa"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ticketOffices" className="text-sm font-medium">Boleterías</Label>
                <Textarea
                  id="ticketOffices"
                  value={formData.ticketOffices}
                  onChange={(e) => setFormData(prev => ({ ...prev, ticketOffices: e.target.value }))}
                  placeholder="Ubicaciones de boleterías (separadas por comas)"
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary-600 w-full sm:w-auto">
              {editingCompany ? 'Actualizar' : 'Crear'} Empresa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransportCompaniesManager;
