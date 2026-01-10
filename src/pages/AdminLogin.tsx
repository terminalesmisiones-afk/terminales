
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isAdmin, loading, login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirigir a todos los usuarios autenticados al panel admin
        navigate('/admin');
      }
    }
  }, [user, loading, navigate]);

  const { executeRecaptcha } = useGoogleReCaptcha();

  // ... (useEffect skip) ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!executeRecaptcha) {
        console.warn('Recaptcha not ready'); // Optional fallback
      }

      const token = executeRecaptcha ? await executeRecaptcha('login') : undefined;
      console.log('RECAPTCHA Token generated:', token);

      const { user, error } = await login(email, password, token);

      if (error) throw error;
      if (!user) throw new Error('Usuario no encontrado');

      toast({
        title: "Inicio de sesión exitoso",
        description: "Redirigiendo al panel...",
      });

    } catch (error: any) {
      console.error('Error de login:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🚌</span>
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-gray-900">Terminales Misiones</h1>
              <p className="text-sm text-gray-500">Panel de Administración</p>
            </div>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Accede al panel de administración
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Iniciando sesión..."
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <Link to="/register" className="text-sm text-primary hover:underline block font-medium">
                ¿Necesitas acceso? Solicita tu registro aquí
              </Link>
              <Link to="/" className="text-sm text-gray-500 hover:text-primary hover:underline block">
                ← Volver al sitio web
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
