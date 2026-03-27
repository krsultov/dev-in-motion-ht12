import express from "express";
import cors from "cors";
import { ObjectId } from "mongodb";
import { getDb } from "../db/src/index";
import type { MemoryDoc, MemoryEntry, CallEvent, CallEventDoc, StatsOverview } from "@nelson/shared-types";


declare const process: {
  env: Record<string, string | undefined>;
  exit: (code?: number) => never;
};

let collectionPromise:
  | Promise<ReturnType<ReturnType<Awaited<ReturnType<typeof getDb>>["collection"]>>>
  | undefined;

function nowIso(): string {
  return new Date().toISOString();
}

function toMemoryEntry(doc: MemoryDoc): MemoryEntry {
  return {
    id: doc._id.toHexString(),
    userId: doc.userId,
    key: doc.key,
    value: doc.value,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function getMemoryCollection() {
  if (!collectionPromise) {
    collectionPromise = (async () => {
      const db = await getDb();
      const collection = db.collection<MemoryDoc>(process.env.MEMORIES_COLLECTION ?? "Memories");
      await collection.createIndex({ userId: 1, key: 1 }, { unique: true });
      return collection;
    })() as any;
  }
  return collectionPromise!;
}

const CALL_EVENTS_COLLECTION = process.env.CALL_EVENTS_COLLECTION ?? "CallEvents";
const USER_MEMORY_COLLECTION = process.env.USER_MEMORY_COLLECTION ?? "UserMemory";

let callEventsCollectionPromise:
  | Promise<ReturnType<ReturnType<Awaited<ReturnType<typeof getDb>>["collection"]>>>
  | undefined;

async function getCallEventsCollection() {
  if (!callEventsCollectionPromise) {
    callEventsCollectionPromise = (async () => {
      const db = await getDb();
      const collection = db.collection<CallEventDoc>(CALL_EVENTS_COLLECTION);
      await collection.createIndex({ startedAt: -1 });
      return collection;
    })() as any;
  }
  return callEventsCollectionPromise!;
}

const app = express();
app.use(cors());
app.use(express.json());

app.post("/memories", async (req: any, res: any) => {
  try {
    const userId = typeof req.body?.userId === "string" ? req.body.userId.trim() : "";
    const key = typeof req.body?.key === "string" ? req.body.key.trim() : "";
    const value = typeof req.body?.value === "string" ? req.body.value : "";

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    if (!key) {
      res.status(400).json({ error: "key is required" });
      return;
    }

    const collection = await getMemoryCollection();
    const t = nowIso();
    const doc = await (collection as any).findOneAndUpdate(
      { userId, key },
      {
        $set: { value, updatedAt: t },
        $setOnInsert: { userId, key, createdAt: t },
      },
      { upsert: true, returnDocument: "after" }
    );

    if (!doc) {
      res.status(500).json({ error: "Failed to create memory" });
      return;
    }

    res.status(201).json(toMemoryEntry(doc));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/memories", async (req: any, res: any) => {
  try {
    const userId = typeof req.query?.userId === "string" ? req.query.userId.trim() : "";
    if (!userId) {
      res.status(400).json({ error: "userId query parameter is required" });
      return;
    }

    const collection = await getMemoryCollection();
    const docs = await (collection as any).find({ userId }).sort({ updatedAt: -1 }).toArray();
    res.status(200).json(docs.map(toMemoryEntry));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/memories/by-id/:_id", async (req: any, res: any) => {
  try {
    const _id = typeof req.params?._id === "string" ? req.params._id.trim() : "";
    if (!_id) {
      res.status(400).json({ error: "_id is required" });
      return;
    }

    const collection = await getMemoryCollection();
    const doc = await (collection as any).findOne({ _id: new ObjectId(_id) });
    if (!doc) {
      res.status(404).json({ error: "memory not found" });
      return;
    }
    res.status(200).json(toMemoryEntry(doc));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/memories/:key", async (req: any, res: any) => {
  try {
    const key = typeof req.params?.key === "string" ? req.params.key.trim() : "";
    const userId = typeof req.query?.userId === "string" ? req.query.userId.trim() : "";
    if (!key) {
      res.status(400).json({ error: "key is required" });
      return;
    }

    const filter: Record<string, string> = { key };
    if (userId) filter.userId = userId;

    const collection = await getMemoryCollection();
    const doc = await (collection as any).findOne(filter);
    if (!doc) {
      res.status(404).json({ error: "memory not found" });
      return;
    }
    res.status(200).json(toMemoryEntry(doc));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put("/memories/:key", async (req: any, res: any) => {
  try {
    const key = typeof req.params?.key === "string" ? req.params.key.trim() : "";
    const userId = typeof req.body?.userId === "string" ? req.body.userId.trim() : "";
    const value = typeof req.body?.value === "string" ? req.body.value : "";

    if (!key) {
      res.status(400).json({ error: "key is required" });
      return;
    }

    const filter: Record<string, string> = { key };
    if (userId) filter.userId = userId;

    const collection = await getMemoryCollection();
    const doc = await (collection as any).findOneAndUpdate(
      filter,
      {
        $set: { value, updatedAt: nowIso() },
      },
      { returnDocument: "after" }
    );

    if (!doc) {
      res.status(404).json({ error: "memory not found" });
      return;
    }

    res.status(200).json(toMemoryEntry(doc));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete("/memories/:key", async (req: any, res: any) => {
  try {
    const key = typeof req.params?.key === "string" ? req.params.key.trim() : "";
    const userId = typeof req.query?.userId === "string" ? req.query.userId.trim() : "";
    if (!key) {
      res.status(400).json({ error: "key is required" });
      return;
    }

    const filter: Record<string, string> = { key };
    if (userId) filter.userId = userId;

    const collection = await getMemoryCollection();
    const result = await (collection as any).deleteOne(filter);
    res.status(200).json({ deletedCount: result.deletedCount ?? 0 });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ── Call Events ──────────────────────────────────────────────────────────────

app.post("/call-events", async (req: any, res: any) => {
  try {
    const userId = typeof req.body?.userId === "string" ? req.body.userId.trim() : "";
    const type = req.body?.type === "outbound" ? "outbound" : "inbound";
    const startedAt = typeof req.body?.startedAt === "string" ? req.body.startedAt : nowIso();
    const reminderId = typeof req.body?.reminderId === "string" ? req.body.reminderId : undefined;

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    const doc: CallEvent = { userId, type, startedAt };
    if (reminderId) doc.reminderId = reminderId;

    const collection = await getCallEventsCollection();
    const result = await (collection as any).insertOne(doc);
    res.status(201).json({ _id: result.insertedId.toHexString() });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put("/call-events/:id", async (req: any, res: any) => {
  try {
    const id = typeof req.params?.id === "string" ? req.params.id.trim() : "";
    if (!id) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    const $set: Record<string, unknown> = {};
    if (typeof req.body?.endedAt === "string") $set.endedAt = req.body.endedAt;
    if (typeof req.body?.durationSec === "number") $set.durationSec = req.body.durationSec;

    const collection = await getCallEventsCollection();
    await (collection as any).updateOne({ _id: new ObjectId(id) }, { $set });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/stats/overview", async (_req: any, res: any) => {
  try {
    const db = await getDb();
    const userMemoryCol = db.collection(USER_MEMORY_COLLECTION);
    const callEventsCol = await getCallEventsCollection();

    const [totalUsers, usersByMonthAgg, totalCalls, callsByMonthAgg, avgDurationAgg, planAgg] =
      await Promise.all([
        userMemoryCol.countDocuments(),
        userMemoryCol
          .aggregate([
            { $addFields: { parsedDate: { $dateFromString: { dateString: "$createdAt", onError: null } } } },
            { $match: { parsedDate: { $ne: null } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$parsedDate" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
        (callEventsCol as any).countDocuments(),
        (callEventsCol as any)
          .aggregate([
            { $addFields: { parsedDate: { $dateFromString: { dateString: "$startedAt", onError: null } } } },
            { $match: { parsedDate: { $ne: null } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$parsedDate" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
        (callEventsCol as any)
          .aggregate([
            { $match: { durationSec: { $exists: true, $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: "$durationSec" } } },
          ])
          .toArray(),
        userMemoryCol
          .aggregate([
            {
              $group: {
                _id: null,
                subscription: { $sum: { $cond: [{ $eq: ["$plan", "subscription"] }, 1, 0] } },
                perMinute: { $sum: { $cond: [{ $or: [{ $eq: ["$plan", "per-minute"] }, { $not: ["$plan"] }] }, 1, 0] } },
              },
            },
          ])
          .toArray(),
      ]);

    const stats: StatsOverview = {
      totalUsers,
      usersByMonth: usersByMonthAgg.map((r: any) => ({ month: r._id, count: r.count })),
      totalCalls,
      callsByMonth: callsByMonthAgg.map((r: any) => ({ month: r._id, count: r.count })),
      avgCallDurationSec: avgDurationAgg[0]?.avg ?? 0,
      planDistribution: {
        subscription: planAgg[0]?.subscription ?? 0,
        perMinute: planAgg[0]?.perMinute ?? 0,
      },
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, (error?: Error) => {
  if (error) {
    console.error("Failed to start memory REST API:", error);
    process.exit(1);
  }
  console.log(`Memory REST API running at http://localhost:${PORT}`);
});
