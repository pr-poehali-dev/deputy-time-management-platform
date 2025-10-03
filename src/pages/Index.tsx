import { useState, useMemo, useEffect } from 'react';
import { ScheduleEvent, EventType, Person, BookingRequest } from '../types/schedule';
import EventCard from '../components/EventCard';
import EventDialog from '../components/EventDialog';
import EventDetailDialog from '../components/EventDetailDialog';
import CalendarView from '../components/CalendarView';
import TimelineView from '../components/TimelineView';
import LoginPage from '../components/LoginPage';
import UserManagementDialog from '../components/UserManagementDialog';
import BookingDialog from '../components/BookingDialog';
import BookingRequests from '../components/BookingRequests';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import Icon from '../components/ui/icon';
import { useToast } from '../hooks/use-toast';
import { api, User } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';

const Index = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [users, setUsers] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar' | 'grid'>('timeline');
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user } = await api.verify();
      setCurrentUser(user);
      setAuthenticated(true);
      await loadData();
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [eventsData, usersData] = await Promise.all([
        api.getEvents(),
        api.getUsers(),
      ]);

      setEvents(eventsData.events || []);
      setUsers(usersData.users.map((u: any) => ({
        id: String(u.id),
        name: u.full_name,
        position: u.position,
        login: u.login,
        email: u.email,
      })));
    } catch (error: any) {
      toast({
        title: 'Ошибка загрузки',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLogin = async () => {
    setAuthenticated(true);
    await checkAuth();
  };

  const handleLogout = () => {
    api.logout();
    setAuthenticated(false);
    setCurrentUser(null);
    setEvents([]);
    setUsers([]);
  };

  useEffect(() => {
    const checkAndArchiveEvents = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      events.forEach(async (event) => {
        if (event.status === 'archived' || event.status === 'completed' || event.status === 'cancelled') return;

        const eventEndDate = event.endDate || event.date;
        const eventEndTime = event.endTime || '23:59';

        if (eventEndDate < today || (eventEndDate === today && eventEndTime < currentTime)) {
          try {
            await api.updateEvent({ ...event, status: 'archived' });
            await loadData();
          } catch (error) {
            console.error('Failed to archive event:', error);
          }
        }
      });
    };

    const interval = setInterval(checkAndArchiveEvents, 60000);
    checkAndArchiveEvents();

    return () => clearInterval(interval);
  }, [events]);

  const activeEvents = useMemo(
    () => events.filter((e) => e.status !== 'completed' && e.status !== 'cancelled' && e.status !== 'archived'),
    [events]
  );

  const archivedEvents = useMemo(
    () => events.filter((e) => e.status === 'completed' || e.status === 'cancelled' || e.status === 'archived'),
    [events]
  );

  const filterEvents = (eventsList: ScheduleEvent[]) => {
    return eventsList.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || event.type === filterType;
      return matchesSearch && matchesType;
    });
  };

  const filteredActiveEvents = useMemo(
    () => filterEvents(activeEvents).sort((a, b) => a.date.localeCompare(b.date)),
    [activeEvents, searchQuery, filterType]
  );

  const filteredArchivedEvents = useMemo(
    () => filterEvents(archivedEvents).sort((a, b) => b.date.localeCompare(a.date)),
    [archivedEvents, searchQuery, filterType]
  );

  const handleSave = async (eventData: Partial<ScheduleEvent>) => {
    try {
      // Установка времени для выезда в регион (должно быть ДО проверок)
      if (eventData.type === 'regional-trip') {
        eventData.time = '00:00';
        eventData.endTime = '23:59';
        
        if (eventData.date) {
          const startDate = new Date(eventData.date);
          const endDate = eventData.endDate ? new Date(eventData.endDate) : startDate;
          
          // Проверяем все даты в диапазоне
          const blockedDates: string[] = [];
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            blockedDates.push(d.toISOString().split('T')[0]);
          }

          // Проверяем конфликты с другими событиями
          const hasConflict = events.some((e) => {
            if (editingEvent && e.id === editingEvent.id) return false;
            return blockedDates.includes(e.date);
          });

          if (hasConflict) {
            toast({
              title: 'Конфликт дат',
              description: 'На выбранные даты уже запланированы другие события',
              variant: 'destructive',
            });
            return;
          }
        }
      }

      if (editingEvent) {
        await api.updateEvent({ ...editingEvent, ...eventData });
        toast({
          title: 'Событие обновлено',
          description: 'Изменения успешно сохранены',
        });
      } else {
        await api.createEvent(eventData);
        toast({
          title: 'Событие создано',
          description: 'Новое событие добавлено в график',
        });
      }
      setEditingEvent(undefined);
      setDialogOpen(false);
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteEvent(id);
      toast({
        title: 'Событие удалено',
        description: 'Событие удалено из графика',
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleNewEvent = () => {
    setEditingEvent(undefined);
    setDialogOpen(true);
  };

  const handleBookingSubmit = (request: BookingRequest) => {
    setBookingRequests((prev) => [...prev, request]);
    toast({
      title: 'Заявка отправлена',
      description: 'Ваша заявка ожидает подтверждения администратора',
    });
  };

  const handleApproveBooking = async (requestId: string) => {
    const request = bookingRequests.find((r) => r.id === requestId);
    if (!request) return;

    try {
      const eventData: Partial<ScheduleEvent> = {
        title: request.title,
        type: 'meeting',
        date: request.date,
        time: request.time,
        endTime: request.endTime,
        description: request.description,
        responsible: [request.requestedBy],
        status: 'scheduled',
        bookingRequestId: requestId,
      };

      await api.createEvent(eventData);
      
      setBookingRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: 'approved', approvedBy: currentUser?.full_name, approvedAt: new Date().toISOString() } : r
        )
      );

      toast({
        title: 'Заявка одобрена',
        description: 'Событие добавлено в график',
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRejectBooking = (requestId: string) => {
    setBookingRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' } : r
      )
    );

    toast({
      title: 'Заявка отклонена',
      description: 'Бронирование времени отклонено',
      variant: 'destructive',
    });
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setDetailDialogOpen(true);
  };

  const upcomingCount = activeEvents.length;
  const todayCount = activeEvents.filter(
    (e) => e.date === new Date().toISOString().split('T')[0]
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-body">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const isAdmin = currentUser?.role === 'admin';
  const canEdit = isAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col transition-colors">
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-950 dark:to-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 font-heading">График управления</h1>
              <p className="text-sm text-blue-100 font-body">Система планирования депутата Госдумы</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 w-full sm:w-auto">
              <div className="text-center sm:text-right">
                <div className="text-xs sm:text-sm text-blue-200 font-body">На сегодня</div>
                <div className="text-xl sm:text-2xl font-bold font-heading">{todayCount}</div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-xs sm:text-sm text-blue-200 font-body">Предстоящих</div>
                <div className="text-xl sm:text-2xl font-bold font-heading">{upcomingCount}</div>
              </div>
              <div className="border-l border-blue-400 pl-3 sm:pl-6 flex items-center gap-2 sm:gap-3">
                <div className="w-full">
                  <div className="text-xs sm:text-sm text-blue-200 font-body">{currentUser?.full_name}</div>
                  <div className="text-xs text-blue-300 font-body mb-2">{currentUser?.position}</div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={toggleTheme}
                      className="text-white border-white hover:bg-blue-800 text-xs"
                      title={theme === 'light' ? 'Темная тема' : 'Светлая тема'}
                    >
                      <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={14} />
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setUserManagementOpen(true)}
                        className="text-white border-white hover:bg-blue-800 text-xs"
                      >
                        <Icon name="Users" size={14} className="mr-1" />
                        <span className="hidden sm:inline">Пользователи</span>
                        <span className="sm:hidden">👥</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleLogout}
                      className="text-white border-white hover:bg-blue-800 text-xs"
                    >
                      <Icon name="LogOut" size={14} className="mr-1" />
                      <span className="hidden sm:inline">Выход</span>
                      <span className="sm:hidden">↗</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Icon
                name="Search"
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Поиск событий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 font-body"
              />
            </div>

            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-full lg:w-[200px] h-11 font-body">
                <SelectValue placeholder="Тип события" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="meeting">Встреча</SelectItem>
                <SelectItem value="vks">ВКС</SelectItem>
                <SelectItem value="hearing">Слушания</SelectItem>
                <SelectItem value="committee">Заседание</SelectItem>
                <SelectItem value="visit">Визит</SelectItem>
                <SelectItem value="reception">Прием</SelectItem>
                <SelectItem value="regional-trip">Выезд в регион</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              {canEdit && (
                <Button
                  onClick={handleNewEvent}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 h-11 font-body font-medium"
                >
                  <Icon name="Plus" size={20} className="mr-2" />
                  Добавить событие
                </Button>
              )}
              {!isAdmin && (
                <Button
                  onClick={() => setBookingDialogOpen(true)}
                  size="lg"
                  variant="outline"
                  className="h-11 font-body font-medium"
                >
                  <Icon name="Calendar" size={20} className="mr-2" />
                  Забронировать время
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              onClick={() => setViewMode('timeline')}
              className={viewMode === 'timeline' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <Icon name="List" size={18} className="mr-2" />
              По датам
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <Icon name="CalendarDays" size={18} className="mr-2" />
              Календарь
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <Icon name="LayoutGrid" size={18} className="mr-2" />
              Карточки
            </Button>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-11">
            <TabsTrigger value="active" className="text-base font-body">
              <Icon name="Calendar" size={18} className="mr-2" />
              События ({filteredActiveEvents.length})
            </TabsTrigger>
            <TabsTrigger value="archive" className="text-base font-body">
              <Icon name="Archive" size={18} className="mr-2" />
              Архив ({filteredArchivedEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {isAdmin && (
              <BookingRequests
                requests={bookingRequests}
                onApprove={handleApproveBooking}
                onReject={handleRejectBooking}
                currentUser={currentUser ? { id: String(currentUser.id), name: currentUser.full_name, position: currentUser.position } : { id: '', name: '', position: '' }}
                isAdmin={isAdmin}
              />
            )}

            {filteredActiveEvents.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <Icon name="CalendarOff" size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-body">Нет запланированных событий</p>
                {canEdit && (
                  <Button onClick={handleNewEvent} className="mt-4" variant="outline">
                    Создать первое событие
                  </Button>
                )}
              </div>
            ) : (
              <>
                {viewMode === 'timeline' && (
                  <TimelineView
                    events={filteredActiveEvents}
                    onEdit={canEdit ? handleEdit : handleEventClick}
                    onDelete={canEdit ? handleDelete : () => {}}
                  />
                )}
                {viewMode === 'calendar' && (
                  <CalendarView
                    events={filteredActiveEvents}
                    onEventClick={handleEventClick}
                  />
                )}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredActiveEvents.map((event) => (
                      <div key={event.id} onClick={() => handleEventClick(event)} className="cursor-pointer">
                        <EventCard
                          event={event}
                          onEdit={canEdit ? handleEdit : undefined}
                          onDelete={canEdit ? handleDelete : undefined}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="archive" className="space-y-4">
            {filteredArchivedEvents.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <Icon name="Archive" size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-body">Архив пуст</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredArchivedEvents.map((event) => (
                  <div key={event.id} onClick={() => handleEventClick(event)} className="cursor-pointer">
                    <EventCard
                      event={event}
                      onEdit={canEdit ? handleEdit : undefined}
                      onDelete={canEdit ? handleDelete : undefined}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {canEdit && (
        <EventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          event={editingEvent}
          availablePersons={users}
          onSave={handleSave}
        />
      )}

      <EventDetailDialog
        event={selectedEvent}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canEdit}
      />

      {isAdmin && (
        <UserManagementDialog
          open={userManagementOpen}
          onOpenChange={setUserManagementOpen}
        />
      )}

      {!isAdmin && currentUser && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          currentUser={{ id: String(currentUser.id), name: currentUser.full_name, position: currentUser.position }}
          onSubmit={handleBookingSubmit}
        />
      )}

      <Footer />
    </div>
  );
};

export default Index;