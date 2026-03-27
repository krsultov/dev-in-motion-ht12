export type ActivityCategory = 'calendar' | 'call' | 'search' | 'purchase';
export type ApprovalStatus = 'pending' | 'approved' | 'declined';
export type CalendarActivityType = 'assistant' | 'booking' | 'trip';

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  timestamp: string;
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

export type CalendarActivity = {
  id: string;
  date: string;
  title: string;
  detail: string;
  description?: string;
  type: CalendarActivityType;
  isFuture?: boolean;
};
