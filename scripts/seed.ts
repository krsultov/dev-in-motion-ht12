/**
 * Seed script — populates MongoDB with demo users, memories, reminders & call events.
 *
 * Usage:  npx tsx scripts/seed.ts
 *
 * Set MONGO_URI in the root .env or as an env var.
 * Add --clean flag to wipe existing seed data first.
 */

import { MongoClient, ObjectId } from "mongodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env ────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env");

try {
  const contents = readFileSync(envPath, "utf-8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Missing MONGO_URI");
  process.exit(1);
}

const CLEAN = process.argv.includes("--clean");

// ── Helpers ──────────────────────────────────────────────────────────────────

const id = () => new ObjectId().toHexString();
const iso = (d: Date) => d.toISOString();
const monthsAgo = (n: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(Math.floor(Math.random() * 20) + 1);
  d.setHours(Math.floor(Math.random() * 12) + 8);
  return d;
};

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ── Seed Users ───────────────────────────────────────────────────────────────

const users = [
  {
    phone: "+359888100001",
    password: "demo1234",
    name: "Мария Иванова",
    plan: "subscription" as const,
    memories: [
      "Обича да слуша народна музика сутрин",
      "Има котка на име Мица",
      "Любимото й ястие е баница със сирене",
    ],
    contacts: [
      { id: id(), name: "Иван Иванов", role: "Син", phone: "+359888200001" },
      { id: id(), name: "Д-р Петрова", role: "Личен лекар", phone: "+359888300001" },
    ],
    preferences: [
      { id: id(), label: "Език", value: "Български" },
      { id: id(), label: "Сила на звука", value: "8" },
    ],
    medications: [
      { id: id(), name: "Amlodipine 5mg", schedule: "Сутрин, 08:00" },
      { id: id(), name: "Metformin 500mg", schedule: "Сутрин и вечер, 08:00 / 20:00" },
      { id: id(), name: "Aspirin 100mg", schedule: "Обяд, 12:00" },
    ],
    createdMonthsAgo: 5,
  },
  {
    phone: "+359888100002",
    password: "demo1234",
    name: "Георги Петров",
    plan: "per-minute" as const,
    memories: [
      "Бивш учител по математика",
      "Играе шах всеки ден в парка",
      "Внучката му Ана е на 7 години",
    ],
    contacts: [
      { id: id(), name: "Петър Петров", role: "Син", phone: "+359888200002" },
      { id: id(), name: "Елена Петрова", role: "Дъщеря", phone: "+359888200003" },
      { id: id(), name: "Д-р Димитров", role: "Кардиолог", phone: "+359888300002" },
    ],
    preferences: [
      { id: id(), label: "Език", value: "Български" },
      { id: id(), label: "Сила на звука", value: "7" },
    ],
    medications: [
      { id: id(), name: "Bisoprolol 2.5mg", schedule: "Сутрин, 07:30" },
      { id: id(), name: "Atorvastatin 20mg", schedule: "Вечер, 21:00" },
    ],
    createdMonthsAgo: 5,
  },
  {
    phone: "+359888100003",
    password: "demo1234",
    name: "Елка Стоянова",
    plan: "subscription" as const,
    memories: [
      "Отглежда рози и домати в градината",
      "Обича да готви и често прави туршия",
      "Слуша радио всяка сутрин от 6:00",
    ],
    contacts: [
      { id: id(), name: "Стоян Стоянов", role: "Съпруг", phone: "+359888200004" },
      { id: id(), name: "Даниела Стоянова", role: "Дъщеря", phone: "+359888200005" },
    ],
    preferences: [
      { id: id(), label: "Език", value: "Български" },
      { id: id(), label: "Сила на звука", value: "9" },
      { id: id(), label: "Време за обаждане", value: "Сутрин" },
    ],
    medications: [
      { id: id(), name: "Levothyroxine 50mcg", schedule: "Сутрин на празен стомах, 06:30" },
      { id: id(), name: "Calcium + Vitamin D", schedule: "Обяд, 12:00" },
    ],
    createdMonthsAgo: 4,
  },
  {
    phone: "+359888100004",
    password: "demo1234",
    name: "Димитър Колев",
    plan: "subscription" as const,
    memories: [
      "Пенсиониран инженер от ВМЗ Сопот",
      "Има куче — немска овчарка на име Рекс",
      "Обича да гледа новините по БНТ в 20:00",
      "Всеки петък ходи на пазар в центъра",
    ],
    contacts: [
      { id: id(), name: "Калина Колева", role: "Дъщеря", phone: "+359888200006" },
      { id: id(), name: "Д-р Василева", role: "Ендокринолог", phone: "+359888300003" },
      { id: id(), name: "Аптека Здраве", role: "Аптека", phone: "+359888300004" },
    ],
    preferences: [
      { id: id(), label: "Език", value: "Български" },
      { id: id(), label: "Сила на звука", value: "10" },
    ],
    medications: [
      { id: id(), name: "Insulin Lantus", schedule: "Вечер, 22:00" },
      { id: id(), name: "Metformin 1000mg", schedule: "Сутрин и вечер" },
      { id: id(), name: "Lisinopril 10mg", schedule: "Сутрин, 08:00" },
      { id: id(), name: "Очни капки Timolol", schedule: "2 пъти дневно" },
    ],
    createdMonthsAgo: 4,
  },
  {
    phone: "+359888100005",
    password: "demo1234",
    name: "Пенка Тодорова",
    plan: "per-minute" as const,
    memories: [
      "Живее сама в село Равнец",
      "Обича да плете и прави подаръци за внуците",
      "Има 4 внука — Мартин, Ивайло, Ния и Стефан",
    ],
    contacts: [
      { id: id(), name: "Тодор Тодоров", role: "Син", phone: "+359888200007" },
      { id: id(), name: "Кмет на село Равнец", role: "Кмет", phone: "+359888200008" },
    ],
    preferences: [
      { id: id(), label: "Език", value: "Български" },
      { id: id(), label: "Сила на звука", value: "10" },
    ],
    medications: [
      { id: id(), name: "Nifedipine 30mg", schedule: "Сутрин, 08:00" },
    ],
    createdMonthsAgo: 3,
  },
  {
    phone: "+359888100006",
    password: "demo1234",
    name: "Стефан Николов",
    plan: "subscription" as const,
    memories: [
      "Пенсиониран военен лекар",
      "Свири на акордеон",
      "Всяка неделя се обажда на брат си в Германия",
    ],
    contacts: [
      { id: id(), name: "Николай Николов", role: "Брат", phone: "+4915112345678" },
      { id: id(), name: "Мария Николова", role: "Съпруга", phone: "+359888200009" },
      { id: id(), name: "Д-р Атанасов", role: "Невролог", phone: "+359888300005" },
    ],
    preferences: [
      { id: id(), label: "Език", value: "Български" },
      { id: id(), label: "Сила на звука", value: "6" },
    ],
    medications: [
      { id: id(), name: "Levodopa 250mg", schedule: "3 пъти дневно" },
      { id: id(), name: "Omega-3", schedule: "Сутрин, 08:00" },
    ],
    createdMonthsAgo: 3,
  },
  {
    phone: "+359888100007",
    password: "demo1234",
    name: "Йорданка Маринова",
    plan: "per-minute" as const,
    memories: [
      "Бивша библиотекарка",
      "Чете поне една книга на седмица",
      "Обича да разхожда в парка следобед",
    ],
    contacts: [
      { id: id(), name: "Марин Маринов", role: "Съпруг", phone: "+359888200010" },
      { id: id(), name: "Д-р Георгиева", role: "Офталмолог", phone: "+359888300006" },
    ],
    preferences: [
      { id: id(), label: "Език", value: "Български" },
      { id: id(), label: "Сила на звука", value: "8" },
    ],
    medications: [
      { id: id(), name: "Donepezil 5mg", schedule: "Вечер, 20:00" },
      { id: id(), name: "Vitamin B12", schedule: "Сутрин, 08:00" },
    ],
    createdMonthsAgo: 2,
  },
  {
    phone: "+359888100008",
    password: "demo1234",
    name: "Васил Христов",
    plan: "subscription" as const,
    memories: [
      "Живее в Пловдив, квартал Тракия",
      "Пенсиониран шофьор на автобус",
      "Обича да гледа футбол — фен на Ботев Пловдив",
    ],
    contacts: [
      { id: id(), name: "Христо Христов", role: "Син", phone: "+359888200011" },
      { id: id(), name: "Д-р Кирилов", role: "Ортопед", phone: "+359888300007" },
    ],
    preferences: [
      { id: id(), label: "Език", value: "Български" },
      { id: id(), label: "Сила на звука", value: "9" },
    ],
    medications: [
      { id: id(), name: "Ibuprofen 400mg", schedule: "При нужда, до 3 пъти дневно" },
      { id: id(), name: "Pantoprazole 20mg", schedule: "Сутрин на празен стомах" },
      { id: id(), name: "Glucosamine", schedule: "Сутрин и вечер" },
    ],
    createdMonthsAgo: 2,
  },
  {
    phone: "+359888100009",
    password: "demo1234",
    name: "Радка Благоева",
    plan: "per-minute" as const,
    memories: [
      "Пенсионирана медицинска сестра",
      "Живее с дъщеря си в Бургас",
      "Обича да готви — специалитетът й е шопска салата",
    ],
    contacts: [
      { id: id(), name: "Благой Благоев", role: "Съпруг (починал)", phone: "" },
      { id: id(), name: "Силвия Благоева", role: "Дъщеря", phone: "+359888200012" },
    ],
    preferences: [
      { id: id(), label: "Език", value: "Български" },
      { id: id(), label: "Сила на звука", value: "7" },
    ],
    medications: [
      { id: id(), name: "Ramipril 5mg", schedule: "Сутрин, 07:00" },
      { id: id(), name: "Simvastatin 20mg", schedule: "Вечер, 21:00" },
    ],
    createdMonthsAgo: 1,
  },
  {
    phone: "+359888100010",
    password: "demo1234",
    name: "Тодор Ангелов",
    plan: "subscription" as const,
    memories: [
      "Пенсиониран миньор от Перник",
      "Отглежда пчели — има 12 кошера",
      "Обича ракия от собствено производство",
    ],
    contacts: [
      { id: id(), name: "Ангел Ангелов", role: "Син", phone: "+359888200013" },
      { id: id(), name: "Росица Ангелова", role: "Снаха", phone: "+359888200014" },
      { id: id(), name: "Д-р Стоев", role: "Пулмолог", phone: "+359888300008" },
    ],
    preferences: [
      { id: id(), label: "Език", value: "Български" },
      { id: id(), label: "Сила на звука", value: "10" },
    ],
    medications: [
      { id: id(), name: "Salbutamol инхалатор", schedule: "При нужда" },
      { id: id(), name: "Theophylline 200mg", schedule: "Сутрин и вечер" },
    ],
    createdMonthsAgo: 1,
  },
  {
    phone: "+359888100011",
    password: "demo1234",
    name: "Невена Добрева",
    plan: "per-minute" as const,
    memories: [
      "Бивша учителка по български език",
      "Пише стихове в свободното си време",
      "Обича класическа музика — Вивалди е любимият й",
    ],
    contacts: [
      { id: id(), name: "Добри Добрев", role: "Съпруг", phone: "+359888200015" },
      { id: id(), name: "Д-р Попова", role: "Психиатър", phone: "+359888300009" },
    ],
    preferences: [
      { id: id(), label: "Език", value: "Български" },
      { id: id(), label: "Сила на звука", value: "5" },
    ],
    medications: [
      { id: id(), name: "Sertraline 50mg", schedule: "Сутрин, 08:00" },
    ],
    createdMonthsAgo: 0,
  },
  {
    phone: "+359888100012",
    password: "demo1234",
    name: "Крум Султов",
    plan: "subscription" as const,
    memories: [
      "Студент по компютърни науки",
      "Създател на Нелсон — гласовият асистент",
      "Обича да програмира до късно",
    ],
    contacts: [
      { id: id(), name: "Мама", role: "Майка", phone: "+359888200016" },
      { id: id(), name: "Тим Нелсон", role: "Екип", phone: "+359888200017" },
    ],
    preferences: [
      { id: id(), label: "Език", value: "Български" },
      { id: id(), label: "Сила на звука", value: "7" },
    ],
    medications: [],
    createdMonthsAgo: 0,
  },
];

