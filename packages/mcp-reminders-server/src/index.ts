import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CalendarService } from "@nelson/reminders-domain";

const server = new Server(
  {
    name: "nelson-calendar-mcp",
    version: "0.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "add_calendar_event",
        description: "Add a new calendar event",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            startTime: { type: "string", description: "ISO string format" },
            endTime: { type: "string", description: "ISO string format" },
            description: { type: "string" },
          },
          required: ["title", "startTime", "endTime"],
        },
      },
      {
        name: "get_calendar_events",
        description: "Get calendar events within an optional date range",
        inputSchema: {
          type: "object",
          properties: {
            startDate: { type: "string", description: "ISO string format (optional)" },
            endDate: { type: "string", description: "ISO string format (optional)" },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "add_calendar_event") {
    const args = request.params.arguments as any;
    const event = CalendarService.addEvent({
      title: args.title,
      startTime: args.startTime,
      endTime: args.endTime,
      description: args.description,
    });
    return {
      content: [
        {
          type: "text",
          text: `Event added successfully: ${JSON.stringify(event)}`,
        },
      ],
    };
  }

  if (request.params.name === "get_calendar_events") {
    const args = request.params.arguments as any;
    const events = CalendarService.getEvents({
      startDate: args?.startDate,
      endDate: args?.endDate,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(events, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Nelson Calendar MCP Server running on stdio");
}

main().catch(console.error);
