import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import type { ReminderDTO } from "@nelson/shared-types";
import { startMcpServer } from "./mcp-express-setup";

const REMINDERS_API_BASE_URL = process.env.REMINDERS_API_BASE_URL ?? "http://localhost:3004";

async function apiFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${REMINDERS_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Reminders API ${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

async function listReminders(userId?: string): Promise<ReminderDTO[]> {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return apiFetchJson<ReminderDTO[]>(`/reminders${query}`);
}

async function createReminder(input: {
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  cron?: string;
  description?: string;
}): Promise<ReminderDTO> {
  return apiFetchJson<ReminderDTO>("/reminders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function getReminder(_id: string): Promise<ReminderDTO> {
  return apiFetchJson<ReminderDTO>(`/reminders/${encodeURIComponent(_id)}`);
}

async function updateReminder(input: {
  _id: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  cron?: string | null;
  description?: string | null;
}): Promise<ReminderDTO> {
  const { _id, ...rest } = input;
  return apiFetchJson<ReminderDTO>(`/reminders/${encodeURIComponent(_id)}`, {
    method: "PUT",
    body: JSON.stringify(rest),
  });
}

async function deleteReminder(_id: string): Promise<{ deletedCount: number }> {
  return apiFetchJson<{ deletedCount: number }>(`/reminders/${encodeURIComponent(_id)}`, {
    method: "DELETE",
  });
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
        userId: z.string().min(1),
        title: z.string().min(1),
        startTime: z.string().min(1),
        endTime: z.string().min(1),
        cron: z.string().optional(),
        description: z.string().optional(),
      },
    },
    async (input) => {
      try {
        const created = await createReminder(input);
        return { content: [{ type: "text", text: JSON.stringify(created, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    "get-reminder",
    {
      description: "Get a reminder by _id.",
      inputSchema: {
        _id: z.string().min(1),
      },
    },
    async ({ _id }) => {
      try {
        const doc = await getReminder(_id);
        return { content: [{ type: "text", text: JSON.stringify(doc, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    "update-reminder",
    {
      description: "Update a reminder by _id.",
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
      try {
        const updated = await updateReminder(input as any);
        return { content: [{ type: "text", text: JSON.stringify(updated, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    "delete-reminder",
    {
      description: "Delete a reminder by _id.",
      inputSchema: {
        _id: z.string().min(1),
      },
    },
    async ({ _id }) => {
      try {
        const result = await deleteReminder(_id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    "list-reminders",
    {
      description: "List all reminders, optionally filtered by userId.",
      inputSchema: {
        userId: z.string().optional(),
      },
    },
    async ({ userId }) => {
      try {
        const all = await listReminders(userId);
        return { content: [{ type: "text", text: JSON.stringify(all, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  return server;
}

const PORT = Number(process.env.REMINDERS_MCP_PORT ?? 3006);
startMcpServer("calendar-reminders-mcp", PORT, getServer);
