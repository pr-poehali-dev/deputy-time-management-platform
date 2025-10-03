import { ScheduleEvent, EventType } from '@/types/schedule';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

const eventTypeConfig: Record<EventType, { label: string; color: string; icon: string }> = {
  meeting: { label: 'Встреча', color: 'bg-blue-100 text-blue-700', icon: 'Users' },
  vks: { label: 'ВКС', color: 'bg-purple-100 text-purple-700', icon: 'Video' },
  hearing: { label: 'Слушания', color: 'bg-amber-100 text-amber-700', icon: 'Gavel' },
  committee: { label: 'Заседание', color: 'bg-green-100 text-green-700', icon: 'Building2' },
  visit: { label: 'Визит', color: 'bg-red-100 text-red-700', icon: 'MapPin' },
  reception: { label: 'Прием', color: 'bg-cyan-100 text-cyan-700', icon: 'HandshakeIcon' },
  'regional-trip': { label: 'Выезд в регион', color: 'bg-orange-100 text-orange-700', icon: 'Plane' },
  'pcr-test': { label: 'ПЦР тестирование', color: 'bg-pink-100 text-pink-700', icon: 'TestTube2' },
};

const statusConfig = {
  scheduled: { label: 'Запланировано', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'in-progress': { label: 'В процессе', color: 'bg-green-50 text-green-700 border-green-200' },
  completed: { label: 'Завершено', color: 'bg-gray-100 text-gray-600 border-gray-300' },
  cancelled: { label: 'Отменено', color: 'bg-red-50 text-red-700 border-red-200' },
  archived: { label: 'Архивировано', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  pending: { label: 'На подтверждении', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
};

interface EventDetailDialogProps {
  event: ScheduleEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (id: string) => void;
  onCancel?: (event: ScheduleEvent) => void;
  canEdit?: boolean;
}

export default function EventDetailDialog({
  event,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onCancel,
  canEdit = true,
}: EventDetailDialogProps) {
  if (!event) return null;

  const typeConfig = eventTypeConfig[event.type];
  const statusInfo = statusConfig[event.status];

  const handleEdit = () => {
    onOpenChange(false);
    onEdit(event);
  };

  const handleDelete = () => {
    onOpenChange(false);
    onDelete(event.id);
  };

  const handleCancel = () => {
    if (onCancel) {
      onOpenChange(false);
      onCancel(event);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-3 rounded-lg">
              <Icon name={typeConfig.icon as any} size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-heading">
                {event.title}
              </DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                <Badge variant="outline" className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Icon name="Calendar" size={18} className="text-blue-600" />
                <span className="text-sm font-medium font-body">Дата</span>
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-body">
                {new Date(event.date).toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {event.endDate && (
                  <span> — {new Date(event.endDate).toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}</span>
                )}
              </p>
            </div>

            {event.type !== 'regional-trip' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon name="Clock" size={18} className="text-blue-600" />
                  <span className="text-sm font-medium font-body">Время</span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 font-body">
                  {event.time} {event.endTime && `— ${event.endTime}`}
                </p>
              </div>
            )}
          </div>

          {event.regionName && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Icon name="MapPin" size={18} className="text-blue-600" />
                <span className="text-sm font-medium font-body">Регион</span>
              </div>
              <p className="text-gray-900 font-body font-medium">{event.regionName}</p>
            </div>
          )}

          {event.location && !event.regionName && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Icon name="MapPin" size={18} className="text-blue-600" />
                <span className="text-sm font-medium font-body">Место проведения</span>
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-body">{event.location}</p>
            </div>
          )}

          {event.vksLink && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Icon name="Link" size={18} className="text-blue-600" />
                <span className="text-sm font-medium font-body">Ссылка на ВКС</span>
              </div>
              <a
                href={event.vksLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-body break-all"
              >
                {event.vksLink}
              </a>
            </div>
          )}

          {event.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Icon name="FileText" size={18} className="text-blue-600" />
                <span className="text-sm font-medium font-body">Описание</span>
              </div>
              <p className="text-gray-900 font-body whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Icon name="UserCheck" size={18} className="text-blue-600" />
              <span className="text-sm font-medium font-body">Ответственные лица</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {event.responsible.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Icon name="User" size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 font-body">{person.name}</p>
                    <p className="text-sm text-gray-500 font-body">{person.position}</p>
                    {person.login && (
                      <p className="text-xs text-gray-400 font-body">Логин: {person.login}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {event.reminders && event.reminders.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Icon name="Bell" size={18} className="text-blue-600" />
                <span className="text-sm font-medium font-body">Напоминания</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.reminders.map((reminder, index) => (
                  <Badge key={index} variant="secondary" className="font-body">
                    {reminder}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {canEdit && (
          <div className="flex flex-col gap-2 pt-4 border-t">
            <div className="flex gap-2">
              <Button onClick={handleEdit} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Icon name="Calendar" size={18} className="mr-2" />
                Перенести
              </Button>
              {event.status !== 'cancelled' && onCancel && (
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <Icon name="XCircle" size={18} className="mr-2" />
                  Отменить
                </Button>
              )}
            </div>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Icon name="Trash2" size={18} className="mr-2" />
              Удалить событие
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}