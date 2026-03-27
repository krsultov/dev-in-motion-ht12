import type { MemoryEntry } from "@nelson/shared-types";

/**
 * Fetch a single memory entry from the Memory REST API (port 3001 by default).
 * Kept separate from `memory.ts` so importing it does not start the Memory MCP HTTP server.
 */
export default async function getMemoryById(id: string): Promise<MemoryEntry> {
  const baseUrl = process.env.MEMORY_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/memories/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Memory API GET /memories/${id} failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  return (await res.json()) as MemoryEntry;
}
