import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod/v4";
import CronExpressionParser from "cron-parser";
import { ObjectId } from "mongodb";
import { getDb } from "@nelson/db";
import type { ReminderDoc, ReminderDTO } from "@nelson/shared-types";

declare const process: {
  env: Record<string, string | undefined>;
  exit: (code?: number) => never;
};


const REMINDERS_COLLECTION = process.env.MONGO_REMINDERS_COLLECTION ?? "RemindersMemory";

let remindersCollectionPromise:
  | Promise<{
      createIndex: (spec: Record<string, 1 | -1>, options: { unique: boolean }) => Promise<string>;
      find: () => { sort: (spec: Record<string, 1 | -1>) => { toArray: () => Promise<ReminderDoc[]> } };
      findOne: (filter: Record<string, unknown>) => Promise<ReminderDoc | null>;
      insertOne: (doc: unknown) => Promise<{ insertedId: ObjectId }>;
      findOneAndUpdate: (
        filter: Record<string, unknown>,
        update: Record<string, unknown>,
        options: Record<string, unknown>
      ) => Promise<ReminderDoc | null>;
      deleteOne: (filter: Record<string, unknown>) => Promise<{ deletedCount?: number }>;
    }>
  | undefined;

function nowIso(): string {
  return new Date().toISOString();
}

