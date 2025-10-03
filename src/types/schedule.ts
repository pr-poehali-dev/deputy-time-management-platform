export type EventType = 'meeting' | 'vks' | 'hearing' | 'committee' | 'visit' | 'reception' | 'regional-trip' | 'pcr-test';
export type EventStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'archived' | 'pending';
export type UserRole = 'admin' | 'responsible' | 'guest';

export interface BookingRequest {
  id: string;
  requestedBy: Person;
  title: string;
  date: string;
  time: string;
  endTime: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

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
  bookingRequestId?: string;
}