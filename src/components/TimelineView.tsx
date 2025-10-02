import { useMemo } from 'react';
import { ScheduleEvent } from '@/types/schedule';
import EventCard from './EventCard';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TimelineViewProps {
  events: ScheduleEvent[];
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (id: string) => void;
}

export default function TimelineView({ events, onEdit, onDelete }: TimelineViewProps) {
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, ScheduleEvent[]>();
    
    const sortedEvents = [...events].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    sortedEvents.forEach((event) => {
      const dateKey = event.date;
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(event);
    });

    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [events]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Сегодня';
    if (isTomorrow) return 'Завтра';

    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const isToday = (dateStr: string) => {
    return new Date(dateStr).toDateString() === new Date().toDateString();
  };

  if (groupedEvents.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <Icon name="CalendarOff" size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg font-body">Нет запланированных событий</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedEvents.map(([date, dateEvents]) => (
        <div key={date} className="space-y-3">
          <Card
            className={`p-4 ${
              isToday(date)
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                : 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon
                  name="Calendar"
                  size={24}
                  className={isToday(date) ? 'text-white' : 'text-blue-600 dark:text-blue-400'}
                />
                <div>
                  <h3
                    className={`text-xl font-bold capitalize font-heading ${
                      isToday(date) ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {formatDate(date)}
                  </h3>
                  <p
                    className={`text-sm font-body ${
                      isToday(date) ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {new Date(date).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div
                className={`text-2xl font-bold font-heading ${
                  isToday(date) ? 'text-white' : 'text-blue-600'
                }`}
              >
                {dateEvents.length} {dateEvents.length === 1 ? 'событие' : 'событий'}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pl-8 relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-blue-200 to-transparent" />
            {dateEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}