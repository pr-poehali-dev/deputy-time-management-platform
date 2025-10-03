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

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await api.login('admin', 'admin');
      toast({
        title: 'Демо-вход выполнен',
        description: 'Вы вошли как администратор',
      });
      onLogin();
    } catch (error: any) {
      toast({
        title: 'Ошибка входа',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="w-full max-w-md shadow-lg dark:bg-gray-800 dark:border-gray-700">
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
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400 font-body">или</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full font-body font-medium"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              <Icon name="Zap" size={16} className="mr-2" />
              Быстрый вход (демо)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}