// ── Seed Memories (key-value) ────────────────────────────────────────────────

function buildMemoryDocs(phone: string) {
  const now = iso(new Date());
  const entries: Record<string, string>[] = [];

  const userDef = users.find((u) => u.phone === phone);
  if (!userDef) return entries;

  // Turn user.memories strings into key-value pairs
  userDef.memories.forEach((m, i) => {
    entries.push({
      userId: phone,
      key: `memory_${i + 1}`,
      value: m,
      createdAt: now,
      updatedAt: now,
    });
  });

  return entries;
}

// ── Seed Reminders ───────────────────────────────────────────────────────────

type SeedReminder = {
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  cron?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

function buildReminders(): SeedReminder[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const reminders: SeedReminder[] = [
    {
      userId: "+359888100001",
      title: "Вземи Amlodipine",
      startTime: iso(tomorrow),
      endTime: iso(nextMonth),
      cron: "0 8 * * *",
      description: "Amlodipine 5mg — сутрешна доза",
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      userId: "+359888100001",
      title: "Визита при Д-р Петрова",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 10, 0).toISOString(),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 11, 0).toISOString(),
      description: "Годишен преглед при личния лекар",
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      userId: "+359888100002",
      title: "Шах в парка",
      startTime: iso(tomorrow),
      endTime: iso(nextMonth),
      cron: "0 10 * * *",
      description: "Среща за шах с Коста в парка",
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      userId: "+359888100003",
      title: "Полей розите",
      startTime: iso(tomorrow),
      endTime: iso(nextMonth),
      cron: "0 7 * * 1,3,5",
      description: "Поливане на розите в градината",
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      userId: "+359888100004",
      title: "Инсулин Лантус",
      startTime: iso(tomorrow),
      endTime: iso(nextMonth),
      cron: "0 22 * * *",
      description: "Вечерна доза инсулин",
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      userId: "+359888100004",
      title: "Пазар в центъра",
      startTime: iso(tomorrow),
      endTime: iso(nextMonth),
      cron: "0 9 * * 5",
      description: "Петъчен пазар за зеленчуци",
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      userId: "+359888100005",
      title: "Обади се на Тодор",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 18, 0).toISOString(),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 19, 0).toISOString(),
      description: "Седмично обаждане до сина",
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      userId: "+359888100006",
      title: "Levodopa — 3 пъти",
      startTime: iso(tomorrow),
      endTime: iso(nextMonth),
      cron: "0 8,14,20 * * *",
      description: "Levodopa 250mg — три пъти дневно",
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      userId: "+359888100008",
      title: "Мач на Ботев",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 18, 30).toISOString(),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 20, 30).toISOString(),
      description: "Ботев Пловдив — домакински мач",
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      userId: "+359888100010",
      title: "Провери кошерите",
      startTime: iso(tomorrow),
      endTime: iso(nextMonth),
      cron: "0 9 * * 1,4",
      description: "Проверка на пчелните кошери",
      createdAt: iso(now),
      updatedAt: iso(now),
    },
  ];

  return reminders;
}

