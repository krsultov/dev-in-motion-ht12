import express from "express";
import CronExpressionParser from "cron-parser";
import { ObjectId, type Collection, type WithId } from "mongodb";
import { getDb } from "../db/src/index";
import {
  cancelReminderAgendaJobs,
  scheduleReminderAgendaJobs,
  syncAllReminderAgendaJobs,
} from "./remindersAgenda";

type ReminderStored = {
  title: string;
  startTime: string;
  endTime: string;
  cron?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReminderDoc = WithId<ReminderStored>;

declare const process: {
  env: Record<string, string | undefined>;
  exit: (code?: number) => never;
};

function nowIso(): string {
  return new Date().toISOString();
}

function isIsoDateTime(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return !Number.isNaN(new Date(value).getTime());
}

function normalize(doc: ReminderDoc) {
  return {
    _id: doc._id.toHexString(),
    title: doc.title,
    endTime: doc.endTime,
    cron: doc.cron,
    description: doc.description,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function assertValidCron(expr: string): void {
  try {
    CronExpressionParser.parse(expr.trim());
  } catch {
    throw new Error("Invalid cron expression");
  }
}

let collectionPromise: Promise<Collection<ReminderStored>> | undefined;

async function getRemindersCollection(): Promise<Collection<ReminderStored>> {
  if (!collectionPromise) {
    collectionPromise = (async () => {
      const db = await getDb();
      const collection = db.collection<ReminderStored>(process.env.REMINDERS_COLLECTION ?? "RemindersMemory");
      await collection.createIndex({ startTime: 1 }, { unique: false });
      return collection;
    })();
  }
  return collectionPromise;
}

const app = express();
app.use(express.json());

app.get("/reminders", async (_req: any, res: any) => {
  try {
    const collection = await getRemindersCollection();
    const docs = await collection.find().sort({ startTime: 1 }).toArray();
    res.status(200).json(docs.map(normalize));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/reminders/:_id", async (req: any, res: any) => {
  try {
    const _id = typeof req.params?._id === "string" ? req.params._id.trim() : "";
    if (!_id) {
      res.status(400).json({ error: "_id is required" });
      return;
    }
    const collection = await getRemindersCollection();
    const doc = await collection.findOne({ _id: new ObjectId(_id) });
    if (!doc) {
      res.status(404).json({ error: "reminder not found" });
      return;
    }
    res.status(200).json(normalize(doc));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/reminders", async (req: any, res: any) => {
  try {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const startTime = req.body?.startTime;
    const endTime = req.body?.endTime;
    const description = typeof req.body?.description === "string" ? req.body.description : undefined;
    const cronRaw = req.body?.cron;
    let cron: string | undefined;
    if (typeof cronRaw === "string" && cronRaw.trim() !== "") {
      try {
        assertValidCron(cronRaw);
        cron = cronRaw.trim();
      } catch (e) {
        res.status(400).json({ error: (e as Error).message });
        return;
      }
    }

    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    if (!isIsoDateTime(startTime) || !isIsoDateTime(endTime)) {
      res.status(400).json({ error: "startTime and endTime must be valid ISO date-time strings" });
      return;
    }

    const t = nowIso();
    const collection = await getRemindersCollection();

    const doc = await collection.insertOne({
      title,
      startTime,
      endTime,
      ...(cron !== undefined ? { cron } : {}),
      ...(description !== undefined ? { description } : {}),
      createdAt: t,
      updatedAt: t,
    });

    const created = await collection.findOne({ _id: doc.insertedId });
    if (!created) {
      res.status(500).json({ error: "Failed to create reminder" });
      return;
    }
    try {
      await scheduleReminderAgendaJobs(created);
    } catch (e) {
      console.error("[Agenda] schedule after create failed:", e);
    }
    res.status(201).json(normalize(created));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put("/reminders/:_id", async (req: any, res: any) => {
  try {
    const _id = typeof req.params?._id === "string" ? req.params._id.trim() : "";
    if (!_id) {
      res.status(400).json({ error: "_id is required" });
      return;
    }

    const patch: Record<string, unknown> = {};
    const unset: Record<string, 1> = {};
    if (typeof req.body?.title === "string") patch.title = req.body.title.trim();
    if (typeof req.body?.description === "string") patch.description = req.body.description;
    if (isIsoDateTime(req.body?.startTime)) patch.startTime = req.body.startTime;
    if (isIsoDateTime(req.body?.endTime)) patch.endTime = req.body.endTime;
    if (req.body?.cron === null || req.body?.cron === "") {
      unset.cron = 1;
    } else if (typeof req.body?.cron === "string" && req.body.cron.trim() !== "") {
      try {
        assertValidCron(req.body.cron);
        patch.cron = req.body.cron.trim();
      } catch (e) {
        res.status(400).json({ error: (e as Error).message });
        return;
      }
    }
    patch.updatedAt = nowIso();

    const collection = await getRemindersCollection();
    const update: Record<string, unknown> = { $set: patch };
    if (Object.keys(unset).length > 0) update.$unset = unset;
    const doc = await collection.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      update,
      { returnDocument: "after" }
    );

    if (!doc) {
      res.status(404).json({ error: "reminder not found" });
      return;
    }

    try {
      await scheduleReminderAgendaJobs(doc);
    } catch (e) {
      console.error("[Agenda] schedule after update failed:", e);
    }
    res.status(200).json(normalize(doc));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete("/reminders/:_id", async (req: any, res: any) => {
  try {
    const _id = typeof req.params?._id === "string" ? req.params._id.trim() : "";
    if (!_id) {
      res.status(400).json({ error: "_id is required" });
      return;
    }

    try {
      await cancelReminderAgendaJobs(_id);
    } catch (e) {
      console.error("[Agenda] cancel before delete failed:", e);
    }

    const collection = await getRemindersCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(_id) });
    res.status(200).json({ deletedCount: result.deletedCount ?? 0 });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

const PORT = Number(process.env.REMINDERS_API_PORT ?? 3004);
app.listen(PORT, (error?: Error) => {
  if (error) {
    console.error("Failed to start reminders REST API:", error);
    process.exit(1);
  }
  console.log(`Reminders REST API running at http://localhost:${PORT}`);
  void (async () => {
    try {
      const collection = await getRemindersCollection();
      const docs = await collection.find({}).toArray();
      await syncAllReminderAgendaJobs(docs);
      console.log(`[Agenda] Synced ${docs.length} reminder job(s) (Mongo collection: ${process.env.AGENDA_JOBS_COLLECTION ?? "agendaJobs"})`);
    } catch (e) {
      console.error("[Agenda] Startup sync failed:", e);
    }
  })();
});

