import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod/v4";
import type { MemoryEntry } from "@nelson/shared-types";

declare const process: {
  env: Record<string, string | undefined>;
  exit: (code?: number) => never;
};


async function listMemories(): Promise<MemoryEntry[]> {
  const baseUrl = process.env.MEMORY_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/memories`);
  if (!res.ok) {
    throw new Error(`Memory API GET /memories failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  return (await res.json()) as MemoryEntry[];
}

async function addOrUpdateMemory(key: string, value: string): Promise<MemoryEntry> {
  const baseUrl = process.env.MEMORY_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/memories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) {
    throw new Error(`Memory API POST /memories failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  return (await res.json()) as MemoryEntry;
}

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function isValidIsoDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

function validateRange(startAt: string, endAt: string): void {
  if (!isValidIsoDate(startAt) || !isValidIsoDate(endAt)) {
    throw new Error("startAt and endAt must be valid ISO date-time strings");
  }
  if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
    throw new Error("endAt must be after startAt");
  }
}

function getServer(): McpServer {
  const server = new McpServer({
    name: "calendar-memory-mcp",
    version: "0.1.0",
  });

  server.registerResource(
    "memory-store",
    "memory://entries",
    {
      title: "Memory Entries",
      description: "Current in-memory key-value entries.",
      mimeType: "application/json",
    },
    async () => {
      const data = await listMemories();
      return {
        contents: [
          {
            uri: "memory://entries",
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "new-memory",
    {
      description: "Create or update a memory key-value entry.",
      inputSchema: {
        key: z.string().min(1),
        value: z.string(),
      },
    },
    async ({ key, value }) => {
      await addOrUpdateMemory(key, value);
      const all = await listMemories();
      server.sendResourceListChanged();
      return {
        content: [{ type: "text", text: JSON.stringify(all, null, 2) }],
      };
    }
  );

  server.registerTool(
    "list-memory",
    {
      description: "List all memory entries.",
    },
    async () => {
      const all = await listMemories();
      return {
        content: [{ type: "text", text: JSON.stringify(all, null, 2) }],
      };
    }
  );

  return server;
}

function readSessionId(header: unknown): string | undefined {
  if (typeof header === "string") return header;
  if (Array.isArray(header) && typeof header[0] === "string") return header[0];
  return undefined;
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

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, (error?: Error) => {
  if (error) {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  }
  console.log(`Calendar + Memory MCP server running at http://localhost:${PORT}/mcp`);
});
