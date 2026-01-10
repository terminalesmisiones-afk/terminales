import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash, Plus, FileText, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SectionBuilder from './SectionBuilder';
import PageRenderer from '@/components/PageRenderer';

interface Page {
    id: number;
    title: string;
    slug: string;
    featured_image?: string;
    content: string;
    is_published: number; // 1 or 0
    created_at: string;
}

const PagesManager = () => {
    const [pages, setPages] = useState<Page[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [formData, setFormData] = useState({ title: '', slug: '', featured_image: '', content: '', is_published: false });
    const { toast } = useToast();

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const data = await api.getPages();
            setPages(data);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'No se pudieron cargar las páginas', variant: 'destructive' });
        }
    };

    const resetForm = () => {
        setFormData({ title: '', slug: '', featured_image: '', content: '', is_published: false });
        setEditingPage(null);
    };

    const handleEdit = (page: Page) => {
        setEditingPage(page);
        setFormData({
            title: page.title,
            slug: page.slug,
            featured_image: page.featured_image || '',
            content: page.content,
            is_published: Boolean(page.is_published)
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta página?')) return;
        try {
            await api.deletePage(id);
            toast({ title: 'Página eliminada' });
            fetchPages();
        } catch (error) {
            toast({ title: 'Error al eliminar', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPage) {
                await api.updatePage(editingPage.id, { ...formData, is_published: formData.is_published });
                toast({ title: 'Página actualizada' });
            } else {
                await api.createPage({ ...formData, is_published: formData.is_published });
                toast({ title: 'Página creada' });
            }
            setIsDialogOpen(false);
            resetForm();
            fetchPages();
        } catch (error) {
            toast({ title: 'Error al guardar', variant: 'destructive' });
        }
    };

    // Auto-generate slug from title if slug is empty
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: !editingPage && !prev.slug ? title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') : prev.slug
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestor de Páginas</h2>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nueva Página
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-screen max-w-[95vw] h-[95vh] max-h-screen flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-4 border-b bg-white flex-none">
                            <DialogTitle>{editingPage ? 'Editar Página' : 'Nueva Página'}</DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 flex overflow-hidden">
                            {/* LEFT COLUMN: EDITOR */}
                            <div className="w-1/3 border-r overflow-y-auto p-6 bg-white shrink-0">
                                <form id="page-form" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Título</Label>
                                            <Input id="title" value={formData.title} onChange={handleTitleChange} required placeholder="Título de la página" />
                                        </div>
                                        <div>
                                            <Label htmlFor="slug">Slug (URL)</Label>
                                            <div className="flex items-center">
                                                <span className="text-gray-500 mr-2 text-sm">/</span>
                                                <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
                                            </div>
                                        </div>

                                        <div className="border p-4 rounded-md bg-gray-50">
                                            <Label className="mb-2 block">Imagen Destacada</Label>
                                            <div className="flex flex-col gap-2">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        try {
                                                            const data = new FormData();
                                                            data.append('file', file);
                                                            const res = await fetch('/api/upload', { method: 'POST', body: data });
                                                            if (!res.ok) throw new Error('Upload failed');
                                                            const json = await res.json();
                                                            setFormData(prev => ({ ...prev, featured_image: json.url }));
                                                        } catch (err) {
                                                            console.error(err);
                                                            toast({ title: 'Error', description: 'Error al subir imagen', variant: 'destructive' });
                                                        }
                                                    }}
                                                />
                                                {formData.featured_image && (
                                                    <div className="relative group mt-2">
                                                        <img src={formData.featured_image} alt="Destacada" className="w-full h-32 object-cover rounded-md" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-70 hover:opacity-100"
                                                        >
                                                            <Trash className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="mb-2 block font-bold">Bloques de Contenido</Label>
                                            <SectionBuilder
                                                sections={(() => {
                                                    try {
                                                        const parsed = JSON.parse(formData.content);
                                                        return Array.isArray(parsed) ? parsed : [];
                                                    } catch (e) {
                                                        return formData.content ? [{ id: '1', type: 'richtext', data: { content: formData.content } }] : [];
                                                    }
                                                })()}
                                                onChange={(sections) => setFormData(prev => ({ ...prev, content: JSON.stringify(sections) }))}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2 pt-4 border-t">
                                            <Switch
                                                id="published"
                                                checked={formData.is_published}
                                                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                                            />
                                            <Label htmlFor="published">Publicado</Label>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* RIGHT COLUMN: PREVIEW */}
                            <div className="flex-1 bg-gray-100 overflow-y-auto relative">
                                <div className="absolute top-4 right-4 bg-black/75 text-white px-3 py-1 rounded-full text-xs font-bold z-50 uppercase tracking-widest pointer-events-none">
                                    Vista Previa en Vivo
                                </div>
                                <div className="min-h-full">
                                    <PageRenderer
                                        title={formData.title || 'Título de la página'}
                                        featured_image={formData.featured_image}
                                        content={formData.content}
                                    />
                                    {/* Footer Simulator */}
                                    <div className="bg-gray-800 text-gray-400 py-8 text-center text-sm">
                                        Footer del Sitio
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-white flex justify-end gap-2 flex-none">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" form="page-form">Guardar Página</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-lg shadow border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pages.map((page) => (
                            <TableRow key={page.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                        {page.title}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="bg-gray-100 px-2 py-1 rounded text-xs text-blue-600">/{page.slug}</code>
                                </TableCell>
                                <TableCell>
                                    {page.is_published ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Publicado
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Borrador
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => window.open(`/${page.slug}`, '_blank')}>
                                            <Globe className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(page)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(page.id)} className="text-red-500 hover:text-red-700">
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {pages.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    No has creado ninguna página.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default PagesManager;
