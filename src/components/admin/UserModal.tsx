
import React, { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sanitizeInput, isValidEmail, isValidName, validatePasswordStrength } from '@/utils/security';

interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
  status: string;
  password?: string;
  terminals: string[];
  permissions: string[];
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: (user: User) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    role: 'viewer',
    status: 'active',
    password: '',
    terminals: [],
    permissions: []
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const availableTerminals = [
    'Posadas', 'Oberá', 'Puerto Iguazú', 'Eldorado', 'Apóstoles', 'Leandro N. Alem'
  ];

  const availablePermissions = [
    'view_terminals', 'edit_terminals', 'delete_terminals',
    'view_users', 'edit_users', 'delete_users',
    'view_analytics', 'manage_seo', 'manage_media'
  ];

  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: '' });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'viewer',
        status: 'active',
        password: '',
        terminals: [],
        permissions: []
      });
    }
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (!isValidName(formData.name)) {
      errors.name = 'El nombre solo puede contener letras, espacios, guiones y apostrofes';
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'El formato del email no es válido';
    }

    // Validate password (only for new users or when changing password)
    if (!user && formData.password) {
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.error || 'Contraseña no válida';
      }
    } else if (user && formData.password) {
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.error || 'Contraseña no válida';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Sanitize data before saving
    const sanitizedData = {
      ...formData,
      name: sanitizeInput(formData.name.trim()),
      email: sanitizeInput(formData.email.trim().toLowerCase())
    };

    onSave(sanitizedData);
    onClose();
  };

  const handleChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTerminalChange = (terminal: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      terminals: checked 
        ? [...prev.terminals, terminal]
        : prev.terminals.filter(t => t !== terminal)
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <User className="h-5 w-5 mr-2" />
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {Object.keys(validationErrors).length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                Por favor, corrige los errores en el formulario antes de continuar.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      className={validationErrors.name ? 'border-red-500' : ''}
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      className={validationErrors.email ? 'border-red-500' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="password">
                      {user ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      required={!user}
                      className={validationErrors.password ? 'border-red-500' : ''}
                    />
                    {validationErrors.password && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.password}</p>
                    )}
                    {!user && (
                      <p className="text-xs text-gray-600 mt-1">
                        La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configuración</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Administrador</SelectItem>
                        <SelectItem value="terminal_admin">Admin Terminal</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Terminales Asignadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {availableTerminals.map((terminal) => (
                      <div key={terminal} className="flex items-center space-x-2">
                        <Checkbox
                          id={`terminal-${terminal}`}
                          checked={formData.terminals.includes(terminal)}
                          onCheckedChange={(checked) => handleTerminalChange(terminal, checked as boolean)}
                        />
                        <Label htmlFor={`terminal-${terminal}`} className="text-sm">
                          {terminal}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Permisos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {availablePermissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={`permission-${permission}`}
                          checked={formData.permissions.includes(permission)}
                          onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                        />
                        <Label htmlFor={`permission-${permission}`} className="text-sm">
                          {permission.replace('_', ' ').toUpperCase()}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-600">
              <Save className="h-4 w-4 mr-2" />
              {user ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
