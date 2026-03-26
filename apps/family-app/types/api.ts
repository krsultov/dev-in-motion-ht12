export type ParentProfile = {
  id: string;
  name: string;
  initials: string;
  phoneNumber: string;
  aiActive: boolean;
  lastActiveAt: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  category: 'calendar' | 'call' | 'search' | 'purchase';
  timestamp: string;
  day?: string;
};

export type Approval = {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'declined';
  requestedAt: string;
  resolvedAt: string | null;
};

export type Medication = {
  id: string;
  name: string;
  schedule: string;
  updatedAt: string;
};

export type MemoryContact = {
  id: string;
  name: string;
  role: string;
  phone: string;
  updatedAt: string;
};

export type Preference = {
  id: string;
  label: string;
  value: string;
  updatedAt: string;
};

export type MemoryData = {
  medications: Medication[];
  contacts: MemoryContact[];
  preferences: Preference[];
};
