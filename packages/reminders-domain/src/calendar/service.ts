import crypto from 'node:crypto';
import type { CalendarEvent, AddCalendarEventParams, GetCalendarEventsParams, UpdateCalendarEventParams, DeleteCalendarEventParams } from './types.js';

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

export function updateEvent(params: UpdateCalendarEventParams): CalendarEvent {
  const index = eventsStore.findIndex(e => e.id === params.id);
  if (index === -1) {
    throw new Error(`Event with ID ${params.id} not found`);
  }
  
  const existingEvent = eventsStore[index];
  const updatedEvent: CalendarEvent = {
    ...existingEvent,
    title: params.title ?? existingEvent.title,
    startTime: params.startTime ?? existingEvent.startTime,
    endTime: params.endTime ?? existingEvent.endTime,
    description: params.description ?? existingEvent.description,
  };
  
  eventsStore[index] = updatedEvent;
  return updatedEvent;
}

export function deleteEvent(params: DeleteCalendarEventParams): void {
  const index = eventsStore.findIndex(e => e.id === params.id);
  if (index === -1) {
    throw new Error(`Event with ID ${params.id} not found`);
  }
  
  eventsStore.splice(index, 1);
}
