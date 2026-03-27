import express from "express";
import { ObjectId } from "mongodb";
import { CallUserMemory, type UserMemory } from "../db/src/index";

declare const process: {
  env: Record<string, string | undefined>;
  exit: (code?: number) => never;
};

type UserMemoryDoc = UserMemory & { _id: ObjectId };

function normalize(doc: UserMemoryDoc) {
  return {
    _id: doc._id.toHexString(),
    phone: doc.phone,
    password: doc.password,
    name: doc.name,
    subscription: doc.subscription,
    memories: doc.memories ?? [],
    contacts: doc.contacts ?? [],
    preferences: doc.preferences ?? [],
    medications: doc.medications ?? [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

const app = express();
app.use(express.json());

app.post("/userData", async (req: any, res: any) => {
  try {
    const collection = await CallUserMemory();
    const t = new Date().toISOString();

    const toInsert: Omit<UserMemory, "createdAt" | "updatedAt"> & { createdAt: string; updatedAt: string } = {
      phone: "",
      password: "",
      createdAt: t,
      updatedAt: t,
    };

    if (typeof req.body?.phone === "string") toInsert.phone = req.body.phone;
    if (typeof req.body?.password === "string") toInsert.password = req.body.password;
    if (typeof req.body?.name === "string") toInsert.name = req.body.name;
    if (typeof req.body?.subscription === "boolean") toInsert.subscription = req.body.subscription;
    if (Array.isArray(req.body?.memories)) toInsert.memories = req.body.memories;
    if (Array.isArray(req.body?.contacts)) toInsert.contacts = req.body.contacts;
    if (Array.isArray(req.body?.preferences)) toInsert.preferences = req.body.preferences;
    if (Array.isArray(req.body?.medications)) toInsert.medications = req.body.medications;

    const result = await collection.insertOne(toInsert);
    const doc = await collection.findOne({ _id: result.insertedId });
    if (!doc) {
      res.status(500).json({ error: "Failed to create userData" });
      return;
    }

    res.status(201).json(normalize(doc as UserMemoryDoc));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});


app.get("/userMemory/:userId", async (req: any, res: any) => {
  try {
    const userId = typeof req.params?.userId === "string" ? decodeURIComponent(req.params.userId).trim() : "";
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    const collection = await CallUserMemory();
    const docs = await collection.find({ phone: userId }).project({ _id: 1 }).toArray();
    res.status(200).json(docs.map((d) => ({ _id: d._id.toHexString() })));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/userData", async (_req: any, res: any) => {
  try {
    const collection = await CallUserMemory();
    const docs = await collection.find().sort({ updatedAt: -1 }).toArray();
    res.status(200).json(docs.map(normalize));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/userData/:_id", async (req: any, res: any) => {
  try {
    const _id = typeof req.params?._id === "string" ? req.params._id.trim() : "";
    if (!_id) {
      res.status(400).json({ error: "_id is required" });
      return;
    }

    const collection = await CallUserMemory();
    const doc = await collection.findOne({ _id: new ObjectId(_id) } as any);
    if (!doc) {
      res.status(404).json({ error: "userData not found" });
      return;
    }

    res.status(200).json(normalize(doc));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put("/userData/:_id", async (req: any, res: any) => {
  try {
    const _id = typeof req.params?._id === "string" ? req.params._id.trim() : "";
    if (!_id) {
      res.status(400).json({ error: "_id is required" });
      return;
    }

    const collection = await CallUserMemory();
    const t = new Date().toISOString();

    const $set: Record<string, unknown> = { updatedAt: t };
    if (typeof req.body?.phone === "string") $set.phone = req.body.phone;
    if (typeof req.body?.password === "string") $set.password = req.body.password;
    if (typeof req.body?.name === "string") $set.name = req.body.name;
    if (typeof req.body?.subscription === "boolean") $set.subscription = req.body.subscription;
    if (Array.isArray(req.body?.memories)) $set.memories = req.body.memories;
    if (Array.isArray(req.body?.contacts)) $set.contacts = req.body.contacts;
    if (Array.isArray(req.body?.preferences)) $set.preferences = req.body.preferences;
    if (Array.isArray(req.body?.medications)) $set.medications = req.body.medications;

    const doc = await collection.findOneAndUpdate({ _id: new ObjectId(_id) } as any, { $set }, { returnDocument: "after" });

    if (!doc) {
      res.status(404).json({ error: "userData not found" });
      return;
    }

    res.status(200).json(normalize(doc));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

const PORT = Number(process.env.PORT ?? 3002);
app.listen(PORT, (error?: Error) => {
  if (error) {
    console.error("Failed to start userData REST API:", error);
    process.exit(1);
  }
  console.log(`userData REST API running at http://localhost:${PORT}`);
});
