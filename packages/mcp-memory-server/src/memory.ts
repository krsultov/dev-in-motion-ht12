import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod/v4";

declare const process: {
  env: Record<string, string | undefined>;
  exit: (code?: number) => never;
};

type MemoryEntry = {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

const memories = new Map<string, MemoryEntry>();

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
      const data = Array.from(memories.values());
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
      const existing = Array.from(memories.values()).find((m) => m.key === key);
      if (existing) {
        existing.value = value;
        existing.updatedAt = nowIso();
        memories.set(existing.id, existing);
      } else {
        const t = nowIso();
        const created: MemoryEntry = {
          id: makeId(),
          key,
          value,
          createdAt: t,
          updatedAt: t,
        };
        memories.set(created.id, created);
      }
      server.sendResourceListChanged();
      return {
        content: [{ type: "text", text: JSON.stringify(Array.from(memories.values()), null, 2) }],
      };
    }
  );

  server.registerTool(
    "list-memory",
    {
      description: "List all memory entries.",
    },
    async () => {
      return {
        content: [{ type: "text", text: JSON.stringify(Array.from(memories.values()), null, 2) }],
      };
    }
  );

  return server;
}

function readSessionId(header: string | null): string | undefined {
  return header ?? undefined;
}

const app = createMcpExpressApp();
const transports: Record<string, StreamableHTTPServerTransport> = {};

type McpHttpRequest = {
  headers: Headers;
  body: unknown;
};

type McpHttpResponse = {
  headersSent: boolean;
  status: (code: number) => {
    json: (payload: unknown) => void;
    send: (payload: string) => void;
  };
};

app.post("/mcp", async ({ req, res }: { req: McpHttpRequest; res: McpHttpResponse }) => {
  try {
    const sessionId = readSessionId(req.headers.get("mcp-session-id"));
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

app.get("/mcp", async ({ req, res }: { req: McpHttpRequest; res: McpHttpResponse }) => {
  const sessionId = readSessionId(req.headers.get("mcp-session-id"));
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
});

app.delete("/mcp", async ({ req, res }: { req: McpHttpRequest; res: McpHttpResponse }) => {
  const sessionId = readSessionId(req.headers.get("mcp-session-id"));
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
