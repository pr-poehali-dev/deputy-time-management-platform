import { useState, useEffect } from 'react';
import { ScheduleEvent, EventType, Person } from '@/types/schedule';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: ScheduleEvent;
  availablePersons: Person[];
  onSave: (event: Partial<ScheduleEvent>) => void;
}

const eventTypes = [
  { value: 'meeting', label: 'Встреча' },
  { value: 'vks', label: 'ВКС' },
  { value: 'hearing', label: 'Слушания' },
  { value: 'committee', label: 'Заседание' },
  { value: 'visit', label: 'Визит' },
  { value: 'reception', label: 'Прием' },
  { value: 'regional-trip', label: 'Выезд в регион' },
];

export default function EventDialog({
  open,
  onOpenChange,
  event,
  availablePersons,
  onSave,
}: EventDialogProps) {
  const [formData, setFormData] = useState<Partial<ScheduleEvent>>(
    event || {
      title: '',
      type: 'meeting',
      date: '',
      time: '',
      endTime: '',
      endDate: '',
      location: '',
      vksLink: '',
      description: '',
      responsible: [],
      status: 'scheduled',
      reminders: [],
      regionName: '',
      isMultiDay: false,
    }
  );

  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>(
    event?.responsible.map((p) => p.id) || []
  );

  useEffect(() => {
    if (event) {
      setFormData(event);
      setSelectedPersonIds(event.responsible.map((p) => p.id));
    } else {
      setFormData({
        title: '',
        type: 'meeting',
        date: '',
        time: '',
        endTime: '',
        endDate: '',
        location: '',
        vksLink: '',
        description: '',
        responsible: [],
        status: 'scheduled',
        reminders: [],
        regionName: '',
        isMultiDay: false,
      });
      setSelectedPersonIds([]);
    }
  }, [event, open]);

  const handleSubmit = () => {
    const selectedPersons = availablePersons.filter((p) =>
      selectedPersonIds.includes(p.id)
    );

    onSave({
      ...formData,
      responsible: selectedPersons,
      id: event?.id || Date.now().toString(),
      createdAt: event?.createdAt || new Date().toISOString(),
    });

    onOpenChange(false);
  };

  const togglePerson = (personId: string) => {
    setSelectedPersonIds((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {event ? 'Редактировать событие' : 'Новое событие'}
          </DialogTitle>
          <DialogDescription>
            {event ? 'Внесите изменения в событие' : 'Заполните информацию о новом событии'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название события *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите название"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Тип события *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: EventType) => {
                  const updates: Partial<ScheduleEvent> = { type: value };
                  if (value === 'regional-trip') {
                    updates.time = '00:00';
                    updates.endTime = '23:59';
                  }
                  setFormData({ ...formData, ...updates });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">{formData.type === 'regional-trip' ? 'Дата начала *' : 'Дата *'}</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            {formData.type === 'regional-trip' && (
              <div className="space-y-2">
                <Label htmlFor="endDate">Дата окончания</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value, isMultiDay: true })}
                />
              </div>
            )}
          </div>

          {formData.type !== 'regional-trip' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Время начала *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Время окончания</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          )}

          {formData.type === 'regional-trip' ? (
            <div className="space-y-2">
              <Label htmlFor="regionName">Название региона *</Label>
              <Input
                id="regionName"
                value={formData.regionName || ''}
                onChange={(e) => setFormData({ ...formData, regionName: e.target.value })}
                placeholder="Например: Московская область"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="location">Место проведения</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Например: Зал заседаний №3"
              />
            </div>
          )}

          {formData.type === 'vks' && (
            <div className="space-y-2">
              <Label htmlFor="vksLink">Ссылка на ВКС</Label>
              <Input
                id="vksLink"
                value={formData.vksLink || ''}
                onChange={(e) => setFormData({ ...formData, vksLink: e.target.value })}
                placeholder="https://meet.gov.ru/room/..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Подробности события"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Ответственные лица *</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              {availablePersons.map((person) => (
                <Badge
                  key={person.id}
                  className={`cursor-pointer transition-colors ${
                    selectedPersonIds.includes(person.id)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => togglePerson(person.id)}
                >
                  {selectedPersonIds.includes(person.id) && (
                    <Icon name="Check" size={14} className="mr-1" />
                  )}
                  {person.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !formData.title || 
              !formData.date || 
              (formData.type !== 'regional-trip' && !formData.time) ||
              (formData.type === 'regional-trip' && !formData.regionName)
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            {event ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}