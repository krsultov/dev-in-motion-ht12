import { Agenda } from "agenda";
import { MongoBackend } from "@agendajs/mongo-backend";
import { ObjectId } from "mongodb";
import Twilio from "twilio";
import { getDb } from "../db/src/index";

declare const process: {
  env: Record<string, string | undefined>;
};

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    console.warn("[Twilio] Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN — outbound calls disabled");
    return null;
  }
  return Twilio(sid, token);
}

async function placeReminderCall(reminderId: string): Promise<void> {
  const client = getTwilioClient();
  if (!client) return;

  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const voiceGatewayUrl = process.env.VOICE_GATEWAY_URL;
  if (!twilioPhone || !voiceGatewayUrl) {
    console.error("[Twilio] Missing TWILIO_PHONE_NUMBER or VOICE_GATEWAY_URL");
    return;
  }

  const db = await getDb();
  const collection = db.collection(process.env.REMINDERS_COLLECTION ?? "RemindersMemory");
  const reminder = await collection.findOne({ _id: new ObjectId(reminderId) });
  if (!reminder) {
    console.error(`[Twilio] Reminder ${reminderId} not found — skipping call`);
    return;
  }

  const userPhone = reminder.userId as string;
  const title = reminder.title as string;
  const callbackUrl = `${voiceGatewayUrl}/reminder-callback?reminderId=${encodeURIComponent(reminderId)}&callerPhone=${encodeURIComponent(userPhone)}&reminderTitle=${encodeURIComponent(title)}`;

  try {
    const call = await client.calls.create({
      to: userPhone,
      from: twilioPhone,
      url: callbackUrl,
      timeout: 30,
      machineDetection: "Enable",
    });
    console.log(`[Twilio] Outbound call placed: ${call.sid} → ${userPhone} for reminder "${title}"`);
  } catch (err) {
    console.error(`[Twilio] Failed to place call to ${userPhone}:`, err);
  }
}


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
    console.log(`[Agenda] Cron reminder fired: ${reminderId}`, job.attrs.name);
    await placeReminderCall(reminderId);
  });

  agenda.define(REMINDER_JOB_START, async (job) => {
    const data = job.attrs.data as { reminderId?: string };
    const reminderId = data.reminderId ?? "";
    console.log(`[Agenda] Start reminder fired: ${reminderId}`, job.attrs.name);
    await placeReminderCall(reminderId);
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
    if (isNaN(end.getTime()) || end.getTime() <= Date.now()) {
      return;
    }
    await agenda.every(doc.cron.trim(), REMINDER_JOB_CRON, { reminderId }, { endDate: end });
    return;
  }

  const start = new Date(doc.startTime);
  if (isNaN(start.getTime()) || start.getTime() <= Date.now()) {
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
