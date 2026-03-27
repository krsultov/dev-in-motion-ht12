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

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
if (!PERPLEXITY_API_KEY) {
  console.warn("Missing PERPLEXITY_API_KEY — web search will be unavailable");
}

const REMINDERS_API_URL = process.env.REMINDERS_API_URL ?? "http://localhost:3004";
const MEMORY_API_URL = process.env.MEMORY_API_URL ?? "http://localhost:3001";
const USERDATA_API_URL = process.env.USERDATA_API_URL ?? "http://localhost:3002";

const SYSTEM_INSTRUCTIONS = `You are Nelson, a warm, patient, and reliable AI voice assistant designed specifically for elderly people in Bulgaria. They are calling you from a standard telephone.

CORE RULES:
1. LANGUAGE: You must speak ONLY in natural, fluent Bulgarian. Use the polite/respectful form ("Вие").
2. BREVITY (CRITICAL): Keep your responses extremely short—ideally 1 to 2 short sentences. Speak like a human in a real phone conversation. Do not overwhelm the caller with information. Pause and wait for them to reply.
3. TONE: Be compassionate, reassuring, and clear. Act like a trusted family friend. Never use technical jargon (never say "AI", "database", "prompt", or "system").
4. NO FORMATTING: Never use markdown, asterisks (*), hashtags (#), or bullet points. Write numbers and acronyms in a way that is easy to read aloud.

YOUR CAPABILITIES & TOOLS:
- REMINDERS: If the caller asks you to remind them of something (e.g., taking medicine, feeding the dog, a doctor's appointment), immediately use the "create_reminder" tool. You must determine the appropriate startTime and endTime from the conversation context.
- MEMORY: If they tell you a fact about themselves (e.g., "My doctor is Dr. Petrov" or "My knee hurts today"), acknowledge it warmly and use the "save_memory" tool to save it.
- PROFILE: At the START of each conversation, use the "get_user_profile" tool to load the caller's saved memories and upcoming reminders. Use this context to personalize the conversation.
- WEB SEARCH: If the caller asks a factual question you are unsure about (e.g., weather, news, general knowledge), use the "web_search" tool to find the answer. Summarize the result in 1-2 short sentences.

IMPORTANT RULES:
- The caller is on a phone and CANNOT visit websites, check links, or look things up themselves. You must ALWAYS give a complete answer with all the details they need (times, dates, names, numbers). NEVER say "check the website" or "you can find it at...".
- When asked about Bulgarian train schedules or timetables, search for "БДЖ разписание" along with the specific route. Give the exact departure and arrival times.

NEW CALLERS:
- When "get_user_profile" returns "isNewUser": true, this is someone calling for the first time.
- Greet them warmly, introduce yourself, and ask for their name: "Здравейте, аз съм Нелсън. Не мисля, че сме се запознавали. Как се казвате?"
- Once they give their name, immediately use "register_user" to create their profile. Then continue the conversation naturally.

CONVERSATION START:
When the user connects, first call "get_user_profile" to load their data. If they are a returning user, greet them by name: "Здравейте, [име]! Как мога да ви помогна днес?" If they are new, follow the NEW CALLERS instructions above.`;

const TOOLS = [
  {
    type: "function" as const,
    name: "create_reminder",
    description: "Create a reminder for the user. Determine the appropriate startTime and endTime from the conversation.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "What to remind about" },
        startTime: { type: "string", description: "When the reminder should fire (ISO 8601)" },
        endTime: { type: "string", description: "When the reminder period ends (ISO 8601). Can be the same as startTime for one-time reminders." },
        description: { type: "string", description: "Additional details about the reminder" },
      },
      required: ["title", "startTime", "endTime"],
    },
  },
  {
    type: "function" as const,
    name: "save_memory",
    description: "Save a fact about the user to their profile for future reference",
    parameters: {
      type: "object",
      properties: {
        key: { type: "string", description: "Short label for the memory (e.g., 'doctor_name', 'favorite_food', 'health_note')" },
        value: { type: "string", description: "The value to remember" },
      },
      required: ["key", "value"],
    },
  },
  {
    type: "function" as const,
    name: "get_user_profile",
    description: "Load the caller's saved memories and upcoming reminders to personalize the conversation. Call this at the start of each conversation. Returns isNewUser: true if this phone number has never called before.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function" as const,
    name: "register_user",
    description: "Register a new caller after asking for their name. Only use this when get_user_profile returned isNewUser: true.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "The caller's name" },
      },
      required: ["name"],
    },
  },
  {
    type: "function" as const,
    name: "web_search",
    description:
      "Search the web for current information (news, weather, facts, etc.)",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
      },
      required: ["query"],
    },
  },
];

async function searchWeb(query: string): Promise<string> {
  if (!PERPLEXITY_API_KEY) {
    return "Търсенето в интернет не е налично в момента.";
  }
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: query }],
      }),
    });
    if (!res.ok) {
      console.error(`Perplexity API error: ${res.status} ${res.statusText}`);
      return "Не успях да намеря информация в момента.";
    }
    const json = await res.json();
    const answer = json.choices?.[0]?.message?.content ?? "";

    console.log(answer);

    return answer || "Не бяха намерени резултати.";
  } catch (err) {
    console.error("Perplexity search failed:", err);
    return "Не успях да направя търсене в момента.";
  }
}

