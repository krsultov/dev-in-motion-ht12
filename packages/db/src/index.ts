import { MongoClient, type Db, type MongoClientOptions, type Collection } from "mongodb";
import type { UserMemory } from "@nelson/shared-types";

export type { UserMemory };

declare const process: {
  env: Record<string, string | undefined>;
};

let mongoClient: MongoClient | undefined;
let mongoClientPromise: Promise<MongoClient> | undefined;
let envLoaded = false;

function readMongoUri(): string {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing MONGO_URI environment variable");
  }
  return uri;
}

async function loadRootEnvIfNeeded() {
  if (envLoaded) return;
  envLoaded = true;

  if (process.env.MONGO_URI) return;

  try {
    const { readFileSync } = await import("fs");
    const { dirname, resolve } = await import("path");
    const { fileURLToPath } = await import("url");

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const envPath = resolve(__dirname, "..", "..", "..", ".env");

    const contents = readFileSync(envPath, "utf-8");
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;

      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^[\"']|[\"']$/g, "");

      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }catch {}
}

function getPoolOptions() {
  const env = process.env;
  const readNumber = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  };

  return {
    maxPoolSize: readNumber(env.MONGO_MAX_POOL_SIZE, 20),
    minPoolSize: readNumber(env.MONGO_MIN_POOL_SIZE, 2),
    maxConnecting: readNumber(env.MONGO_MAX_CONNECTING, 5),
    maxIdleTimeMS: readNumber(env.MONGO_MAX_IDLE_MS, 30_000),
  };
}

export async function getMongoClient(): Promise<MongoClient> {
  if (mongoClient) {
    return mongoClient;
  }

  if (!mongoClientPromise) {
    await loadRootEnvIfNeeded();
    const client = new MongoClient(readMongoUri(), getPoolOptions() as MongoClientOptions);
    mongoClientPromise = client.connect().then(() => {
      mongoClient = client;
      return client;
    });
  }

  return mongoClientPromise;
}

export async function getDb(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  return dbName ? client.db(dbName) : client.db();
}

export async function closeMongoClient(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
  } else if (mongoClientPromise) {
    const connectedClient = await mongoClientPromise;
    await connectedClient.close();
  }

  mongoClient = undefined;
  mongoClientPromise = undefined;
}

export const USER_MEMORY_COLLECTION = "UserMemory";



let userMemoryCollectionPromise: Promise<Collection<UserMemory>> | undefined;

export async function CallUserMemory(): Promise<Collection<UserMemory>> {
  if (!userMemoryCollectionPromise) {
    userMemoryCollectionPromise = (async () => {
      const db = await getDb();
      const collection = db.collection<UserMemory>(USER_MEMORY_COLLECTION);
      return collection;
    })();
  }

  return userMemoryCollectionPromise;
}
