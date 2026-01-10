import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Building2, MapPin, Briefcase, Phone, Mail, Eye, EyeOff } from 'lucide-react';

const RegisterForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
        terminalName: '',  // Cambiado de terminalId a terminalName
        city: '',
        position: '',
        companyName: '',
        reason: ''
    });



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' });
            return;
        }

        if (formData.password.length < 6) {
            toast({ title: 'Error', description: 'La contraseña debe tener al menos 6 caracteres', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    phone: formData.phone,
                    terminalName: formData.terminalName,
                    city: formData.city,
                    position: formData.position,
                    companyName: formData.companyName,
                    reason: formData.reason
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al enviar solicitud');
            }

            toast({
                title: '¡Solicitud enviada!',
                description: 'Tu solicitud de registro será revisada por un administrador. Te contactaremos pronto.'
            });

            setTimeout(() => navigate('/'), 2000);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl">Solicitud de Registro</CardTitle>
                    <CardDescription>
                        Completa el formulario para solicitar acceso al panel de administración
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Información Personal */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Información Personal
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Nombre Completo *</Label>
                                    <Input
                                        id="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="Juan Pérez"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="tu@email.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+54 9 11 1234-5678"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Contraseña *</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Mínimo 6 caracteres"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="Repite tu contraseña"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información Laboral */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Información Laboral
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ciudad</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Posadas, Oberá, etc."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="terminalName">Terminal</Label>
                                    <Input
                                        id="terminalName"
                                        value={formData.terminalName}
                                        onChange={(e) => setFormData({ ...formData, terminalName: e.target.value })}
                                        placeholder="Ej: Terminal de Posadas"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="position">Cargo/Posición</Label>
                                    <Input
                                        id="position"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        placeholder="Ej: Gerente, Empleado, etc."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Empresa/Organización</Label>
                                    <Input
                                        id="companyName"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        placeholder="Nombre de la empresa"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Motivo */}
                        <div className="space-y-2 border-t pt-6">
                            <Label htmlFor="reason">Motivo de la solicitud</Label>
                            <Textarea
                                id="reason"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Explica brevemente por qué necesitas acceso al panel de administración..."
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar Solicitud'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/login')}>
                                Cancelar
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500 text-center">
                            * Campos obligatorios. Tu solicitud será revisada por un administrador.
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RegisterForm;
