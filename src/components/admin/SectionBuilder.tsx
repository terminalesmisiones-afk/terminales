import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash, GripVertical, ChevronUp, ChevronDown, Image as ImageIcon, Type, LayoutGrid } from 'lucide-react';
import QuillEditor from '@/components/QuillEditor';

export type SectionType = 'hero' | 'richtext' | 'features';

export interface Section {
    id: string;
    type: SectionType;
    data: any;
}

interface SectionBuilderProps {
    sections: Section[];
    onChange: (sections: Section[]) => void;
}

const SectionBuilder: React.FC<SectionBuilderProps> = ({ sections, onChange }) => {

    const addSection = (type: SectionType) => {
        const newSection: Section = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            data: type === 'hero' ? { title: 'Bienvenidos', subtitle: 'Subtítulo impactante', image: '', ctaText: 'Ver más', ctaLink: '#' }
                : type === 'features' ? { items: [{ title: 'Característica 1', description: 'Descripción breve' }] }
                    : { content: '' } // richtext
        };
        onChange([...sections, newSection]);
    };

    const updateSection = (id: string, data: any) => {
        onChange(sections.map(s => s.id === id ? { ...s, data } : s));
    };

    const removeSection = (id: string) => {
        onChange(sections.filter(s => s.id !== id));
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        onChange(newSections);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 justify-center pb-4 border-b">
                <Button type="button" onClick={() => addSection('hero')} variant="outline" className="flex gap-2"><ImageIcon className="h-4 w-4" /> + Hero</Button>
                <Button type="button" onClick={() => addSection('richtext')} variant="outline" className="flex gap-2"><Type className="h-4 w-4" /> + Texto</Button>
                <Button type="button" onClick={() => addSection('features')} variant="outline" className="flex gap-2"><LayoutGrid className="h-4 w-4" /> + Features</Button>
            </div>

            <div className="space-y-4">
                {sections.map((section, index) => (
                    <Card key={section.id} className="relative group border-l-4 border-l-primary/20 hover:border-l-primary transition-all">
                        <CardHeader className="py-3 px-4 bg-gray-50 flex flex-row justify-between items-center">
                            <div className="font-semibold text-sm uppercase text-gray-500">{section.type}</div>
                            <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                <Button type="button" variant="ghost" size="sm" onClick={() => moveSection(index, 'up')} disabled={index === 0}><ChevronUp className="h-4 w-4" /></Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1}><ChevronDown className="h-4 w-4" /></Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeSection(section.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash className="h-4 w-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            {/* HERO EDITOR */}
                            {section.type === 'hero' && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><Label>Título</Label><Input value={section.data.title} onChange={(e) => updateSection(section.id, { ...section.data, title: e.target.value })} /></div>
                                        <div><Label>Subtítulo</Label><Input value={section.data.subtitle} onChange={(e) => updateSection(section.id, { ...section.data, subtitle: e.target.value })} /></div>
                                    </div>
                                    <div><Label>Imagen URL</Label><Input value={section.data.image} onChange={(e) => updateSection(section.id, { ...section.data, image: e.target.value })} placeholder="https://..." /></div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><Label>Texto Botón</Label><Input value={section.data.ctaText} onChange={(e) => updateSection(section.id, { ...section.data, ctaText: e.target.value })} /></div>
                                        <div><Label>Enlace Botón</Label><Input value={section.data.ctaLink} onChange={(e) => updateSection(section.id, { ...section.data, ctaLink: e.target.value })} /></div>
                                    </div>
                                </div>
                            )}

                            {/* RICH TEXT EDITOR */}
                            {section.type === 'richtext' && (
                                <QuillEditor
                                    value={section.data.content}
                                    onChange={(html) => updateSection(section.id, { ...section.data, content: html })}
                                    className="min-h-[200px]"
                                />
                            )}

                            {/* FEATURES EDITOR */}
                            {section.type === 'features' && (
                                <div className="space-y-4">
                                    {section.data.items?.map((item: any, i: number) => (
                                        <div key={i} className="flex gap-2 items-start border p-2 rounded bg-gray-50/50 flex-col">
                                            <div className="flex justify-between w-full">
                                                <h4 className="text-xs font-bold text-gray-500">Feature #{i + 1}</h4>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => {
                                                    const newItems = section.data.items.filter((_, idx) => idx !== i);
                                                    updateSection(section.id, { ...section.data, items: newItems });
                                                }}><Trash className="h-4 w-4 text-red-400" /></Button>
                                            </div>
                                            <div className="w-full space-y-2">
                                                <Input placeholder="Título (e.g. Seguridad)" value={item.title} onChange={(e) => {
                                                    const newItems = [...section.data.items];
                                                    newItems[i].title = e.target.value;
                                                    updateSection(section.id, { ...section.data, items: newItems });
                                                }} />
                                                <Input placeholder="Subtítulo (Opcional)" value={item.subtitle || ''} onChange={(e) => {
                                                    const newItems = [...section.data.items];
                                                    newItems[i].subtitle = e.target.value;
                                                    updateSection(section.id, { ...section.data, items: newItems });
                                                }} />

                                                {/* ICON UPLOAD */}
                                                <div className="flex gap-2 items-center border p-2 rounded bg-white">
                                                    {item.icon && <img src={item.icon} className="w-8 h-8 object-contain rounded-full" alt="Icon" />}
                                                    <div className="flex-1">
                                                        <Label className="text-xs text-gray-500">Icono / Imagen (Opcional)</Label>
                                                        <Input type="file" className="h-8 text-xs" accept="image/*" onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const formData = new FormData();
                                                                formData.append('file', file);
                                                                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                                                if (res.ok) {
                                                                    const json = await res.json();
                                                                    const newItems = [...section.data.items];
                                                                    newItems[i].icon = json.url;
                                                                    updateSection(section.id, { ...section.data, items: newItems });
                                                                }
                                                            }
                                                        }} />
                                                    </div>
                                                </div>

                                                <div className="bg-white">
                                                    <QuillEditor
                                                        value={item.description}
                                                        onChange={(html) => {
                                                            const newItems = [...section.data.items];
                                                            newItems[i].description = html;
                                                            updateSection(section.id, { ...section.data, items: newItems });
                                                        }}
                                                        className="min-h-[100px]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => updateSection(section.id, { ...section.data, items: [...(section.data.items || []), { title: '', subtitle: '', description: '' }] })}>
                                        + Agregar Feature
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {sections.length === 0 && <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">No hay secciones. Agrega una arriba.</div>}
            </div>
        </div>
    );
};

export default SectionBuilder;
