
import React, { useState, useEffect } from 'react';
import { Upload, Image, Trash2, Edit, Eye, Download, Link } from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MediaFile {
  id: number;
  name: string;
  url: string;
  type: string;
  size: string;
  category: string;
  altText: string;
  description: string;
  uploadDate: string;
  terminal?: string;
}

const MediaManager = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [uploadData, setUploadData] = useState({
    name: '',
    url: '',
    category: 'general',
    altText: '',
    description: '',
    terminal: ''
  });

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch files from Supabase Storage
  useEffect(() => {
    const fetchFiles = async () => {
      // TODO: Implement list files endpoint on server
      // For now, we only show what we upload in this session or implement persistence later
      setLoading(false);
      setMediaFiles([]);
    };

    fetchFiles();
  }, []);

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'logos', label: 'Logos' },
    { value: 'terminals', label: 'Terminales' },
    { value: 'banners', label: 'Banners' },
    { value: 'seo', label: 'SEO/Meta' },
    { value: 'general', label: 'General' }
  ];

  const terminals = [
    { value: 'general', label: 'General' },
    { value: 'Posadas', label: 'Posadas' },
    { value: 'Oberá', label: 'Oberá' },
    { value: 'Puerto Iguazú', label: 'Puerto Iguazú' },
    { value: 'Eldorado', label: 'Eldorado' }
  ];

  const filteredFiles = mediaFiles.filter(file =>
    selectedCategory === 'all' || file.category === selectedCategory
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validation
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }

      try {
        setLoading(true);

        // Upload to Local Server
        const response = await api.uploadImage(file);

        const newFile: MediaFile = {
          id: Date.now(),
          name: uploadData.name || file.name,
          url: response.url,
          type: file.type,
          size: `${Math.round(file.size / 1024)} KB`,
          category: uploadData.category,
          altText: uploadData.altText || file.name,
          description: uploadData.description,
          uploadDate: new Date().toISOString().split('T')[0],
          terminal: uploadData.terminal || 'general'
        };

        console.log('Media file uploaded successfully:', response.url);
        setMediaFiles(prev => [...prev, newFile]);
        setShowUploadForm(false);
        setUploadData({
          name: '',
          url: '',
          category: 'general',
          altText: '',
          description: '',
          terminal: ''
        });

        alert('Archivo subido exitosamente');
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error al subir el archivo. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUrlUpload = () => {
    if (uploadData.url && uploadData.name) {
      const newFile: MediaFile = {
        id: Date.now(),
        name: uploadData.name,
        url: uploadData.url,
        type: 'image/external',
        size: 'N/A',
        category: uploadData.category,
        altText: uploadData.altText || uploadData.name,
        description: uploadData.description,
        uploadDate: new Date().toISOString().split('T')[0],
        terminal: uploadData.terminal || 'general'
      };

      setMediaFiles(prev => [...prev, newFile]);
      setShowUploadForm(false);
      setUploadData({
        name: '',
        url: '',
        category: 'general',
        altText: '',
        description: '',
        terminal: ''
      });
    }
  };

  const handleEdit = (file: MediaFile) => {
    setEditingFile(file);
    setUploadData({
      name: file.name,
      url: file.url,
      category: file.category,
      altText: file.altText,
      description: file.description,
      terminal: file.terminal || 'general'
    });
    setShowUploadForm(true);
  };

  const handleUpdate = () => {
    if (editingFile) {
      setMediaFiles(prev => prev.map(file =>
        file.id === editingFile.id
          ? {
            ...file,
            name: uploadData.name,
            category: uploadData.category,
            altText: uploadData.altText,
            description: uploadData.description,
            terminal: uploadData.terminal
          }
          : file
      ));
      setEditingFile(null);
      setShowUploadForm(false);
      setUploadData({
        name: '',
        url: '',
        category: 'general',
        altText: '',
        description: '',
        terminal: ''
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      setMediaFiles(prev => prev.filter(file => file.id !== id));
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copiada al portapapeles');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Medios</h2>
          <p className="text-gray-600">Administra imágenes, logos y archivos multimedia</p>
        </div>
        <Button onClick={() => setShowUploadForm(true)} className="bg-primary hover:bg-primary-600">
          <Upload className="h-4 w-4 mr-2" />
          Subir Archivo
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{mediaFiles.length}</div>
            <p className="text-sm text-gray-600">Total Archivos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">
              {mediaFiles.filter(f => f.category === 'logos').length}
            </div>
            <p className="text-sm text-gray-600">Logos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">
              {mediaFiles.filter(f => f.category === 'terminals').length}
            </div>
            <p className="text-sm text-gray-600">Terminales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {mediaFiles.filter(f => f.category === 'seo').length}
            </div>
            <p className="text-sm text-gray-600">SEO</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulario de Subida */}
      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingFile ? 'Editar Archivo' : 'Subir Nuevo Archivo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Archivo</Label>
                  <Input
                    id="name"
                    value={uploadData.name}
                    onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre descriptivo del archivo"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={uploadData.category} onValueChange={(value) => setUploadData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat.value !== 'all').map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="altText">Texto Alternativo (Alt Text)</Label>
                  <Input
                    id="altText"
                    value={uploadData.altText}
                    onChange={(e) => setUploadData(prev => ({ ...prev, altText: e.target.value }))}
                    placeholder="Descripción de la imagen para SEO"
                  />
                </div>
                <div>
                  <Label htmlFor="terminal">Terminal Asociada</Label>
                  <Select value={uploadData.terminal} onValueChange={(value) => setUploadData(prev => ({ ...prev, terminal: value }))}>
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
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el propósito y uso de este archivo"
                  rows={3}
                />
              </div>

              {!editingFile && (
                <>
                  <div>
                    <Label htmlFor="url">URL Externa (opcional)</Label>
                    <Input
                      id="url"
                      value={uploadData.url}
                      onChange={(e) => setUploadData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <Label htmlFor="file">O subir archivo desde dispositivo:</Label>
                      <Input
                        id="file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUploadForm(false);
                    setEditingFile(null);
                    setUploadData({
                      name: '',
                      url: '',
                      category: 'general',
                      altText: '',
                      description: '',
                      terminal: ''
                    });
                  }}
                >
                  Cancelar
                </Button>
                {editingFile ? (
                  <Button onClick={handleUpdate}>
                    Actualizar Archivo
                  </Button>
                ) : (
                  <Button onClick={handleUrlUpload} disabled={!uploadData.url && !uploadData.name}>
                    Subir por URL
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Galería de Archivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {file.type.startsWith('image/') ? (
                <img
                  src={file.url}
                  alt={file.altText}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm truncate">{file.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {file.category}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{file.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{file.size}</span>
                  <span>{file.uploadDate}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(file)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(file.url)}
                      className="h-8 w-8 p-0"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay archivos</h3>
          <p className="text-gray-500 mb-4">
            {selectedCategory === 'all'
              ? 'Sube tu primer archivo para comenzar'
              : `No hay archivos en la categoría "${categories.find(c => c.value === selectedCategory)?.label}"`
            }
          </p>
          <Button onClick={() => setShowUploadForm(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Subir Archivo
          </Button>
        </div>
      )}
    </div>
  );
};

export default MediaManager;
