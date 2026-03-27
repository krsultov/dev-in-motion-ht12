import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

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

type SessionEntry = {
  transport: StreamableHTTPServerTransport;
  lastActivity: number;
};

export function startMcpServer(
  name: string,
  port: number,
  getServer: () => McpServer,
): void {
  const app = createMcpExpressApp();
  const sessions: Record<string, SessionEntry> = {};

  // Session TTL cleanup
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of Object.entries(sessions)) {
      if (now - entry.lastActivity > SESSION_TTL_MS) {
        console.log(`[MCP] Cleaning up stale session: ${id}`);
        entry.transport.close?.();
        delete sessions[id];
      }
    }
  }, 60_000);

  app.post("/mcp", async (req: any, res: any) => {
    try {
      const headerVal =
        typeof req?.get === "function" ? req.get("mcp-session-id") : (req?.headers?.["mcp-session-id"] ?? undefined);
      const sessionId = readSessionId(headerVal);
      let transport: StreamableHTTPServerTransport | undefined;

      if (sessionId && sessions[sessionId]) {
        sessions[sessionId].lastActivity = Date.now();
        transport = sessions[sessionId].transport;
      } else if (!sessionId && isInitializeRequest(req.body)) {
        const createdTransport = new StreamableHTTPServerTransport({
          sessionIdGenerator: makeId,
          onsessioninitialized: (newSessionId) => {
            sessions[newSessionId] = {
              transport: createdTransport,
              lastActivity: Date.now(),
            };
          },
        });
        createdTransport.onclose = () => {
          const currentId = createdTransport.sessionId;
          if (currentId) {
            delete sessions[currentId];
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
      console.error(`[${name}] Error handling MCP POST /mcp request:`, error);
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
    if (!sessionId || !sessions[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    sessions[sessionId].lastActivity = Date.now();
    await sessions[sessionId].transport.handleRequest(req, res);
  });

  app.delete("/mcp", async (req: any, res: any) => {
    const headerVal =
      typeof req?.get === "function" ? req.get("mcp-session-id") : (req?.headers?.["mcp-session-id"] ?? undefined);
    const sessionId = readSessionId(headerVal);
    if (!sessionId || !sessions[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    await sessions[sessionId].transport.handleRequest(req, res);
  });

  const httpServer = app.listen(port, (error?: Error) => {
    if (error) {
      console.error(`[${name}] Failed to start:`, error);
      process.exit(1);
    }
    console.log(`[${name}] MCP server running at http://localhost:${port}/mcp`);
  });

  const shutdown = () => {
    console.log(`[${name}] Shutting down...`);
    clearInterval(cleanupInterval);
    for (const [id, entry] of Object.entries(sessions)) {
      entry.transport.close?.();
      delete sessions[id];
    }
    httpServer.close(() => {
      console.log(`[${name}] HTTP server closed`);
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
