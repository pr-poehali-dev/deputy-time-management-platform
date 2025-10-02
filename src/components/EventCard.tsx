import { ScheduleEvent } from '@/types/schedule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const eventTypeConfig = {
  meeting: { label: 'Встреча', color: 'bg-blue-100 text-blue-700', icon: 'Users' },
  vks: { label: 'ВКС', color: 'bg-purple-100 text-purple-700', icon: 'Video' },
  hearing: { label: 'Слушания', color: 'bg-amber-100 text-amber-700', icon: 'Gavel' },
  committee: { label: 'Заседание', color: 'bg-green-100 text-green-700', icon: 'Building2' },
  visit: { label: 'Визит', color: 'bg-red-100 text-red-700', icon: 'MapPin' },
  reception: { label: 'Прием', color: 'bg-cyan-100 text-cyan-700', icon: 'HandshakeIcon' },
  'regional-trip': { label: 'Выезд в регион', color: 'bg-orange-100 text-orange-700', icon: 'Plane' },
};

const statusConfig = {
  scheduled: { label: 'Запланировано', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'in-progress': { label: 'В процессе', color: 'bg-green-50 text-green-700 border-green-200' },
  completed: { label: 'Завершено', color: 'bg-gray-100 text-gray-600 border-gray-300' },
  cancelled: { label: 'Отменено', color: 'bg-red-50 text-red-700 border-red-200' },
};

interface EventCardProps {
  event: ScheduleEvent;
  onEdit?: (event: ScheduleEvent) => void;
  onDelete?: (id: string) => void;
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const typeConfig = eventTypeConfig[event.type];
  const statusInfo = statusConfig[event.status];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-600">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1 bg-gradient-to-br from-blue-600 to-blue-400 p-2 rounded-lg">
              <Icon name={typeConfig.icon as any} size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {event.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                <Badge variant="outline" className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Icon name="Calendar" size={16} className="text-blue-600" />
            <span>
              {new Date(event.date).toLocaleDateString('ru-RU')}
              {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('ru-RU')}`}
            </span>
          </div>
          {event.type !== 'regional-trip' && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Icon name="Clock" size={16} className="text-blue-600" />
              <span>{event.time} {event.endTime && `- ${event.endTime}`}</span>
            </div>
          )}
        </div>

        {event.regionName && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icon name="MapPin" size={16} className="text-blue-600" />
            <span className="font-medium">{event.regionName}</span>
          </div>
        )}

        {event.location && !event.regionName && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icon name="MapPin" size={16} className="text-blue-600" />
            <span>{event.location}</span>
          </div>
        )}

        {event.vksLink && (
          <div className="flex items-center gap-2 text-sm">
            <Icon name="Link" size={16} className="text-blue-600" />
            <a
              href={event.vksLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate"
            >
              {event.vksLink}
            </a>
          </div>
        )}

        {event.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{event.description}</p>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Icon name="UserCheck" size={16} className="text-blue-600" />
            <span className="font-medium">Ответственные:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {event.responsible.map((person) => (
              <Badge key={person.id} variant="secondary" className="bg-gray-100">
                {person.name}
              </Badge>
            ))}
          </div>
        </div>

        {event.reminders && event.reminders.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icon name="Bell" size={16} className="text-blue-600" />
            <span>{event.reminders.join(', ')}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onEdit?.(event)}
          >
            <Icon name="Pencil" size={16} className="mr-1" />
            Изменить
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete?.(event.id)}
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}