// ── Seed Call Events ─────────────────────────────────────────────────────────

function buildCallEvents() {
  const events: {
    userId: string;
    type: "inbound" | "outbound";
    startedAt: string;
    endedAt: string;
    durationSec: number;
    reminderId?: string;
  }[] = [];

  // Generate call history spread over the last 5 months
  for (const user of users) {
    const userCreated = monthsAgo(user.createdMonthsAgo);
    const monthsSinceCreation = user.createdMonthsAgo;

    // Each user makes 3-8 calls per month since joining
    for (let m = monthsSinceCreation; m >= 0; m--) {
      const callsThisMonth = randomBetween(3, 8);
      for (let c = 0; c < callsThisMonth; c++) {
        const callDate = new Date(userCreated);
        callDate.setMonth(callDate.getMonth() + (monthsSinceCreation - m));
        callDate.setDate(randomBetween(1, 28));
        callDate.setHours(randomBetween(7, 21));
        callDate.setMinutes(randomBetween(0, 59));

        // Skip future dates
        if (callDate > new Date()) continue;

        const durationSec = randomBetween(30, 480); // 30s to 8min
        const endDate = new Date(callDate.getTime() + durationSec * 1000);

        const type = Math.random() > 0.3 ? "inbound" : "outbound";

        events.push({
          userId: user.phone,
          type,
          startedAt: iso(callDate),
          endedAt: iso(endDate),
          durationSec,
        });
      }
    }
  }

  return events;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const client = new MongoClient(MONGO_URI!);
  await client.connect();
  const db = client.db();

  const userMemoryCol = db.collection(process.env.USER_MEMORY_COLLECTION ?? "UserMemory");
  const memoriesCol = db.collection(process.env.MEMORIES_COLLECTION ?? "Memories");
  const remindersCol = db.collection(process.env.REMINDERS_COLLECTION ?? "RemindersMemory");
  const callEventsCol = db.collection(process.env.CALL_EVENTS_COLLECTION ?? "CallEvents");

  const seedPhones = users.map((u) => u.phone);

  if (CLEAN) {
    console.log("Cleaning existing seed data...");
    await userMemoryCol.deleteMany({ phone: { $in: seedPhones } });
    await memoriesCol.deleteMany({ userId: { $in: seedPhones } });
    await remindersCol.deleteMany({ userId: { $in: seedPhones } });
    await callEventsCol.deleteMany({ userId: { $in: seedPhones } });
    console.log("Cleaned.");
  }

  // Insert users
  const userDocs = users.map((u) => {
    const created = monthsAgo(u.createdMonthsAgo);
    return {
      phone: u.phone,
      password: u.password,
      name: u.name,
      plan: u.plan,
      subscription: u.plan === "subscription",
      memories: u.memories,
      contacts: u.contacts,
      preferences: u.preferences,
      medications: u.medications,
      createdAt: iso(created),
      updatedAt: iso(new Date()),
    };
  });

  // Upsert users (skip duplicates)
  let usersInserted = 0;
  for (const doc of userDocs) {
    const result = await userMemoryCol.updateOne(
      { phone: doc.phone },
      { $setOnInsert: doc },
      { upsert: true }
    );
    if (result.upsertedCount > 0) usersInserted++;
  }
  console.log(`Users: ${usersInserted} inserted (${userDocs.length - usersInserted} already existed)`);

  // Insert key-value memories
  const allMemoryDocs = users.flatMap((u) => buildMemoryDocs(u.phone));
  let memoriesInserted = 0;
  for (const doc of allMemoryDocs) {
    const result = await memoriesCol.updateOne(
      { userId: doc.userId, key: doc.key },
      { $setOnInsert: doc },
      { upsert: true }
    );
    if (result.upsertedCount > 0) memoriesInserted++;
  }
  console.log(`Memories: ${memoriesInserted} inserted`);

  // Insert reminders
  const reminderDocs = buildReminders();
  let remindersInserted = 0;
  for (const doc of reminderDocs) {
    const exists = await remindersCol.findOne({ userId: doc.userId, title: doc.title });
    if (!exists) {
      await remindersCol.insertOne(doc);
      remindersInserted++;
    }
  }
  console.log(`Reminders: ${remindersInserted} inserted`);

  // Insert call events
  const callEventDocs = buildCallEvents();
  // Only insert if we don't already have seed call events
  const existingCallCount = await callEventsCol.countDocuments({
    userId: { $in: seedPhones },
  });
  if (existingCallCount === 0) {
    await callEventsCol.insertMany(callEventDocs);
    console.log(`Call events: ${callEventDocs.length} inserted`);
  } else {
    console.log(`Call events: skipped (${existingCallCount} already exist)`);
  }

  await client.close();
  console.log("\nSeed complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