function toReminderDTO(doc: ReminderDoc): ReminderDTO {
  return {
    _id: doc._id.toHexString(),
    userId: doc.userId,
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

async function getRemindersCollection() {
  if (!remindersCollectionPromise) {
    remindersCollectionPromise = (async () => {
      const db = await getDb();
      const collection = db.collection<ReminderDoc>(REMINDERS_COLLECTION);
      await collection.createIndex({ startTime: 1 }, { unique: false } as any);
      return collection as any;
    })();
  }
  return remindersCollectionPromise;
}

async function listReminders(): Promise<ReminderDTO[]> {
  const collection = await getRemindersCollection();
  const docs = await collection.find().sort({ startTime: 1 }).toArray();
  return docs.map(toReminderDTO);
}

function parseObjectId(value: string): ObjectId {
  try {
    return new ObjectId(value);
  } catch {
    throw new Error("Invalid _id");
  }
}

async function createReminder(input: {
  title: string;
  startTime: string;
  endTime: string;
  cron?: string;
  description?: string;
}): Promise<ReminderDTO> {
  const collection = await getRemindersCollection();
  const t = nowIso();
  let cron: string | undefined;
  if (typeof input.cron === "string" && input.cron.trim() !== "") {
    assertValidCron(input.cron);
    cron = input.cron.trim();
  }
  const doc = await collection.insertOne({
    title: input.title,
    startTime: input.startTime,
    endTime: input.endTime,
    ...(cron !== undefined ? { cron } : {}),
    description: input.description,
    createdAt: t,
    updatedAt: t,
  });
  const created = await collection.findOne({ _id: doc.insertedId });
  if (!created) throw new Error("Failed to create reminder");
  return toReminderDTO(created);
}

async function getReminder(_id: string): Promise<ReminderDTO> {
  const collection = await getRemindersCollection();
  const doc = await collection.findOne({ _id: parseObjectId(_id) });
  if (!doc) throw new Error("Reminder not found");
  return toReminderDTO(doc);
}

async function updateReminder(input: {
  _id: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  cron?: string | null;
  description?: string | null;
}): Promise<ReminderDTO> {
  const collection = await getRemindersCollection();
  const patch: Record<string, unknown> = { updatedAt: nowIso() };
  const unset: Record<string, 1> = {};
  if (typeof input.title === "string") patch.title = input.title;
  if (typeof input.startTime === "string") patch.startTime = input.startTime;
  if (typeof input.endTime === "string") patch.endTime = input.endTime;
  if (input.cron === null || input.cron === "") {
    unset.cron = 1;
  } else if (typeof input.cron === "string" && input.cron.trim() !== "") {
    assertValidCron(input.cron);
    patch.cron = input.cron.trim();
  }
  if (input.description === null) patch.description = null;
  if (typeof input.description === "string") patch.description = input.description;

  const update: Record<string, unknown> = { $set: patch };
  if (Object.keys(unset).length > 0) update.$unset = unset;

  const updated = await collection.findOneAndUpdate(
    { _id: parseObjectId(input._id) },
    update,
    { returnDocument: "after" }
  );
  if (!updated) throw new Error("Reminder not found");
  return toReminderDTO(updated);
}

async function deleteReminder(_id: string): Promise<{ deletedCount: number }> {
  const collection = await getRemindersCollection();
  const result = await collection.deleteOne({ _id: parseObjectId(_id) });
  return { deletedCount: result.deletedCount ?? 0 };
}

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readSessionId(header: unknown): string | undefined {
  if (typeof header === "string") return header;
  if (Array.isArray(header) && typeof header[0] === "string") return header[0];
  return undefined;
}

function getServer(): McpServer {
  const server = new McpServer({
    name: "calendar-reminders-mcp",
    version: "0.1.0",
  });

  server.registerResource(
    "reminders-store",
    "reminders://items",
    {
      title: "Reminder Items",
      description: "Persisted calendar reminders.",
      mimeType: "application/json",
    },
    async () => {
      const all = await listReminders();
      return {
        contents: [
          {
            uri: "reminders://items",
            mimeType: "application/json",
            text: JSON.stringify(all, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "create-reminder",
    {
      description: "Create a new calendar reminder.",
      inputSchema: {
        title: z.string().min(1),
        startTime: z.string().min(1),
        endTime: z.string().min(1),
        cron: z.string().optional(),
        description: z.string().optional(),
      },
    },
    async (input) => {
      const created = await createReminder(input as any);
      return { content: [{ type: "text", text: JSON.stringify(created, null, 2) }] };
    }
  );

  server.registerTool(
    "get-reminder",
    {
      description: "Get a reminder by Mongo _id.",
      inputSchema: {
        _id: z.string().min(1),
      },
    },
    async ({ _id }) => {
      const doc = await getReminder(_id);
      return { content: [{ type: "text", text: JSON.stringify(doc, null, 2) }] };
    }
  );

  server.registerTool(
    "update-reminder",
    {
      description: "Update a reminder by Mongo _id (no upsert).",
      inputSchema: {
        _id: z.string().min(1),
        title: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        cron: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
      },
    },
    async (input) => {
      const updated = await updateReminder(input as any);
      return { content: [{ type: "text", text: JSON.stringify(updated, null, 2) }] };
    }
  );

  server.registerTool(
    "delete-reminder",
    {
      description: "Delete a reminder by Mongo _id.",
      inputSchema: {
        _id: z.string().min(1),
      },
    },
    async ({ _id }) => {
      const result = await deleteReminder(_id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "list-reminders",
    {
      description: "List all reminders.",
    },
    async () => {
      const all = await listReminders();
      return { content: [{ type: "text", text: JSON.stringify(all, null, 2) }] };
    }
  );

  return server;
}

const app = createMcpExpressApp();
const transports: Record<string, StreamableHTTPServerTransport> = {};

app.post("/mcp", async (req: any, res: any) => {
  try {
    const headerVal =
      typeof req?.get === "function" ? req.get("mcp-session-id") : (req?.headers?.["mcp-session-id"] ?? undefined);
    const sessionId = readSessionId(headerVal);
    let transport: StreamableHTTPServerTransport | undefined;

    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      const createdTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: makeId,
        onsessioninitialized: (newSessionId) => {
          transports[newSessionId] = createdTransport;
        },
      });
      createdTransport.onclose = () => {
        const currentId = createdTransport.sessionId;
        if (currentId) {
          delete transports[currentId];
        }
      };
      transport = createdTransport;
      const server = getServer();
      await server.connect(createdTransport);
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: No valid session ID provided" },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP POST /mcp request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (req: any, res: any) => {
  const headerVal =
    typeof req?.get === "function" ? req.get("mcp-session-id") : (req?.headers?.["mcp-session-id"] ?? undefined);
  const sessionId = readSessionId(headerVal);
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
});

app.delete("/mcp", async (req: any, res: any) => {
  const headerVal =
    typeof req?.get === "function" ? req.get("mcp-session-id") : (req?.headers?.["mcp-session-id"] ?? undefined);
  const sessionId = readSessionId(headerVal);
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
});

const PORT = Number(process.env.REMINDERS_MCP_PORT ?? 3006);
app.listen(PORT, (error?: Error) => {
  if (error) {
    console.error("Failed to start reminders MCP server:", error);
    process.exit(1);
  }
  console.log(`Calendar + Reminders MCP server running at http://localhost:${PORT}/mcp`);
});

