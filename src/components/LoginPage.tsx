import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import Icon from './ui/icon';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.login(login, password);
      toast({
        title: 'Вход выполнен',
        description: 'Добро пожаловать в систему',
      });
      onLogin();
    } catch (error: any) {
      toast({
        title: 'Ошибка входа',
        description: error.message || 'Неверный логин или пароль',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-gradient-to-br from-blue-600 to-blue-500 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Icon name="Lock" size={32} className="text-white" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading">Вход в систему</CardTitle>
          <CardDescription className="font-body">
            Система планирования депутата Госдумы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login" className="font-body">Логин</Label>
              <Input
                id="login"
                type="text"
                placeholder="admin"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                className="font-body"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-body">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-body"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 font-body font-medium"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 font-body mb-2">
              <strong>Тестовые данные для входа:</strong>
            </p>
            <p className="text-xs text-gray-500 font-body">
              Логин: admin<br />
              Пароль: admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}