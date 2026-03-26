export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO string 
  endTime: string;   // ISO string
  description?: string;
}

export interface AddCalendarEventParams {
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface GetCalendarEventsParams {
  startDate?: string;
  endDate?: string;
}

export interface UpdateCalendarEventParams {
  id: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
}

export interface DeleteCalendarEventParams {
  id: string;
}
