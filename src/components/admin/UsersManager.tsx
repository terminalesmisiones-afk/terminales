
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Shield, User, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import UserModal from './UserModal';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  terminals: string[];
  permissions: string[];
  lastLogin: string;
  createdAt: string;
}

const UsersManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@terminales.com',
      role: 'super_admin',
      status: 'active',
      terminals: ['Posadas', 'Oberá'],
      permissions: ['view_terminals', 'edit_terminals', 'delete_terminals', 'view_users', 'edit_users'],
      lastLogin: '2024-06-26 14:30',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'María González',
      email: 'maria@posadas.com',
      role: 'terminal_admin',
      status: 'active',
      terminals: ['Posadas'],
      permissions: ['view_terminals', 'edit_terminals'],
      lastLogin: '2024-06-25 09:15',
      createdAt: '2024-02-20'
    },
    {
      id: 3,
      name: 'Carlos Rodríguez',
      email: 'carlos@obera.com',
      role: 'terminal_admin',
      status: 'inactive',
      terminals: ['Oberá'],
      permissions: ['view_terminals'],
      lastLogin: '2024-06-20 16:45',
      createdAt: '2024-03-10'
    },
    {
      id: 4,
      name: 'Ana López',
      email: 'ana@iguazu.com',
      role: 'viewer',
      status: 'active',
      terminals: ['Puerto Iguazú'],
      permissions: ['view_terminals'],
      lastLogin: '2024-06-26 08:20',
      createdAt: '2024-04-05'
    }
  ]);

  const roles = [
    { value: 'all', label: 'Todos los roles' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'terminal_admin', label: 'Admin Terminal' },
    { value: 'viewer', label: 'Visualizador' }
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'terminal_admin': return 'Admin Terminal';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'terminal_admin': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSave = (userData: User) => {
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id ? { ...userData, id: editingUser.id } : u
      ));
    } else {
      // Create new user
      const newUser = {
        ...userData,
        id: Date.now(),
        lastLogin: 'Nunca',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-600">Administra usuarios y permisos del sistema</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary-600">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-primary mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-secondary mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'active').length}
                </div>
                <p className="text-sm text-gray-600">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-accent mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'super_admin' || u.role === 'terminal_admin').length}
                </div>
                <p className="text-sm text-gray-600">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'inactive').length}
                </div>
                <p className="text-sm text-gray-600">Inactivos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {roles.map(role => (
                <Button
                  key={role.value}
                  variant={selectedRole === role.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role.value)}
                >
                  {role.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Terminales Asignadas</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? "default" : "secondary"}>
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.terminals.map((terminal, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {terminal}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{user.lastLogin}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{user.createdAt}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer usuario para comenzar'}
              </p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={editingUser}
        onSave={handleSave}
      />
    </div>
  );
};

export default UsersManager;
