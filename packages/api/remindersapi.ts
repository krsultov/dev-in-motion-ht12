import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import CronExpressionParser from 'cron-parser'
import { ObjectId, type Collection, type WithId } from 'mongodb'
import { getDb } from '../db/src/index'
import {
  cancelReminderAgendaJobs,
  scheduleReminderAgendaJobs,
  syncAllReminderAgendaJobs,
} from './remindersAgenda'

type ReminderStored = {
  userId: string
  title: string
  startTime: string
  endTime: string
  cron?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type ReminderDoc = WithId<ReminderStored>

declare const process: {
  env: Record<string, string | undefined>
  exit: (code?: number) => never
}

function nowIso(): string {
  return new Date().toISOString()
}

function isIsoDateTime(value: unknown): value is string {
  if (typeof value !== 'string') return false
  return !Number.isNaN(new Date(value).getTime())
}

function normalize(doc: ReminderDoc) {
  return {
    _id: doc._id.toHexString(),
    userId: doc.userId,
    title: doc.title,
    startTime: doc.startTime,
    endTime: doc.endTime,
    cron: doc.cron,
    description: doc.description,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

function assertValidCron(expr: string): void {
  try {
    CronExpressionParser.parse(expr.trim())
  } catch {
    throw new Error('Invalid cron expression')
  }
}

let collectionPromise: Promise<Collection<ReminderStored>> | undefined

async function getRemindersCollection(): Promise<Collection<ReminderStored>> {
  if (!collectionPromise) {
    collectionPromise = (async () => {
      const db = await getDb()
      const collection = db.collection<ReminderStored>(process.env.REMINDERS_COLLECTION ?? 'RemindersMemory')
      await collection.createIndex({ startTime: 1 }, { unique: false })
      return collection
    })()
  }
  return collectionPromise
}

const app = new Hono()
app.use('*', cors())

app.get('/reminders', async (c) => {
  try {
    const userId = c.req.query('userId')?.trim() ?? ''
    const filter: Record<string, string> = {}
    if (userId) filter.userId = userId

    const collection = await getRemindersCollection()
    const docs = await collection.find(filter).sort({ startTime: 1 }).toArray()
    return c.json(docs.map(normalize))
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.get('/reminders/:_id', async (c) => {
  try {
    const _id = c.req.param('_id').trim()
    if (!_id) return c.json({ error: '_id is required' }, 400)

    const collection = await getRemindersCollection()
    const doc = await collection.findOne({ _id: new ObjectId(_id) })
    if (!doc) return c.json({ error: 'reminder not found' }, 404)
    return c.json(normalize(doc))
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.post('/reminders', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : ''
    const title = typeof body?.title === 'string' ? body.title.trim() : ''
    const startTime = body?.startTime
    const endTime = body?.endTime
    const description = typeof body?.description === 'string' ? body.description : undefined
    const cronRaw = body?.cron
    let cron: string | undefined

    if (typeof cronRaw === 'string' && cronRaw.trim() !== '') {
      try {
        assertValidCron(cronRaw)
        cron = cronRaw.trim()
      } catch (e) {
        return c.json({ error: (e as Error).message }, 400)
      }
    }

    if (!userId) return c.json({ error: 'userId is required' }, 400)
    if (!title) return c.json({ error: 'title is required' }, 400)
    if (!isIsoDateTime(startTime) || !isIsoDateTime(endTime)) {
      return c.json({ error: 'startTime and endTime must be valid ISO date-time strings' }, 400)
    }

    const t = nowIso()
    const collection = await getRemindersCollection()

    const doc = await collection.insertOne({
      userId,
      title,
      startTime,
      endTime,
      ...(cron !== undefined ? { cron } : {}),
      ...(description !== undefined ? { description } : {}),
      createdAt: t,
      updatedAt: t,
    })

    const created = await collection.findOne({ _id: doc.insertedId })
    if (!created) return c.json({ error: 'Failed to create reminder' }, 500)

    try {
      await scheduleReminderAgendaJobs(created)
    } catch (e) {
      console.error('[Agenda] schedule after create failed:', e)
    }

    return c.json(normalize(created), 201)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.put('/reminders/:_id', async (c) => {
  try {
    const _id = c.req.param('_id').trim()
    if (!_id) return c.json({ error: '_id is required' }, 400)

    const body = await c.req.json().catch(() => ({}))
    const patch: Record<string, unknown> = {}
    const unset: Record<string, 1> = {}

    if (typeof body?.title === 'string') patch.title = body.title.trim()
    if (typeof body?.description === 'string') patch.description = body.description
    if (isIsoDateTime(body?.startTime)) patch.startTime = body.startTime
    if (isIsoDateTime(body?.endTime)) patch.endTime = body.endTime
    if (body?.cron === null || body?.cron === '') {
      unset.cron = 1
    } else if (typeof body?.cron === 'string' && body.cron.trim() !== '') {
      try {
        assertValidCron(body.cron)
        patch.cron = body.cron.trim()
      } catch (e) {
        return c.json({ error: (e as Error).message }, 400)
      }
    }
    patch.updatedAt = nowIso()

    const collection = await getRemindersCollection()
    const update: Record<string, unknown> = { $set: patch }
    if (Object.keys(unset).length > 0) update.$unset = unset

    const doc = await collection.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      update,
      { returnDocument: 'after' }
    )

    if (!doc) return c.json({ error: 'reminder not found' }, 404)

    try {
      await scheduleReminderAgendaJobs(doc)
    } catch (e) {
      console.error('[Agenda] schedule after update failed:', e)
    }

    return c.json(normalize(doc))
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.delete('/reminders/:_id', async (c) => {
  try {
    const _id = c.req.param('_id').trim()
    if (!_id) return c.json({ error: '_id is required' }, 400)

    try {
      await cancelReminderAgendaJobs(_id)
    } catch (e) {
      console.error('[Agenda] cancel before delete failed:', e)
    }

    const collection = await getRemindersCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(_id) })
    return c.json({ deletedCount: result.deletedCount ?? 0 })
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

const PORT = Number(process.env.REMINDERS_API_PORT ?? 3004)
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Reminders REST API running at http://localhost:${PORT}`)
  void (async () => {
    try {
      const collection = await getRemindersCollection()
      const docs = await collection.find({}).toArray()
      await syncAllReminderAgendaJobs(docs)
      console.log(`[Agenda] Synced ${docs.length} reminder job(s) (Mongo collection: ${process.env.AGENDA_JOBS_COLLECTION ?? 'agendaJobs'})`)
    } catch (e) {
      console.error('[Agenda] Startup sync failed:', e)
    }
  })()
})
