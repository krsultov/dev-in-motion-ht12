export type ActivityCategory = 'calendar' | 'call' | 'search' | 'purchase';
export type ActivityDay = 'Today' | 'Yesterday';
export type ApprovalStatus = 'pending' | 'approved' | 'declined';
export type CalendarActivityType = 'assistant' | 'booking' | 'trip';

export type ParentProfile = {
  name: string;
  initials: string;
  phone: string;
  lastActive: string;
  aiActive: boolean;
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  timestamp: string;
  day: ActivityDay;
};

export type Medication = {
  id: string;
  name: string;
  schedule: string;
};

export type Contact = {
  id: string;
  name: string;
  role: string;
  phone: string;
};

export type Preference = {
  id: string;
  label: string;
  value: string;
};

export type MemoryData = {
  medications: Medication[];
  contacts: Contact[];
  preferences: Preference[];
};

export type Approval = {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: ApprovalStatus;
  requestedAt: string;
};

export type ElderProfile = {
  name: string;
  age: number;
  city: string;
  bio: string;
  primaryLanguage: string;
  livingSituation: string;
  relationshipToUser: string;
};

export type NotificationPreference = {
  id: string;
  label: string;
  enabled: boolean;
};

export type FamilyAccountProfile = {
  name: string;
  relationshipLabel: string;
  permissionLevel: string;
  notificationPreferences: NotificationPreference[];
};

export type CalendarActivity = {
  id: string;
  date: string;
  title: string;
  detail: string;
  type: CalendarActivityType;
  isFuture?: boolean;
};

function addDaysToDate(value: Date, amount: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfMonthDate(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function endOfMonthDate(value: Date) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0, 23, 59, 59, 999);
}

function shiftMonth(value: Date, offset: number) {
  return new Date(value.getFullYear(), value.getMonth() + offset, 1);
}

