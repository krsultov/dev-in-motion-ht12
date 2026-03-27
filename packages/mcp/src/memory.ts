import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import type { MemoryEntry } from "@nelson/shared-types";
import { startMcpServer } from "./mcp-express-setup";

const MEMORY_API_BASE_URL = process.env.MEMORY_API_BASE_URL ?? "http://localhost:3001";

async function listMemories(userId: string): Promise<MemoryEntry[]> {
  const res = await fetch(`${MEMORY_API_BASE_URL}/memories?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error(`Memory API GET /memories failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  return (await res.json()) as MemoryEntry[];
}

async function addOrUpdateMemory(userId: string, key: string, value: string): Promise<MemoryEntry> {
  const res = await fetch(`${MEMORY_API_BASE_URL}/memories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, key, value }),
  });
  if (!res.ok) {
    throw new Error(`Memory API POST /memories failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  return (await res.json()) as MemoryEntry;
}

async function deleteMemory(userId: string, key: string): Promise<{ deletedCount: number }> {
  const res = await fetch(
    `${MEMORY_API_BASE_URL}/memories/${encodeURIComponent(key)}?userId=${encodeURIComponent(userId)}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error(`Memory API DELETE /memories/${key} failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  return (await res.json()) as { deletedCount: number };
}

function getServer(): McpServer {
  const server = new McpServer({
    name: "calendar-memory-mcp",
    version: "0.1.0",
  });

  server.registerTool(
    "new-memory",
    {
      description: "Create or update a memory key-value entry for a user.",
      inputSchema: {
        userId: z.string().min(1),
        key: z.string().min(1),
        value: z.string(),
      },
    },
    async ({ userId, key, value }) => {
      try {
        await addOrUpdateMemory(userId, key, value);
        const all = await listMemories(userId);
        server.sendResourceListChanged();
        return {
          content: [{ type: "text", text: JSON.stringify(all, null, 2) }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    "list-memory",
    {
      description: "List all memory entries for a user.",
      inputSchema: {
        userId: z.string().min(1),
      },
    },
    async ({ userId }) => {
      try {
        const all = await listMemories(userId);
        return {
          content: [{ type: "text", text: JSON.stringify(all, null, 2) }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  server.registerTool(
    "delete-memory",
    {
      description: "Delete a memory entry by key for a user.",
      inputSchema: {
        userId: z.string().min(1),
        key: z.string().min(1),
      },
    },
    async ({ userId, key }) => {
      try {
        const result = await deleteMemory(userId, key);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
      }
    }
  );

  return server;
}

const PORT = Number(process.env.MEMORY_MCP_PORT ?? 3005);
startMcpServer("calendar-memory-mcp", PORT, getServer);
