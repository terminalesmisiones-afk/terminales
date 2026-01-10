import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, Mail, Phone, MapPin, Building2, Briefcase, FileText } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

interface Registration {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    terminal_id: string;
    terminal_name: string;
    city: string;
    position: string;
    company_name: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    approved_by: string;
    approved_at: string;
    rejected_reason: string;
}

const RegistrationsManager = () => {
    const { toast } = useToast();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const loadRegistrations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/registrations?t=${new Date().getTime()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setRegistrations(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Error al cargar solicitudes', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRegistrations();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/registrations/${id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Error al aprobar');

            toast({ title: 'Aprobado', description: 'Usuario aprobado exitosamente' });
            loadRegistrations();
        } catch (error) {
            toast({ title: 'Error', description: 'Error al aprobar solicitud', variant: 'destructive' });
        }
    };

    const handleReject = async () => {
        if (!selectedReg) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/registrations/${selectedReg.id}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: rejectReason })
            });

            if (!res.ok) throw new Error('Error al rechazar');

            toast({ title: 'Rechazado', description: 'Solicitud rechazada' });
            setShowRejectDialog(false);
            setRejectReason('');
            setSelectedReg(null);
            loadRegistrations();
        } catch (error) {
            toast({ title: 'Error', description: 'Error al rechazar solicitud', variant: 'destructive' });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: any = {
            pending: { variant: 'secondary', label: 'Pendiente', icon: Clock },
            approved: { variant: 'default', label: 'Aprobado', icon: Check },
            rejected: { variant: 'destructive', label: 'Rechazado', icon: X }
        };
        const config = variants[status] || variants.pending;
        const Icon = config.icon;
        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const pendingCount = registrations.filter(r => r.status === 'pending').length;

    if (loading) {
        return <div className="p-8 text-center">Cargando solicitudes...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Solicitudes de Registro</h2>
                    <p className="text-gray-500 mt-1">
                        {pendingCount > 0 ? `${pendingCount} solicitud(es) pendiente(s)` : 'No hay solicitudes pendientes'}
                    </p>
                </div>
                <Button onClick={loadRegistrations} variant="outline">
                    Actualizar
                </Button>
            </div>

            <div className="grid gap-4">
                {registrations.map((reg) => (
                    <Card key={reg.id} className={reg.status === 'pending' ? 'border-primary/50' : ''}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">{reg.full_name}</CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Mail className="h-4 w-4" />
                                        {reg.email}
                                    </div>
                                </div>
                                {getStatusBadge(reg.status)}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {reg.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span>{reg.phone}</span>
                                    </div>
                                )}
                                {reg.city && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>{reg.city}</span>
                                    </div>
                                )}
                                {reg.terminal_name && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 className="h-4 w-4 text-gray-400" />
                                        <span>{reg.terminal_name}</span>
                                    </div>
                                )}
                                {reg.position && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Briefcase className="h-4 w-4 text-gray-400" />
                                        <span>{reg.position} {reg.company_name && `- ${reg.company_name}`}</span>
                                    </div>
                                )}
                            </div>

                            {reg.reason && (
                                <div className="bg-gray-50 p-3 rounded-md mb-4">
                                    <div className="flex items-start gap-2 text-sm">
                                        <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-700 mb-1">Motivo:</p>
                                            <p className="text-gray-600">{reg.reason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t">
                                <span className="text-xs text-gray-500">
                                    Solicitado: {new Date(reg.created_at).toLocaleDateString('es-AR', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>

                                {reg.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(reg.id)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            Aprobar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                                setSelectedReg(reg);
                                                setShowRejectDialog(true);
                                            }}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Rechazar
                                        </Button>
                                    </div>
                                )}

                                {reg.status === 'approved' && (
                                    <span className="text-xs text-green-600">
                                        Aprobado por {reg.approved_by} el {new Date(reg.approved_at).toLocaleDateString('es-AR')}
                                    </span>
                                )}

                                {reg.status === 'rejected' && reg.rejected_reason && (
                                    <span className="text-xs text-red-600">
                                        Rechazado: {reg.rejected_reason}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {registrations.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-500">
                            No hay solicitudes de registro
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rechazar Solicitud</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de rechazar la solicitud de {selectedReg?.full_name}?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Motivo del rechazo (opcional)</label>
                        <Textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Explica brevemente por qué se rechaza esta solicitud..."
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleReject}>
                            Rechazar Solicitud
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RegistrationsManager;
