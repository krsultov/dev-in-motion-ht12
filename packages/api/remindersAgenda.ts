import { Agenda } from "agenda";
import { MongoBackend } from "@agendajs/mongo-backend";
import type { ObjectId } from "mongodb";
import { getDb } from "../db/src/index";

declare const process: {
  env: Record<string, string | undefined>;
};


export const REMINDER_JOB_CRON = "reminder cron due";
export const REMINDER_JOB_START = "reminder start due";

export type ReminderAgendaRow = {
  _id: ObjectId;
  startTime: string;
  endTime: string;
  cron?: string;
};

let agendaPromise: Promise<Agenda> | undefined;

function collectionName(): string {
  return process.env.AGENDA_JOBS_COLLECTION ?? "agendaJobs";
}

async function createAgenda(): Promise<Agenda> {
  const db = await getDb();
  const backend = new MongoBackend({
    mongo: db,
    collection: collectionName(),
  });

  const agenda = new Agenda({
    backend,
    processEvery: process.env.AGENDA_PROCESS_EVERY ?? "5 seconds",
  });

  agenda.define(REMINDER_JOB_CRON, async (job) => {
    const data = job.attrs.data as { reminderId?: string };
    const reminderId = data.reminderId ?? "";
    console.log(`[Agenda] Cron reminder: ${reminderId}`, job.attrs.name);
  });

  agenda.define(REMINDER_JOB_START, async (job) => {
    const data = job.attrs.data as { reminderId?: string };
    const reminderId = data.reminderId ?? "";
    console.log(`[Agenda] Start reminder: ${reminderId}`, job.attrs.name);
  });

  agenda.on("error", (err: Error) => {
    console.error("[Agenda] error:", err);
  });

  await agenda.start();
  return agenda;
}

export function getRemindersAgenda(): Promise<Agenda> {
  if (!agendaPromise) {
    agendaPromise = createAgenda();
  }
  return agendaPromise;
}

export async function cancelReminderAgendaJobs(reminderIdHex: string): Promise<void> {
  const agenda = await getRemindersAgenda();
  await agenda.cancel({
    name: REMINDER_JOB_CRON,
    data: { reminderId: reminderIdHex },
  });
  await agenda.cancel({
    name: REMINDER_JOB_START,
    data: { reminderId: reminderIdHex },
  });
}

export async function scheduleReminderAgendaJobs(doc: ReminderAgendaRow): Promise<void> {
  const agenda = await getRemindersAgenda();
  const reminderId = doc._id.toHexString();

  await cancelReminderAgendaJobs(reminderId);

  if (doc.cron && doc.cron.trim() !== "") {
    const end = new Date(doc.endTime);
    if (end.getTime() <= Date.now()) {
      return;
    }
    await agenda.every(doc.cron.trim(), REMINDER_JOB_CRON, { reminderId }, { endDate: end });
    return;
  }

  const start = new Date(doc.startTime);
  if (start.getTime() <= Date.now()) {
    return;
  }
  await agenda.schedule(start, REMINDER_JOB_START, { reminderId });
}

export async function syncAllReminderAgendaJobs(
  reminders: ReminderAgendaRow[]
): Promise<void> {
  for (const doc of reminders) {
    await scheduleReminderAgendaJobs(doc);
  }
}
