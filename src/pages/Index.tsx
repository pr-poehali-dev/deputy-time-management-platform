import { useState, useMemo } from 'react';
import { ScheduleEvent, EventType } from '../types/schedule';
import { mockEvents, mockPersons } from '../data/mockData';
import EventCard from '../components/EventCard';
import EventDialog from '../components/EventDialog';
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

const Index = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | undefined>();
  const { toast } = useToast();

  const activeEvents = useMemo(
    () => events.filter((e) => e.status !== 'completed' && e.status !== 'cancelled'),
    [events]
  );

  const archivedEvents = useMemo(
    () => events.filter((e) => e.status === 'completed' || e.status === 'cancelled'),
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

  const handleSave = (eventData: Partial<ScheduleEvent>) => {
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? { ...e, ...eventData } : e))
      );
      toast({
        title: 'Событие обновлено',
        description: 'Изменения успешно сохранены',
      });
    } else {
      setEvents((prev) => [...prev, eventData as ScheduleEvent]);
      toast({
        title: 'Событие создано',
        description: 'Новое событие добавлено в график',
      });
    }
    setEditingEvent(undefined);
  };

  const handleEdit = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast({
      title: 'Событие удалено',
      description: 'Событие удалено из графика',
      variant: 'destructive',
    });
  };

  const handleNewEvent = () => {
    setEditingEvent(undefined);
    setDialogOpen(true);
  };

  const upcomingCount = activeEvents.length;
  const todayCount = activeEvents.filter(
    (e) => e.date === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1 font-heading">График управления</h1>
              <p className="text-blue-100 font-body">Система планирования депутата Госдумы</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-blue-200 font-body">На сегодня</div>
                <div className="text-2xl font-bold font-heading">{todayCount}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-200 font-body">Предстоящих</div>
                <div className="text-2xl font-bold font-heading">{upcomingCount}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
            </SelectContent>
          </Select>

          <Button
            onClick={handleNewEvent}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 h-11 font-body font-medium"
          >
            <Icon name="Plus" size={20} className="mr-2" />
            Добавить событие
          </Button>
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
            {filteredActiveEvents.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <Icon name="CalendarOff" size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-body">Нет запланированных событий</p>
                <Button onClick={handleNewEvent} className="mt-4" variant="outline">
                  Создать первое событие
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredActiveEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
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
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        availablePersons={mockPersons}
        onSave={handleSave}
      />
    </div>
  );
};

export default Index;
