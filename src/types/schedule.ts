export type EventType = 'meeting' | 'vks' | 'hearing' | 'committee' | 'visit' | 'reception';
export type EventStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface Person {
  id: string;
  name: string;
  position: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  endTime?: string;
  location?: string;
  vksLink?: string;
  description?: string;
  responsible: Person[];
  status: EventStatus;
  createdAt: string;
  reminders?: string[];
}
