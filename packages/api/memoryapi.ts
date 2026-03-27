import express from "express";
import { getDb } from "../db/src/index";
import type { MemoryDoc, MemoryEntry } from "@nelson/shared-types";


declare const process: {
  env: Record<string, string | undefined>;
  exit: (code?: number) => never;
};

type collectionPromise = 
  Promise<{
    createIndex: (spec: Record<string, 1 | -1>, options: { unique: boolean }) => Promise<string>;
    find: (filter?: Record<string, unknown>) => {
      sort: (spec: Record<string, 1 | -1>) => { toArray: () => Promise<MemoryDoc[]> };
    };
    findOne: (filter: Record<string, unknown>) => Promise<MemoryDoc | null>;
    findOneAndUpdate: (
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
      options: Record<string, unknown>
    ) => Promise<MemoryDoc | null>;
  }> | undefined;

let collectionPromise: collectionPromise;

function nowIso(): string {
  return new Date().toISOString();
}

function toMemoryEntry(doc: MemoryDoc): MemoryEntry {
  return {
    id: doc._id.toHexString(),
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
      const collection = db.collection<MemoryDoc>(process.env.MEMORIES_COLLECTION ?? "");
      await collection.createIndex({ key: 1 }, { unique: true });
      return collection;
    })();
  }
  return collectionPromise;
}

const app = express();
app.use(express.json());

app.post("/memories", async (req: any, res: any) => {
  try {
    const key = typeof req.body?.key === "string" ? req.body.key.trim() : "";
    const value = typeof req.body?.value === "string" ? req.body.value : "";

    if (!key) {
      res.status(400).json({ error: "key is required" });
      return;
    }

    const collection = await getMemoryCollection();
    const t = nowIso();
    const doc = await collection.findOneAndUpdate(
      { key },
      {
        $set: { value, updatedAt: t },
        $setOnInsert: { key, createdAt: t },
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

app.get("/memories", async (_req: any, res: any) => {
  try {
    const collection = await getMemoryCollection();
    const docs = await collection.find().sort({ updatedAt: -1 }).toArray();
    res.status(200).json(docs.map(toMemoryEntry));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/memories/:key", async (req: any, res: any) => {
  try {
    const key = typeof req.params?.key === "string" ? req.params.key.trim() : "";
    if (!key) {
      res.status(400).json({ error: "key is required" });
      return;
    }

    const collection = await getMemoryCollection();
    const doc = await collection.findOne({ key });
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
    const value = typeof req.body?.value === "string" ? req.body.value : "";

    if (!key) {
      res.status(400).json({ error: "key is required" });
      return;
    }

    const collection = await getMemoryCollection();
    const doc = await collection.findOneAndUpdate(
      { key },
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

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, (error?: Error) => {
  if (error) {
    console.error("Failed to start memory REST API:", error);
    process.exit(1);
  }
  console.log(`Memory REST API running at http://localhost:${PORT}`);
});
