import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, User, Shield, Building2, Key } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: string;
  terminals: string | null;
  created_at: string;
  last_login: string;
}

interface Terminal {
  id: string;
  name: string;
  city: string;
}

const UsersManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'user' as 'admin' | 'user',
    terminals: '',
    status: 'active'
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users?t=${new Date().getTime()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Error al cargar usuarios', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadTerminals = async () => {
    try {
      const res = await fetch('/api/terminals');
      const data = await res.json();
      setTerminals(data);
    } catch (error) {
      console.error('Error loading terminals:', error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadTerminals();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      role: user.role,
      terminals: user.terminals || '',
      status: user.status || 'active'
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      console.log('Attempting to update user:', selectedUser.id);
      console.log('Edit form data:', editForm);

      const token = localStorage.getItem('token');
      // Usar el nuevo endpoint PATCH alternativo
      const res = await fetch(`/api/admin/users/${selectedUser.id}/update`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error('Error al actualizar');
      }

      toast({ title: 'Actualizado', description: 'Usuario actualizado exitosamente' });
      setShowEditDialog(false);
      loadUsers();
    } catch (error) {
      console.error('Update error:', error);
      toast({ title: 'Error', description: 'Error al actualizar usuario', variant: 'destructive' });
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;

    // Validar que las contraseñas coincidan
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive'
      });
      return;
    }

    // Validar longitud mínima
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
      const res = await fetch(`/api/admin/users/${selectedUser.id}/password`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: passwordForm.newPassword })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al cambiar contraseña');
      }

      toast({
        title: 'Éxito',
        description: 'Contraseña actualizada exitosamente'
      });
      setShowPasswordDialog(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cambiar contraseña',
        variant: 'destructive'
      });
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al eliminar');

      toast({ title: 'Eliminado', description: 'Usuario eliminado' });
      loadUsers();
    } catch (error) {
      toast({ title: 'Error', description: 'Error al eliminar usuario', variant: 'destructive' });
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge variant="default" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Administrador
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <User className="h-3 w-3" />
        Usuario
      </Badge>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestión de Usuarios</h2>
          <p className="text-gray-500 mt-1">
            {users.length} usuario(s) registrado(s)
          </p>
        </div>
        <Button onClick={loadUsers} variant="outline">
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{user.name || user.email}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {user.email}
                  </div>
                </div>
                {getRoleBadge(user.role)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {user.terminals && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>Terminal: {user.terminals}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-xs text-gray-500">
                  Último acceso: {user.last_login ? new Date(user.last_login).toLocaleDateString('es-AR') : 'Nunca'}
                </span>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowPasswordDialog(true);
                    }}
                  >
                    <Key className="h-4 w-4 mr-1" />
                    Contraseña
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No hay usuarios registrados
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los permisos y asignación de terminal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nombre del usuario"
              />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={editForm.role} onValueChange={(value: 'admin' | 'user') => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Terminal Asignada</Label>
              <Select
                value={editForm.terminals || "unassigned"}
                onValueChange={(value) => setEditForm({ ...editForm, terminals: value === "unassigned" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una terminal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {terminals.map((terminal) => (
                    <SelectItem key={terminal.id} value={terminal.name}>
                      {terminal.name} - {terminal.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Cambiar contraseña de {selectedUser?.name}
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
                setPasswordForm({ newPassword: '', confirmPassword: '' });
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

export default UsersManager;
