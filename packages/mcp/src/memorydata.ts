import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import type { MemoryEntry, UserDataResponse } from "@nelson/shared-types";
import getMemoryById from "./memoryClient";
import { startMcpServer } from "./mcp-express-setup";

const USERDATA_API_BASE_URL = process.env.USERDATA_API_BASE_URL ?? "http://localhost:3002";

function sanitizeUserDataForAi(doc: UserDataResponse): Omit<UserDataResponse, "password"> {
  const { password: _omit, ...rest } = doc;
  return rest;
}

function sanitizeMemoryForAi(doc: MemoryEntry): MemoryEntry {
  return {
    id: doc.id,
    userId: doc.userId,
    key: doc.key,
    value: doc.value,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

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

async function listAllUserData(): Promise<Omit<UserDataResponse, "password">[]> {
  const docs = await apiFetchJson<UserDataResponse[]>("/userData");
  return docs.map(sanitizeUserDataForAi);
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
      try {
        const all = await listUserData(userId);
        return {
          content: [{ type: "text", text: JSON.stringify(all, null, 2) }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    "create-user-data",
    {
      description: "Create a user data document (Mongo _id is generated).",
      inputSchema: {
        phone: z.string().min(1),
        password: z.string().min(1),
        name: z.string().optional(),
        memories: z.array(z.string()).optional(),
        contacts: z.array(z.object({ name: z.string(), role: z.string(), phone: z.string() })).optional(),
        preferences: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
        medications: z.array(z.object({ name: z.string(), schedule: z.string() })).optional(),
      },
    },
    async (input) => {
      try {
        const created = await createUserData(input as any);
        server.sendResourceListChanged();
        return {
          content: [{ type: "text", text: JSON.stringify(sanitizeUserDataForAi(created), null, 2) }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
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
      const all = await listAllUserData();
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
      try {
        const doc = await getUserData(_id);
        return {
          content: [{ type: "text", text: JSON.stringify(sanitizeUserDataForAi(doc), null, 2) }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    "update-user-data",
    {
      description: "Update a user data document by Mongo _id (no upsert).",
      inputSchema: {
        _id: z.string().min(1),
        phone: z.string().optional(),
        name: z.string().optional(),
        memories: z.array(z.string()).optional(),
        contacts: z.array(z.object({ name: z.string(), role: z.string(), phone: z.string() })).optional(),
        preferences: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
        medications: z.array(z.object({ name: z.string(), schedule: z.string() })).optional(),
      },
    },
    async (input) => {
      try {
        const updated = await updateUserData(input as any);
        server.sendResourceListChanged();
        return {
          content: [{ type: "text", text: JSON.stringify(sanitizeUserDataForAi(updated), null, 2) }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    "list-user-data",
    {
      description: "List all user data documents.",
    },
    async () => {
      try {
        const all = await listAllUserData();
        return { content: [{ type: "text", text: JSON.stringify(all, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  return server;
}

const PORT = Number(process.env.USERDATA_MCP_PORT ?? 3003);
startMcpServer("user-data-mcp", PORT, getServer);