async function createReminder(userId: string, args: { title: string; startTime: string; endTime: string; description?: string }): Promise<string> {
  try {
    const res = await fetch(`${REMINDERS_API_URL}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: args.title,
        startTime: args.startTime,
        endTime: args.endTime,
        description: args.description,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Reminders API error: ${res.status} ${text}`);
      return JSON.stringify({ success: false, error: "Не успях да създам напомнянето." });
    }
    const data = await res.json();
    return JSON.stringify({ success: true, reminder: data });
  } catch (err) {
    console.error("Create reminder failed:", err);
    return JSON.stringify({ success: false, error: "Не успях да създам напомнянето." });
  }
}

async function saveMemory(userId: string, key: string, value: string): Promise<string> {
  try {
    const res = await fetch(`${MEMORY_API_URL}/memories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, key, value }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Memory API error: ${res.status} ${text}`);
      return JSON.stringify({ success: false, error: "Не успях да запазя информацията." });
    }
    const data = await res.json();
    return JSON.stringify({ success: true, memory: data });
  } catch (err) {
    console.error("Save memory failed:", err);
    return JSON.stringify({ success: false, error: "Не успях да запазя информацията." });
  }
}

async function getUserProfile(userId: string): Promise<string> {
  try {
    // Check if user exists in UserData API
    const userDataRes = await fetch(
      `${USERDATA_API_URL}/userMemory/${encodeURIComponent(userId)}`
    ).catch(() => null);

    const userRefs = userDataRes?.ok ? await userDataRes.json() : [];
    const isNewUser = !Array.isArray(userRefs) || userRefs.length === 0;

    if (isNewUser) {
      console.log(`New caller: ${userId}`);
      return JSON.stringify({ userId, isNewUser: true, memories: [], reminders: [] });
    }

    // Existing user — load their data
    const [memoriesRes, remindersRes] = await Promise.all([
      fetch(`${MEMORY_API_URL}/memories?userId=${encodeURIComponent(userId)}`).catch(() => null),
      fetch(`${REMINDERS_API_URL}/reminders?userId=${encodeURIComponent(userId)}`).catch(() => null),
    ]);

    const memories = memoriesRes?.ok ? await memoriesRes.json() : [];
    const reminders = remindersRes?.ok ? await remindersRes.json() : [];

    // Get user name from profile
    let name: string | undefined;
    try {
      const profileRes = await fetch(`${USERDATA_API_URL}/userData/${encodeURIComponent(userRefs[0]._id)}`);
      if (profileRes.ok) {
        const profile = await profileRes.json();
        name = profile.name;
      }
    } catch { /* ignore */ }

    return JSON.stringify({ userId, isNewUser: false, name, memories, reminders });
  } catch (err) {
    console.error("Get user profile failed:", err);
    return JSON.stringify({ userId, isNewUser: false, memories: [], reminders: [] });
  }
}

async function registerUser(userId: string, name: string): Promise<string> {
  try {
    const res = await fetch(`${USERDATA_API_URL}/userData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: userId,
        password: "auto-registered",
        name,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`UserData API error: ${res.status} ${text}`);
      return JSON.stringify({ success: false, error: "Не успях да запазя профила." });
    }
    const data = await res.json();
    console.log(`Registered new user: ${name} (${userId})`);
    return JSON.stringify({ success: true, name: data.name, userId });
  } catch (err) {
    console.error("Register user failed:", err);
    return JSON.stringify({ success: false, error: "Не успях да запазя профила." });
  }
}

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
    <Stream url="wss://${host}/media-stream">
      <Parameter name="callerPhone" value="${String(from)}"/>
    </Stream>
  </Connect>
</Response>`;
  return c.text(twiml, 200, { "Content-Type": "text/xml" });
});

// WebSocket endpoint for Twilio media stream
app.get(
  "/media-stream",
  upgradeWebSocket((c) => {
    let callerPhone = "unknown";

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
        // Trigger the initial greeting immediately
        ws.send(JSON.stringify({ type: "response.create" }));
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
            const callId = data.call_id;
            const args = JSON.parse(data.arguments);

            const handleToolResult = (output: string) => {
              ws.send(
                JSON.stringify({
                  type: "conversation.item.create",
                  item: {
                    type: "function_call_output",
                    call_id: callId,
                    output,
                  },
                })
              );
              ws.send(JSON.stringify({ type: "response.create" }));
            };

            if (data.name === "web_search") {
              searchWeb(args.query).then(handleToolResult);
            } else if (data.name === "create_reminder") {
              createReminder(callerPhone, args).then(handleToolResult);
            } else if (data.name === "save_memory") {
              saveMemory(callerPhone, args.key, args.value).then(handleToolResult);
            } else if (data.name === "get_user_profile") {
              getUserProfile(callerPhone).then(handleToolResult);
            } else if (data.name === "register_user") {
              registerUser(callerPhone, args.name).then(handleToolResult);
            } else {
              handleToolResult(
                JSON.stringify({ success: false, error: "Unknown tool" })
              );
            }
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
            callerPhone = msg.start.customParameters?.callerPhone ?? "unknown";
            console.log(`Stream started: ${streamSid}, caller: ${callerPhone}`);
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
