export type ActivityCategory = 'calendar' | 'call' | 'search' | 'purchase';
export type ActivityDay = 'Today' | 'Yesterday';
export type ApprovalStatus = 'pending' | 'approved' | 'declined';

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
