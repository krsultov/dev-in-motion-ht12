import { MongoClient, type Db, type MongoClientOptions } from "mongodb";

declare const process: {
  env: Record<string, string | undefined>;
};

let mongoClient: MongoClient | undefined;
let mongoClientPromise: Promise<MongoClient> | undefined;

function readMongoUri(): string {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing MONGO_URI environment variable");
  }
  return uri;
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
