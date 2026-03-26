import crypto from 'node:crypto';
import type { CalendarEvent, AddCalendarEventParams, GetCalendarEventsParams } from './types.js';

// In-memory store for calendar events
const eventsStore: CalendarEvent[] = [];

export function addEvent(params: AddCalendarEventParams): CalendarEvent {
  const newEvent: CalendarEvent = {
    id: crypto.randomUUID(),
    title: params.title,
    startTime: params.startTime,
    endTime: params.endTime,
    description: params.description,
  };
  
  eventsStore.push(newEvent);
  return newEvent;
}

export function getEvents(params: GetCalendarEventsParams): CalendarEvent[] {
  let filteredEvents = eventsStore;
  
  if (params.startDate) {
    const startObj = new Date(params.startDate);
    filteredEvents = filteredEvents.filter(e => new Date(e.startTime) >= startObj);
  }
  
  if (params.endDate) {
    const endObj = new Date(params.endDate);
    filteredEvents = filteredEvents.filter(e => new Date(e.endTime) <= endObj);
  }
  
  return filteredEvents;
}
