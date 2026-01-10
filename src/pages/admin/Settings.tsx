import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, Key, Save } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const Settings = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        notifications: true,
        emailAlerts: false,
    });
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSaveSettings = () => {
        // Aquí se guardarían las configuraciones en el backend
        toast({
            title: 'Configuración guardada',
            description: 'Tus preferencias han sido actualizadas'
        });
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: 'Error',
                description: 'Las contraseñas no coinciden',
                variant: 'destructive'
            });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast({
                title: 'Error',
                description: 'La contraseña debe tener al menos 6 caracteres',
                variant: 'destructive'
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            const res = await fetch(`/api/admin/users/${user.id}/password`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newPassword: passwordForm.newPassword })
            });

            if (!res.ok) throw new Error('Error al cambiar contraseña');

            toast({
                title: 'Éxito',
                description: 'Contraseña actualizada exitosamente'
            });
            setShowPasswordDialog(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error al cambiar contraseña',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Configuración</h1>

            <div className="grid gap-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Notificaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-gray-400" />
                                <div>
                                    <Label>Notificaciones Push</Label>
                                    <p className="text-sm text-gray-500">Recibir notificaciones en el navegador</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.notifications}
                                onCheckedChange={(checked) =>
                                    setSettings({ ...settings, notifications: checked })
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                    <Label>Alertas por Email</Label>
                                    <p className="text-sm text-gray-500">Recibir notificaciones por correo electrónico</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.emailAlerts}
                                onCheckedChange={(checked) =>
                                    setSettings({ ...settings, emailAlerts: checked })
                                }
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <Button onClick={handleSaveSettings}>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Preferencias
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Seguridad</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Key className="h-5 w-5 text-gray-400" />
                            <div className="flex-1">
                                <Label>Contraseña</Label>
                                <p className="text-sm text-gray-500">Cambia tu contraseña de acceso</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setShowPasswordDialog(true)}
                            >
                                Cambiar Contraseña
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambiar Contraseña</DialogTitle>
                        <DialogDescription>
                            Ingresa tu nueva contraseña
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nueva Contraseña</Label>
                            <Input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({
                                    ...passwordForm,
                                    newPassword: e.target.value
                                })}
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirmar Contraseña</Label>
                            <Input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({
                                    ...passwordForm,
                                    confirmPassword: e.target.value
                                })}
                                placeholder="Repite la contraseña"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowPasswordDialog(false);
                                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleChangePassword}>
                            Cambiar Contraseña
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Settings;
