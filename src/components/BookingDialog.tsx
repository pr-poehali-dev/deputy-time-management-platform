import { useState } from 'react';
import { BookingRequest, Person } from '@/types/schedule';
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
import Icon from '@/components/ui/icon';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: Person;
  onSubmit: (request: BookingRequest) => void;
}

export default function BookingDialog({
  open,
  onOpenChange,
  currentUser,
  onSubmit,
}: BookingDialogProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title || !date || !time || !endTime) return;

    const request: BookingRequest = {
      id: Date.now().toString(),
      requestedBy: currentUser,
      title,
      date,
      time,
      endTime,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onSubmit(request);
    onOpenChange(false);
    
    setTitle('');
    setDate('');
    setTime('');
    setEndTime('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Забронировать время</DialogTitle>
          <DialogDescription>
            Заявка будет отправлена администратору на подтверждение
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Название встречи</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Планерка отдела"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="time">Начало</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Конец</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Описание (опционально)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Обсуждение квартальных показателей"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !date || !time || !endTime}>
            <Icon name="Send" size={16} className="mr-2" />
            Отправить на подтверждение
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}