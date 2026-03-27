export type ReminderRecord = {
  _id: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  cron?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateReminderPayload = {
  title: string;
  startTime: string;
  endTime: string;
  cron?: string;
  description?: string;
};

export type UpdateReminderPayload = Partial<CreateReminderPayload>;
