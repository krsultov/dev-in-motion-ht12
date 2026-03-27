import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { ObjectId } from 'mongodb'
import Twilio from 'twilio'
import { CallUserMemory, type UserMemory } from '../db/src/index'

declare const process: {
  env: Record<string, string | undefined>
  exit: (code?: number) => never
}

type UserMemoryDoc = UserMemory & { _id: ObjectId }

function normalize(doc: UserMemoryDoc) {
  return {
    _id: doc._id.toHexString(),
    phone: doc.phone,
    password: doc.password,
    name: doc.name,
    plan: doc.plan,
    subscription: doc.subscription,
    memories: doc.memories ?? [],
    contacts: doc.contacts ?? [],
    preferences: doc.preferences ?? [],
    medications: doc.medications ?? [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? ''
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? ''
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID ?? ''

function getTwilioClient() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
    throw new Error('Twilio Verify is not configured — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID')
  }
  return Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
}

const app = new Hono()
app.use('*', cors())

app.post('/userData', async (c) => {
  try {
    const collection = await CallUserMemory()
    const t = new Date().toISOString()
    const body = await c.req.json().catch(() => ({}))

    const toInsert: Omit<UserMemory, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string } = {
      phone: '',
      password: '',
      createdAt: t,
      updatedAt: t,
    }

    if (typeof body?.phone === 'string') toInsert.phone = body.phone
    if (typeof body?.password === 'string') toInsert.password = body.password
    if (typeof body?.name === 'string') toInsert.name = body.name
    if (typeof body?.plan === 'string' && (body.plan === 'subscription' || body.plan === 'per-minute')) toInsert.plan = body.plan
    if (typeof body?.subscription === 'boolean') toInsert.subscription = body.subscription
    if (Array.isArray(body?.memories)) toInsert.memories = body.memories
    if (Array.isArray(body?.contacts)) toInsert.contacts = body.contacts
    if (Array.isArray(body?.preferences)) toInsert.preferences = body.preferences
    if (Array.isArray(body?.medications)) toInsert.medications = body.medications

    const result = await collection.insertOne(toInsert)
    const doc = await collection.findOne({ _id: result.insertedId })
    if (!doc) return c.json({ error: 'Failed to create userData' }, 500)

    return c.json(normalize(doc as UserMemoryDoc), 201)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.get('/userMemory/:userId', async (c) => {
  try {
    const userId = decodeURIComponent(c.req.param('userId')).trim()
    if (!userId) return c.json({ error: 'userId is required' }, 400)

    const collection = await CallUserMemory()
    const docs = await collection.find({ phone: userId } as any).project({ _id: 1 }).toArray()
    return c.json(docs.map((d) => ({ _id: (d._id as ObjectId).toHexString() })))
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.get('/userData', async (c) => {
  try {
    const collection = await CallUserMemory()
    const docs = await collection.find().sort({ updatedAt: -1 }).toArray()
    return c.json(docs.map(normalize))
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.get('/userData/:_id', async (c) => {
  try {
    const _id = c.req.param('_id').trim()
    if (!_id) return c.json({ error: '_id is required' }, 400)

    const collection = await CallUserMemory()
    const doc = await collection.findOne({ _id: new ObjectId(_id) } as any)
    if (!doc) return c.json({ error: 'userData not found' }, 404)

    return c.json(normalize(doc as UserMemoryDoc))
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.put('/userData/:_id', async (c) => {
  try {
    const _id = c.req.param('_id').trim()
    if (!_id) return c.json({ error: '_id is required' }, 400)

    const body = await c.req.json().catch(() => ({}))
    const collection = await CallUserMemory()
    const t = new Date().toISOString()

    const $set: Record<string, unknown> = { updatedAt: t }
    if (typeof body?.phone === 'string') $set.phone = body.phone
    if (typeof body?.password === 'string') $set.password = body.password
    if (typeof body?.name === 'string') $set.name = body.name
    if (typeof body?.plan === 'string' && (body.plan === 'subscription' || body.plan === 'per-minute')) $set.plan = body.plan
    if (typeof body?.subscription === 'boolean') $set.subscription = body.subscription
    if (Array.isArray(body?.memories)) $set.memories = body.memories
    if (Array.isArray(body?.contacts)) $set.contacts = body.contacts
    if (Array.isArray(body?.preferences)) $set.preferences = body.preferences
    if (Array.isArray(body?.medications)) $set.medications = body.medications

    const doc = await collection.findOneAndUpdate({ _id: new ObjectId(_id) } as any, { $set }, { returnDocument: 'after' })
    if (!doc) return c.json({ error: 'userData not found' }, 404)

    return c.json(normalize(doc as UserMemoryDoc))
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

// ── OTP via Twilio Verify ─────────────────────────────────────────────────────

app.post('/otp/send', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
    if (!phone) return c.json({ error: 'phone is required' }, 400)

    const client = getTwilioClient()
    await client.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: 'sms' })

    return c.json({ success: true })
  } catch (error) {
    console.error('OTP send error:', error)
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.post('/otp/verify', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
    const code = typeof body?.code === 'string' ? body.code.trim() : ''

    if (!phone || !code) return c.json({ error: 'phone and code are required' }, 400)

    const client = getTwilioClient()
    const check = await client.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code })

    if (check.status !== 'approved') return c.json({ verified: false })

    const collection = await CallUserMemory()
    const doc = await collection.findOne({ phone } as any)

    if (doc) {
      return c.json({ verified: true, user: { name: doc.name ?? 'Family member', phone: doc.phone } })
    } else {
      return c.json({ verified: true, isNewUser: true, user: { name: 'Family member', phone } })
    }
  } catch (error) {
    console.error('OTP verify error:', error)
    return c.json({ error: (error as Error).message }, 500)
  }
})

const PORT = Number(process.env.PORT ?? 3002)
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`userData REST API running at http://localhost:${PORT}`)
})
