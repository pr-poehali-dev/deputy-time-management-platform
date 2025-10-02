import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  login: string;
  email: string;
  full_name: string;
  position: string;
  role: 'admin' | 'user';
  created_at: string;
}

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserManagementDialog({ open, onOpenChange }: UserManagementDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    full_name: '',
    position: '',
    role: 'user' as 'admin' | 'user',
  });

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data.users);
    } catch (error: any) {
      toast({
        title: 'Ошибка загрузки',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await api.updateUser({
          id: editingUser.id,
          ...formData,
        });
        toast({
          title: 'Пользователь обновлен',
          description: 'Данные успешно сохранены',
        });
      } else {
        await api.createUser(formData);
        toast({
          title: 'Пользователь создан',
          description: 'Новый пользователь добавлен в систему',
        });
      }
      
      resetForm();
      await loadUsers();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      login: user.login || '',
      email: user.email,
      password: '',
      full_name: user.full_name,
      position: user.position,
      role: user.role,
    });
    setShowForm(true);
};

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      await api.deleteUser(id);
      toast({
        title: 'Пользователь удален',
        description: 'Пользователь удален из системы',
      });
      await loadUsers();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      login: '',
      email: '',
      password: '',
      full_name: '',
      position: '',
      role: 'user',
    });
    setEditingUser(null);
    setShowForm(false);
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 font-heading">
            Управление пользователями
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 font-body">
                  Всего пользователей: {users.length}
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Icon name="UserPlus" size={18} className="mr-2" />
                  Добавить пользователя
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-body">ФИО</TableHead>
                        <TableHead className="font-body">Логин</TableHead>
                        <TableHead className="font-body hidden sm:table-cell">Email</TableHead>
                        <TableHead className="font-body hidden md:table-cell">Должность</TableHead>
                        <TableHead className="font-body">Роль</TableHead>
                        <TableHead className="font-body text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium font-body">
                            {user.full_name}
                          </TableCell>
                          <TableCell className="font-body">{user.login}</TableCell>
                          <TableCell className="font-body hidden sm:table-cell">{user.email}</TableCell>
                          <TableCell className="font-body hidden md:table-cell">{user.position}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(user)}
                              >
                                <Icon name="Pencil" size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(user.id)}
                              >
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="font-body">ФИО *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Иванов Иван Иванович"
                  required
                  className="font-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login" className="font-body">Логин *</Label>
                <Input
                  id="login"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  placeholder="ivanov"
                  required
                  disabled={!!editingUser}
                  className="font-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-body">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ivanov@deputy.gov.ru"
                  required
                  className="font-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-body">
                  Пароль {editingUser ? '(оставьте пустым, чтобы не менять)' : '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required={!editingUser}
                  className="font-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" className="font-body">Должность</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Помощник депутата"
                  className="font-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="font-body">Роль *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'admin' | 'user') =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger className="font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Пользователь (только просмотр)</SelectItem>
                    <SelectItem value="admin">Администратор (полный доступ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingUser ? 'Сохранить' : 'Создать'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}