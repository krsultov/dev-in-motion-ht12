<div align="center">

# 📞 Nelson

### *The internet finally speaks to everyone — even if all you have is a landline. You call. Nelson handles the rest.*

</div>

---

> **One phone call. Your entire life, handled.**  
> Nelson is an AI agent you dial from any phone — Nokia, landline, payphone, or smartphone — that knows who you are, speaks Bulgarian, remembers everything you tell it, and actually does things: sets reminders, call for help or build an entire memory about you.
> No app. No smartphone. No internet. Just dial.

---

## 🌍 Why Nelson exists

More than 1.5 million Bulgarians live in villages and small towns where digital services don't reach them. Not because they aren't smart — because the internet was designed for people who already have a smartphone, an email address, and a credit card.

Nelson flips that. We built the AI agent layer on top of the phone network that already exists everywhere. If you can make a phone call, you have access to the internet, to AI, and to everything your family and community can offer.

This is **beyond the city**. This is **Code to Care**.

---

## 💡 What is Nelson?

Nelson is a **voice-first AI agent platform** with three layers:

| Layer | What it is |
|---|---|
| 📞 **Voice Agent** | An AI you call from any phone. It speaks Bulgarian, knows you by your phone number, and has persistent memory across every conversation. |
| 👨‍👩‍👧 **Family App** | A mobile + web app for family members to set up their relative's profile and see activity. |
| 🖥️ **Operator Dashboard** | A web dashboard to track API costs and statistics about the users and manage them. |

---

## 🎯 Features

### 📞 Voice Agent — the core
- **Call from anything** — Nokia 3310, landline, payphone, smartphone — any phone that can dial
- **Instant identification** by phone number — profile loaded before you finish saying hello
- **Zero-friction registration** — first-time callers are onboarded in a 90-second conversation, no forms
- **Fully Bulgarian** — understands natural spoken Bulgarian including regional speech
- **Persistent memory** — *"Remember that my doctor is Dr. Petrov in Plovdiv"* — recalled forever
- **Proactive callbacks** — agent calls *you* back for reminders, not just the other way around
- **SOS escalation** — say *"I need help"* → 112 called + all family contacts alerted simultaneously

### What the agent can do on a call
- **Research** — weather, bus times, pharmacy hours, news, government procedures, anything
- **Reminders** — *"Remind me to take my pills every day at 8am"* → Nelson calls you
- **Memory** — builds a living profile from every conversation
- **Emergency** — instant escalation with parallel notification to all trusted contacts

### 👨‍👩‍👧 Family App
- **LifeCard** — set up your relative's profile: health, meds, contacts, preferences
- **Memory Garden** — see and edit everything Nelson knows about your relative
- **Calendar for reminders** — see all your reminders, past or future

### 🖥️ Operator Dashboard
- **Cost tracker** — GPT Realtime costs per call and per user
- **Open SOS log** — emergency events with timestamps and outcomes
- **Agent health** — failed calls, low-confidence turns, timeout alerts

---

## 🏗️ Architecture

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/86c4b470-c86e-4cf8-9e08-e769fa5e6243" />

---

## 📦 Repo structure

```
nelson/
├─ apps/
│  ├─ family-app/           # Expo (iOS + Android + Web) — family portal
│  ├─ ops-dashboard/        # operator monitoring dashboard
│  ├─ voice-gateway/        # Hono.js - call entrypoint, STT/TTS pipeline
│  └─ api/                  # Hono.js - business logic, auth, jobs, REST
│
├─ packages/
│  ├─ agent-core/           # LLM orchestration, prompt, tool calling
│  ├─ mcp/    # MCP servers
│  ├─ reminders-domain/     # Scheduler, outbound call jobs
│  ├─ api/     # APIs for MCP servers
│  ├─ shared-types/         # Zod schemas
│  ├─ db/                   # MongoDB pool
│
├─ Dockerfile
└─ README.md                ← you are here
```

---

## 🛠️ Tech stack

| Concern | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Language | TypeScript everywhere |
| Mobile + Web App | Expo (React Native) |
| Operator Dashboard | Next.js |
| API | Hono.js |
| Database | MongoDB / custom RAG implementation |
| Telephony | Twilio |
| Agent tool protocol | Model Context Protocol (MCP) |
| Realtime | WebSockets |

---