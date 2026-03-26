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
