import { useState, useMemo } from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface CalendarViewProps {
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
}

const eventTypeConfig = {
  meeting: { label: 'Встреча', color: 'bg-blue-500', icon: 'Users' },
  vks: { label: 'ВКС', color: 'bg-purple-500', icon: 'Video' },
  hearing: { label: 'Слушания', color: 'bg-amber-500', icon: 'Gavel' },
  committee: { label: 'Заседание', color: 'bg-green-500', icon: 'Building2' },
  visit: { label: 'Визит', color: 'bg-red-500', icon: 'MapPin' },
  reception: { label: 'Прием', color: 'bg-cyan-500', icon: 'HandshakeIcon' },
  'regional-trip': { label: 'Выезд в регион', color: 'bg-orange-500', icon: 'Plane' },
  'pcr-test': { label: 'ПЦР тестирование', color: 'bg-pink-500', icon: 'TestTube2' },
};

export default function CalendarView({ events, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthName = currentDate.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    events.forEach((event) => {
      const dateKey = event.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [events]);

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = eventsByDate.get(dateStr) || [];
    const isToday =
      dateStr === new Date().toISOString().split('T')[0];

    return (
      <Card
        key={day}
        className={`min-h-[120px] p-2 hover:shadow-md transition-shadow ${
          isToday ? 'ring-2 ring-blue-600 bg-blue-50' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm font-semibold ${
              isToday ? 'text-blue-600 text-lg' : 'text-gray-700'
            }`}
          >
            {day}
          </span>
          {dayEvents.length > 0 && (
            <Badge variant="secondary" className="text-xs h-5">
              {dayEvents.length}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map((event) => {
            const typeConfig = eventTypeConfig[event.type];
            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`${typeConfig.color} text-white text-xs p-1.5 rounded cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <Icon name={typeConfig.icon as any} size={12} />
                  <span className="font-medium">{event.time}</span>
                </div>
                <div className="truncate font-medium">{event.title}</div>
              </div>
            );
          })}
          {dayEvents.length > 3 && (
            <div className="text-xs text-gray-500 text-center">
              +{dayEvents.length - 3} еще
            </div>
          )}
        </div>
      </Card>
    );
  };

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 capitalize font-heading">
          {monthName}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Сегодня
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <Icon name="ChevronLeft" size={18} />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <Icon name="ChevronRight" size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-gray-600 py-2 font-body"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: adjustedFirstDay }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) =>
          renderDay(day)
        )}
      </div>
    </div>
  );
}