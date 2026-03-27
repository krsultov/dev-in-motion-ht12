import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod/v4";
import type { MemoryEntry, UserDataResponse } from "@nelson/shared-types";
import getMemoryById from "./memoryClient";

declare const process: {
  env: Record<string, string | undefined>;
  exit: (code?: number) => never;
};

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function sanitizeUserDataForAi(doc: UserDataResponse): UserDataResponse {
  const { password: _omit, ...rest } = doc;
  return { ...rest, password: undefined };
}

function sanitizeMemoryForAi(doc: MemoryEntry): MemoryEntry {
  return {
    id: doc.id,
    key: doc.key,
    value: doc.value,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function listAllUserData(): Promise<UserDataResponse[]> {
  const docs = await apiFetchJson<UserDataResponse[]>("/userData");
  return docs.map(sanitizeUserDataForAi);
}

async function listUserMemory(): Promise<UserDataResponse[]> {
  return listAllUserData();
}

function readSessionId(header: unknown): string | undefined {
  if (typeof header === "string") return header;
  if (Array.isArray(header) && typeof header[0] === "string") return header[0];
  return undefined;
}


const USERDATA_API_BASE_URL = process.env.USERDATA_API_BASE_URL ?? "http://localhost:3002";

async function apiFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${USERDATA_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`UserData API ${res.status} ${res.statusText}: ${text}`);
  }

  return (await res.json()) as T;
}

type UserMemoryRef = { _id: string };

async function listUserData(userId: string): Promise<MemoryEntry[]> {
  const refs = await apiFetchJson<UserMemoryRef[]>(
    `/userMemory/${encodeURIComponent(userId)}`
  );
  if (refs.length === 0) {
    return [];
  }
  const docs = await Promise.all(refs.map((ref) => getMemoryById(ref._id)));
  return docs.map(sanitizeMemoryForAi);
}

async function createUserData(input: {
  phone: string;
  password: string;
  name?: string;
  memories?: unknown[];
  contacts?: unknown[];
  preferences?: unknown[];
  medications?: unknown[];
}): Promise<UserDataResponse> {
  return apiFetchJson<UserDataResponse>("/userData", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function getUserData(_id: string): Promise<UserDataResponse> {
  return apiFetchJson<UserDataResponse>(`/userData/${encodeURIComponent(_id)}`);
}

async function updateUserData(input: {
  _id: string;
  phone?: string;
  password?: string;
  name?: string;
  memories?: unknown[];
  contacts?: unknown[];
  preferences?: unknown[];
  medications?: unknown[];
}): Promise<UserDataResponse> {
  const { _id, ...rest } = input;
  return apiFetchJson<UserDataResponse>(`/userData/${encodeURIComponent(_id)}`, {
    method: "PUT",
    body: JSON.stringify(rest),
  });
}

function getServer(): McpServer {
  const server = new McpServer({
    name: "user-data-mcp",
    version: "0.1.0",
  });

  server.registerTool(
    "user-data-store",
    {
      title: "User Data",
      description:
        "Load persisted user profile(s) for this user: looks up document ids by phone (`userId`), fetches full userData for each, returns JSON for the assistant (passwords omitted).",
      inputSchema: {
        userId: z.string().min(1),
      },
    },
    async ({ userId }) => {
      const all = await listUserData(userId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(all, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "create-user-data",
    {
      description: "Create a user data document (Mongo _id is generated).",
      inputSchema: {
        phone: z.string().optional(),
        password: z.string().optional(),
        name: z.string().optional(),
        memories: z.array(z.any()).optional(),
        contacts: z.array(z.any()).optional(),
        preferences: z.array(z.any()).optional(),
        medications: z.array(z.any()).optional(),
      },
    },
    async (input) => {
      const created = await createUserData(input as any);
      server.sendResourceListChanged();
      return {
        content: [{ type: "text", text: JSON.stringify(sanitizeUserDataForAi(created), null, 2) }],
      };
    }
  );

  server.registerResource(
    "user-memory-store",
    "user://memory",
    {
      title: "User Memory",
      description: "Persisted user memory data.",
      mimeType: "application/json",
    },
    async () => {
      const all = await listUserMemory();
      return {
        contents: [
          {
            uri: "user://memory",
            mimeType: "application/json",
            text: JSON.stringify(all, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "get-user-data",
    {
      description: "Get a single user data document by Mongo _id.",
      inputSchema: {
        _id: z.string().min(1),
      },
    },
    async ({ _id }) => {
      const doc = await getUserData(_id);
      return {
        content: [{ type: "text", text: JSON.stringify(sanitizeUserDataForAi(doc), null, 2) }],
      };
    }
  );

  server.registerTool(
    "update-user-data",
    {
      description: "Update a user data document by Mongo _id (no upsert).",
      inputSchema: {
        _id: z.string().min(1),
        phone: z.string().optional(),
        password: z.string().optional(),
        name: z.string().optional(),
        memories: z.array(z.any()).optional(),
        contacts: z.array(z.any()).optional(),
        preferences: z.array(z.any()).optional(),
        medications: z.array(z.any()).optional(),
      },
    },
    async (input) => {
      const updated = await updateUserData(input as any);
      server.sendResourceListChanged();
      return {
        content: [{ type: "text", text: JSON.stringify(sanitizeUserDataForAi(updated), null, 2) }],
      };
    }
  );

  server.registerTool(
    "list-user-data",
    {
      description: "List all user data documents.",
    },
    async () => {
      const all = await listAllUserData();
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

const PORT = Number(process.env.PORT ?? 3003);
app.listen(PORT, (error?: Error) => {
  if (error) {
    console.error("Failed to start userData MCP server:", error);
    process.exit(1);
  }
  console.log(`UserData MCP server running at http://localhost:${PORT}/mcp`);
});
