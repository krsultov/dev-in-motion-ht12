import "dotenv/config";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import { serve } from "@hono/node-server";
import WebSocket from "ws";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY environment variable");
  process.exit(1);
}

const SYSTEM_INSTRUCTIONS = `You are Nelson, a warm, patient, and reliable AI voice assistant designed specifically for elderly people in Bulgaria. They are calling you from a standard telephone.

CORE RULES:
1. LANGUAGE: You must speak ONLY in natural, fluent Bulgarian. Use the polite/respectful form ("Вие").
2. BREVITY (CRITICAL): Keep your responses extremely short—ideally 1 to 2 short sentences. Speak like a human in a real phone conversation. Do not overwhelm the caller with information. Pause and wait for them to reply.
3. TONE: Be compassionate, reassuring, and clear. Act like a trusted family friend. Never use technical jargon (never say "AI", "database", "prompt", or "system").
4. NO FORMATTING: Never use markdown, asterisks (*), hashtags (#), or bullet points. Write numbers and acronyms in a way that is easy to read aloud.

YOUR CAPABILITIES & TOOLS:
- REMINDERS: If the caller asks you to remind them of something (e.g., taking medicine, feeding the dog, a doctor's appointment), immediately use the "create_reminder" tool.
- MEMORY: If they tell you a fact about themselves (e.g., "My doctor is Dr. Petrov" or "My knee hurts today"), acknowledge it warmly and use the appropriate tool to save it to their profile.

CONVERSATION START:
If the user has just connected, always start by greeting them warmly and simply, for example: "Здравейте, аз съм Нелсън. Как мога да ви помогна днес?" (Do not repeat this if the conversation has already started).`;

const TOOLS = [
  {
    type: "function" as const,
    name: "create_reminder",
    description: "Create a reminder for the user",
    parameters: {
      type: "object",
      properties: {
        task: { type: "string", description: "What to remind about" },
        time: { type: "string", description: "When (ISO 8601)" },
      },
      required: ["task", "time"],
    },
  },
];

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// Twilio webhook — returns TwiML to connect the call to a media stream
app.post("/incoming-call", async (c) => {
  const body = await c.req.parseBody();
  const from = body["From"] ?? "unknown";
  const to = body["To"] ?? "unknown";
  console.log(`Incoming call from ${from} to ${to}`);
  const host = c.req.header("Host") ?? "localhost:3000";
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${host}/media-stream"/>
  </Connect>
</Response>`;
  return c.text(twiml, 200, { "Content-Type": "text/xml" });
});

// WebSocket endpoint for Twilio media stream
app.get(
  "/media-stream",
  upgradeWebSocket(() => {
    let openaiWs: WebSocket | null = null;
    let streamSid: string | null = null;
    let lastAssistantItemId: string | null = null;
    const markQueue: string[] = [];

    function openOpenAI(twilioWs: { send: (data: string) => void }) {
      const ws = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-realtime",
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      ws.on("open", () => {
        console.log("Connected to OpenAI Realtime API");
        ws.send(
          JSON.stringify({
            type: "session.update",
            session: {
              type: "realtime",
              model: "gpt-realtime",
              output_modalities: ["audio"],
              audio: {
                input: {
                  format: { type: "audio/pcmu" },
                  turn_detection: { type: "server_vad" },
                },
                output: {
                  format: { type: "audio/pcmu" },
                  voice: "cedar",
                },
              },
              instructions: SYSTEM_INSTRUCTIONS,
              tools: TOOLS,
            },
          })
        );
      });

      ws.on("message", (raw) => {
        const data = JSON.parse(raw.toString());

        switch (data.type) {
          case "response.output_audio.delta":
            if (streamSid && data.delta) {
              twilioWs.send(
                JSON.stringify({
                  event: "media",
                  streamSid,
                  media: { payload: data.delta },
                })
              );
              // Track for interruption handling
              if (data.item_id) {
                lastAssistantItemId = data.item_id;
              }
            }
            break;

          case "response.output_audio.done":
            if (streamSid) {
              const markLabel = `audio-done-${Date.now()}`;
              markQueue.push(markLabel);
              twilioWs.send(
                JSON.stringify({
                  event: "mark",
                  streamSid,
                  mark: { name: markLabel },
                })
              );
            }
            break;

          case "input_audio_buffer.speech_started":
            // User started speaking — interrupt any playing audio
            if (streamSid) {
              twilioWs.send(
                JSON.stringify({ event: "clear", streamSid })
              );
              if (lastAssistantItemId) {
                ws.send(
                  JSON.stringify({
                    type: "conversation.item.truncate",
                    item_id: lastAssistantItemId,
                    content_index: 0,
                    audio_end_ms: 0,
                  })
                );
              }
            }
            markQueue.length = 0;
            lastAssistantItemId = null;
            break;

          case "response.function_call_arguments.done": {
            console.log(
              `Tool call: ${data.name}(${data.arguments})`
            );
            // Acknowledge the tool call with a result
            const callId = data.call_id;
            ws.send(
              JSON.stringify({
                type: "conversation.item.create",
                item: {
                  type: "function_call_output",
                  call_id: callId,
                  output: JSON.stringify({
                    success: true,
                    message: "Напомнянето е създадено.",
                  }),
                },
              })
            );
            // Trigger a new response after the tool result
            ws.send(JSON.stringify({ type: "response.create" }));
            break;
          }

          case "error":
            console.error("OpenAI error:", data.error);
            break;

          default:
            break;
        }
      });

      ws.on("error", (err) => {
        console.error("OpenAI WebSocket error:", err);
      });

      ws.on("close", () => {
        console.log("OpenAI WebSocket closed");
      });

      return ws;
    }

    return {
      onOpen(_event, ws) {
        console.log("Twilio media stream connected");
        openaiWs = openOpenAI({
          send: (data: string) => ws.send(data),
        });
      },

      onMessage(event, ws) {
        const msg = JSON.parse(
          typeof event.data === "string"
            ? event.data
            : event.data.toString()
        );

        switch (msg.event) {
          case "start":
            streamSid = msg.start.streamSid;
            console.log(`Stream started: ${streamSid}`);
            break;

          case "media":
            if (openaiWs?.readyState === WebSocket.OPEN) {
              openaiWs.send(
                JSON.stringify({
                  type: "input_audio_buffer.append",
                  audio: msg.media.payload,
                })
              );
            }
            break;

          case "mark":
            markQueue.shift();
            break;

          case "stop":
            console.log("Twilio stream stopped");
            break;

          default:
            break;
        }
      },

      onClose() {
        console.log("Twilio media stream disconnected");
        if (openaiWs) {
          openaiWs.close();
          openaiWs = null;
        }
        streamSid = null;
      },

      onError(event) {
        console.error("Twilio WebSocket error:", event);
      },
    };
  })
);

const PORT = Number(process.env.PORT) || 3000;
const server = serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Voice gateway listening on port ${PORT}`);
});
injectWebSocket(server);
