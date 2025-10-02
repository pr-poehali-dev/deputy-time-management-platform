import { ScheduleEvent, Person } from '@/types/schedule';

export const mockPersons: Person[] = [
  { id: '1', name: 'Иванов И.И.', position: 'Помощник депутата' },
  { id: '2', name: 'Петрова М.С.', position: 'Советник' },
  { id: '3', name: 'Сидоров А.В.', position: 'Секретарь' },
];

export const mockEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Заседание комитета по бюджету',
    type: 'committee',
    date: '2025-10-03',
    time: '10:00',
    endTime: '12:00',
    location: 'Зал заседаний №3',
    description: 'Рассмотрение проекта федерального бюджета на 2026 год',
    responsible: [mockPersons[0], mockPersons[1]],
    status: 'scheduled',
    createdAt: '2025-10-01T10:00:00',
    reminders: ['За 1 час', 'За 1 день']
  },
  {
    id: '2',
    title: 'ВКС с региональными отделениями',
    type: 'vks',
    date: '2025-10-03',
    time: '14:00',
    endTime: '15:30',
    vksLink: 'https://meet.gov.ru/room/deputy-meeting',
    description: 'Обсуждение региональных инициатив',
    responsible: [mockPersons[2]],
    status: 'scheduled',
    createdAt: '2025-10-01T11:00:00',
    reminders: ['За 30 минут']
  },
  {
    id: '3',
    title: 'Парламентские слушания',
    type: 'hearing',
    date: '2025-10-04',
    time: '11:00',
    endTime: '13:00',
    location: 'Большой зал',
    description: 'Вопросы социальной политики',
    responsible: [mockPersons[0]],
    status: 'scheduled',
    createdAt: '2025-10-01T12:00:00',
    reminders: ['За 2 часа']
  },
  {
    id: '4',
    title: 'Встреча с избирателями',
    type: 'meeting',
    date: '2025-10-05',
    time: '16:00',
    endTime: '18:00',
    location: 'Общественная приемная',
    description: 'Прием граждан по личным вопросам',
    responsible: [mockPersons[1], mockPersons[2]],
    status: 'scheduled',
    createdAt: '2025-10-01T13:00:00',
    reminders: ['За 1 час']
  },
  {
    id: '5',
    title: 'Заседание фракции',
    type: 'committee',
    date: '2025-09-30',
    time: '09:00',
    endTime: '11:00',
    location: 'Зал заседаний №1',
    description: 'Обсуждение законопроектов',
    responsible: [mockPersons[0]],
    status: 'completed',
    createdAt: '2025-09-28T10:00:00'
  }
];
