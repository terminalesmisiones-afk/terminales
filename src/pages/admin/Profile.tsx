import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { User, Mail, Shield, Building2, Calendar } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
    }, []);

    if (!user) return null;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <Label className="text-sm text-gray-500">Nombre</Label>
                                <p className="text-lg font-medium">{user.name || 'Sin nombre'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <Label className="text-sm text-gray-500">Email</Label>
                                <p className="text-lg font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <Label className="text-sm text-gray-500">Rol</Label>
                                <div className="mt-1">
                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                        {user.role === 'admin' ? 'Super Administrador' : 'Administrador de Terminal'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Asignación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user.terminals ? (
                            <div className="flex items-start gap-3">
                                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <Label className="text-sm text-gray-500">Terminal Asignada</Label>
                                    <p className="text-lg font-medium">{user.terminals}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Sin terminal asignada</p>
                            </div>
                        )}

                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <Label className="text-sm text-gray-500">Último Acceso</Label>
                                <p className="text-lg font-medium">
                                    {user.last_login
                                        ? new Date(user.last_login).toLocaleString('es-AR')
                                        : 'Nunca'
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
