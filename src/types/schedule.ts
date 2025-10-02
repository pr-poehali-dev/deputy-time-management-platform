export type EventType = 'meeting' | 'vks' | 'hearing' | 'committee' | 'visit' | 'reception' | 'regional-trip';
export type EventStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface Person {
  id: string;
  name: string;
  position: string;
  login?: string;
  email?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  endTime?: string;
  endDate?: string;
  location?: string;
  vksLink?: string;
  description?: string;
  responsible: Person[];
  status: EventStatus;
  createdAt: string;
  reminders?: string[];
  regionName?: string;
  isMultiDay?: boolean;
}