function setTime(value: Date, hours: number, minutes: number) {
  const next = new Date(value);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function getNextMonday(value: Date) {
  const next = new Date(value);
  const dayOfWeek = next.getDay();
  const daysUntilMonday = ((8 - dayOfWeek) % 7) || 7;
  next.setDate(next.getDate() + daysUntilMonday);
  return next;
}

function formatDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTimeLabel(value: Date) {
  let hours = value.getHours();
  const minutes = `${value.getMinutes()}`.padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}

export const parentProfile: ParentProfile = {
  name: 'Maria Angelova',
  initials: 'МА',
  phone: '+359 88 111 2233',
  lastActive: '2 hours ago',
  aiActive: true,
};

export const activityItems: ActivityItem[] = [
  {
    id: '1',
    title: 'Booked doctor appointment',
    description: 'Dr. Petrov, cardiology · Tuesday Apr 1 · 10:00 AM',
    category: 'calendar',
    timestamp: 'Today · 10:14 AM',
    day: 'Today',
  },
  {
    id: '2',
    title: 'Called pharmacy',
    description: 'Checked availability for Amlodipine refill',
    category: 'call',
    timestamp: 'Today · 9:32 AM',
    day: 'Today',
  },
  {
    id: '3',
    title: 'Looked up bus schedule',
    description: 'Route from Mladost to Tokuda Hospital',
    category: 'search',
    timestamp: 'Today · 8:48 AM',
    day: 'Today',
  },
  {
    id: '4',
    title: 'Ordered groceries',
    description: 'Milk, bread, apples · Kaufland online',
    category: 'purchase',
    timestamp: 'Yesterday · 6:05 PM',
    day: 'Yesterday',
  },
  {
    id: '5',
    title: 'Scheduled family call',
    description: 'Video call with Ivan and Elena for Sunday afternoon',
    category: 'calendar',
    timestamp: 'Yesterday · 2:20 PM',
    day: 'Yesterday',
  },
  {
    id: '6',
    title: 'Asked about blood pressure ranges',
    description: 'Searched common safe ranges for home monitoring',
    category: 'search',
    timestamp: 'Yesterday · 11:11 AM',
    day: 'Yesterday',
  },
];

export const elderProfile: ElderProfile = {
  name: 'Maria Angelova',
  age: 74,
  city: 'Sofia',
  bio: 'Retired literature teacher who enjoys morning walks, family calls, and keeping a steady daily routine.',
  primaryLanguage: 'Bulgarian',
  livingSituation: 'Lives alone',
  relationshipToUser: 'Mother',
};

export const familyAccountProfile: FamilyAccountProfile = {
  name: 'Ivan Angelov',
  relationshipLabel: 'Son',
  permissionLevel: 'Full Access',
  notificationPreferences: [
    { id: 'purchases', label: 'Purchases', enabled: true },
    { id: 'wellness-alerts', label: 'Wellness Alerts', enabled: true },
    { id: 'unusual-activity', label: 'Unusual Activity', enabled: false },
  ],
};

function buildCurrentMonthCalendarActivities(): CalendarActivity[] {
  const today = new Date();
  const entries: CalendarActivity[] = [];
  const addEntry = (
    id: string,
    when: Date,
    title: string,
    type: CalendarActivityType,
    isFuture = false,
  ) => {
    entries.push({
      id,
      date: formatDateKey(when),
      title,
      detail: `${formatTimeLabel(when)}${isFuture ? ' scheduled' : ''}`,
      type,
      isFuture,
    });
  };

  const previousMonthStart = startOfMonthDate(shiftMonth(today, -1));
  const currentMonthStart = startOfMonthDate(today);
  const nextMonthStart = startOfMonthDate(shiftMonth(today, 1));
  const nextMondayDate = getNextMonday(today);

  const createDate = (
    monthStart: Date,
    dayOffset: number,
    hours: number,
    minutes: number,
  ) => setTime(addDaysToDate(monthStart, dayOffset), hours, minutes);

  addEntry('cm-prev-1', createDate(previousMonthStart, 2, 9, 20), 'Talked with the AI about breakfast ideas', 'assistant');
  addEntry('cm-prev-2', createDate(previousMonthStart, 6, 11, 5), 'Booked home lab visit', 'booking');
  addEntry('cm-prev-3', createDate(previousMonthStart, 11, 15, 10), 'Trip to the neighborhood pharmacy', 'trip');
  addEntry('cm-prev-4', createDate(previousMonthStart, 18, 10, 30), 'Asked the AI to read a message aloud', 'assistant');
  addEntry('cm-prev-5', createDate(previousMonthStart, 23, 13, 45), 'Reserved grocery delivery window', 'booking');

  addEntry('cm-cur-1', createDate(currentMonthStart, 1, 9, 15), 'Talked with the AI about breakfast ideas', 'assistant');
  addEntry('cm-cur-2', createDate(currentMonthStart, 3, 11, 0), 'Booked cardiology check-up', 'booking');
  addEntry('cm-cur-3', createDate(currentMonthStart, 5, 15, 30), 'Taxi ride to Tokuda Hospital', 'trip');
  addEntry('cm-cur-4', createDate(currentMonthStart, 7, 10, 10), 'Asked the AI to summarize medication notes', 'assistant');
  addEntry('cm-cur-5', createDate(currentMonthStart, 9, 14, 0), 'Reserved grocery delivery window', 'booking');
  addEntry('cm-cur-6', createDate(currentMonthStart, 12, 13, 20), 'Trip to the neighborhood pharmacy', 'trip');
  addEntry('cm-cur-7', createDate(currentMonthStart, 14, 8, 45), 'Morning check-in with the AI assistant', 'assistant');
  addEntry('cm-cur-8', createDate(currentMonthStart, 17, 16, 15), 'Booked family video call', 'booking');
  addEntry('cm-cur-9', createDate(currentMonthStart, 19, 12, 40), 'Visited the park with a neighbor', 'trip');
  addEntry('cm-cur-10', addDaysToDate(today, -2), 'Asked the AI about blood pressure readings', 'assistant');
  addEntry('cm-cur-11', addDaysToDate(today, -1), 'Booked prescription refill pickup', 'booking');
  addEntry('cm-cur-12', today, 'Talked with the AI assistant after lunch', 'assistant');
  addEntry('cm-cur-13', today, 'Logged taxi trip to the clinic', 'trip');
  addEntry('cm-cur-14', addDaysToDate(today, 1), 'Call Elena tomorrow at 9:00 AM', 'booking', true);
  addEntry('cm-cur-15', nextMondayDate, 'Set evening alarm for 8:00 PM next Monday', 'booking', true);
  addEntry('cm-cur-16', addDaysToDate(today, 4), 'Planned ride to the community center', 'trip', true);

  addEntry('cm-next-1', createDate(nextMonthStart, 2, 10, 0), 'Morning AI check-in before breakfast', 'assistant', true);
  addEntry('cm-next-2', createDate(nextMonthStart, 5, 9, 30), 'Book dental follow-up call', 'booking', true);
  addEntry('cm-next-3', createDate(nextMonthStart, 9, 14, 15), 'Ride to the senior center', 'trip', true);
  addEntry('cm-next-4', createDate(nextMonthStart, 13, 8, 0), 'Set medicine reminder for the evening', 'booking', true);
  addEntry('cm-next-5', createDate(nextMonthStart, 18, 11, 25), 'Talk with the AI about meal planning', 'assistant', true);

  return entries.sort((left, right) =>
    `${left.date} ${left.detail}`.localeCompare(`${right.date} ${right.detail}`),
  );
}

export const calendarMonthActivities: CalendarActivity[] = buildCurrentMonthCalendarActivities();

export const memoryData: MemoryData = {
  medications: [
    { id: '1', name: 'Metformin 500mg', schedule: 'Morning, with food' },
    { id: '2', name: 'Amlodipine 5mg', schedule: 'Evening' },
  ],
  contacts: [
    { id: '1', name: 'Dr. Petrov', role: 'Cardiologist', phone: '+359 2 123 456' },
    { id: '2', name: 'Elka', role: 'Sister', phone: '+359 88 765 4321' },
  ],
  preferences: [
    { id: '1', label: 'Preferred store', value: 'Kaufland, Mladost' },
    { id: '2', label: 'Daily schedule', value: 'Prefers to rest after 2 PM' },
  ],
};

export const approvals: Approval[] = [
  {
    id: '1',
    title: 'Orthopedic knee support',
    description: 'Size M · apteka.bg',
    amount: 89,
    currency: 'lv',
    status: 'pending',
    requestedAt: 'Today · 9:02 AM',
  },
  {
    id: '2',
    title: 'Vitamin D supplement',
    description: '60 capsules · approved yesterday',
    amount: 24,
    currency: 'lv',
    status: 'approved',
    requestedAt: 'Yesterday · 4:10 PM',
  },
  {
    id: '3',
    title: 'Taxi to hospital',
    description: 'Morning pickup estimate',
    amount: 18,
    currency: 'lv',
    status: 'declined',
    requestedAt: 'Yesterday · 8:25 AM',
  },
];
