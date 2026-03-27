import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { ObjectId } from 'mongodb'
import { getDb } from '../db/src/index'
import type { MemoryDoc, MemoryEntry, CallEvent, CallEventDoc, StatsOverview } from '@nelson/shared-types'

declare const process: {
  env: Record<string, string | undefined>
  exit: (code?: number) => never
}

let collectionPromise:
  | Promise<ReturnType<ReturnType<Awaited<ReturnType<typeof getDb>>['collection']>>>
  | undefined

function nowIso(): string {
  return new Date().toISOString()
}

function toMemoryEntry(doc: MemoryDoc): MemoryEntry {
  return {
    id: doc._id.toHexString(),
    userId: doc.userId,
    key: doc.key,
    value: doc.value,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

async function getMemoryCollection() {
  if (!collectionPromise) {
    collectionPromise = (async () => {
      const db = await getDb()
      const collection = db.collection<MemoryDoc>(process.env.MEMORIES_COLLECTION ?? 'Memories')
      await collection.createIndex({ userId: 1, key: 1 }, { unique: true })
      return collection
    })() as any
  }
  return collectionPromise!
}

const CALL_EVENTS_COLLECTION = process.env.CALL_EVENTS_COLLECTION ?? 'CallEvents'
const USER_MEMORY_COLLECTION = process.env.USER_MEMORY_COLLECTION ?? 'UserMemory'

let callEventsCollectionPromise:
  | Promise<ReturnType<ReturnType<Awaited<ReturnType<typeof getDb>>['collection']>>>
  | undefined

async function getCallEventsCollection() {
  if (!callEventsCollectionPromise) {
    callEventsCollectionPromise = (async () => {
      const db = await getDb()
      const collection = db.collection<CallEventDoc>(CALL_EVENTS_COLLECTION)
      await collection.createIndex({ startedAt: -1 })
      return collection
    })() as any
  }
  return callEventsCollectionPromise!
}

const app = new Hono()
app.use('*', cors())

app.post('/memories', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : ''
    const key = typeof body?.key === 'string' ? body.key.trim() : ''
    const value = typeof body?.value === 'string' ? body.value : ''

    if (!userId) return c.json({ error: 'userId is required' }, 400)
    if (!key) return c.json({ error: 'key is required' }, 400)

    const collection = await getMemoryCollection()
    const t = nowIso()
    const doc = await (collection as any).findOneAndUpdate(
      { userId, key },
      {
        $set: { value, updatedAt: t },
        $setOnInsert: { userId, key, createdAt: t },
      },
      { upsert: true, returnDocument: 'after' }
    )

    if (!doc) return c.json({ error: 'Failed to create memory' }, 500)
    return c.json(toMemoryEntry(doc), 201)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.get('/memories', async (c) => {
  try {
    const userId = c.req.query('userId')?.trim() ?? ''
    if (!userId) return c.json({ error: 'userId query parameter is required' }, 400)

    const collection = await getMemoryCollection()
    const docs = await (collection as any).find({ userId }).sort({ updatedAt: -1 }).toArray()
    return c.json(docs.map(toMemoryEntry))
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.get('/memories/by-id/:_id', async (c) => {
  try {
    const _id = c.req.param('_id').trim()
    if (!_id) return c.json({ error: '_id is required' }, 400)

    const collection = await getMemoryCollection()
    const doc = await (collection as any).findOne({ _id: new ObjectId(_id) })
    if (!doc) return c.json({ error: 'memory not found' }, 404)
    return c.json(toMemoryEntry(doc))
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.get('/memories/:key', async (c) => {
  try {
    const key = c.req.param('key').trim()
    const userId = c.req.query('userId')?.trim() ?? ''
    if (!key) return c.json({ error: 'key is required' }, 400)

    const filter: Record<string, string> = { key }
    if (userId) filter.userId = userId

    const collection = await getMemoryCollection()
    const doc = await (collection as any).findOne(filter)
    if (!doc) return c.json({ error: 'memory not found' }, 404)
    return c.json(toMemoryEntry(doc))
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.put('/memories/:key', async (c) => {
  try {
    const key = c.req.param('key').trim()
    const body = await c.req.json().catch(() => ({}))
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : ''
    const value = typeof body?.value === 'string' ? body.value : ''

    if (!key) return c.json({ error: 'key is required' }, 400)

    const filter: Record<string, string> = { key }
    if (userId) filter.userId = userId

    const collection = await getMemoryCollection()
    const doc = await (collection as any).findOneAndUpdate(
      filter,
      { $set: { value, updatedAt: nowIso() } },
      { returnDocument: 'after' }
    )

    if (!doc) return c.json({ error: 'memory not found' }, 404)
    return c.json(toMemoryEntry(doc))
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.delete('/memories/:key', async (c) => {
  try {
    const key = c.req.param('key').trim()
    const userId = c.req.query('userId')?.trim() ?? ''
    if (!key) return c.json({ error: 'key is required' }, 400)

    const filter: Record<string, string> = { key }
    if (userId) filter.userId = userId

    const collection = await getMemoryCollection()
    const result = await (collection as any).deleteOne(filter)
    return c.json({ deletedCount: result.deletedCount ?? 0 })
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

// ── Call Events ───────────────────────────────────────────────────────────────

app.post('/call-events', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : ''
    const type = body?.type === 'outbound' ? 'outbound' : 'inbound'
    const startedAt = typeof body?.startedAt === 'string' ? body.startedAt : nowIso()
    const reminderId = typeof body?.reminderId === 'string' ? body.reminderId : undefined

    if (!userId) return c.json({ error: 'userId is required' }, 400)

    const doc: CallEvent = { userId, type, startedAt }
    if (reminderId) doc.reminderId = reminderId

    const collection = await getCallEventsCollection()
    const result = await (collection as any).insertOne(doc)
    return c.json({ _id: result.insertedId.toHexString() }, 201)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.put('/call-events/:id', async (c) => {
  try {
    const id = c.req.param('id').trim()
    if (!id) return c.json({ error: 'id is required' }, 400)

    const body = await c.req.json().catch(() => ({}))
    const $set: Record<string, unknown> = {}
    if (typeof body?.endedAt === 'string') $set.endedAt = body.endedAt
    if (typeof body?.durationSec === 'number') $set.durationSec = body.durationSec

    const collection = await getCallEventsCollection()
    await (collection as any).updateOne({ _id: new ObjectId(id) }, { $set })
    return c.json({ ok: true })
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.get('/stats/overview', async (c) => {
  try {
    const db = await getDb()
    const userMemoryCol = db.collection(USER_MEMORY_COLLECTION)
    const callEventsCol = await getCallEventsCollection()

    const [totalUsers, usersByMonthAgg, totalCalls, callsByMonthAgg, avgDurationAgg, planAgg] =
      await Promise.all([
        userMemoryCol.countDocuments(),
        userMemoryCol
          .aggregate([
            { $addFields: { parsedDate: { $dateFromString: { dateString: '$createdAt', onError: null } } } },
            { $match: { parsedDate: { $ne: null } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$parsedDate' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
        (callEventsCol as any).countDocuments(),
        (callEventsCol as any)
          .aggregate([
            { $addFields: { parsedDate: { $dateFromString: { dateString: '$startedAt', onError: null } } } },
            { $match: { parsedDate: { $ne: null } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$parsedDate' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
        (callEventsCol as any)
          .aggregate([
            { $match: { durationSec: { $exists: true, $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: '$durationSec' } } },
          ])
          .toArray(),
        userMemoryCol
          .aggregate([
            {
              $group: {
                _id: null,
                subscription: { $sum: { $cond: [{ $eq: ['$plan', 'subscription'] }, 1, 0] } },
                perMinute: { $sum: { $cond: [{ $or: [{ $eq: ['$plan', 'per-minute'] }, { $not: ['$plan'] }] }, 1, 0] } },
              },
            },
          ])
          .toArray(),
      ])

    const stats: StatsOverview = {
      totalUsers,
      usersByMonth: usersByMonthAgg.map((r: any) => ({ month: r._id, count: r.count })),
      totalCalls,
      callsByMonth: callsByMonthAgg.map((r: any) => ({ month: r._id, count: r.count })),
      avgCallDurationSec: avgDurationAgg[0]?.avg ?? 0,
      planDistribution: {
        subscription: planAgg[0]?.subscription ?? 0,
        perMinute: planAgg[0]?.perMinute ?? 0,
      },
    }

    return c.json(stats)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

const PORT = Number(process.env.PORT ?? 3001)
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Memory REST API running at http://localhost:${PORT}`)
})
