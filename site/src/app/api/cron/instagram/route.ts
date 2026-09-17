import type { PayloadRequest } from 'payload'

import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import configPromise from '@payload-config'

import { syncInstagram } from '@/lib/instagram/sync'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const DEFAULT_HANDLE = 'thebasin.wildcats'

/**
 * Refreshes the Instagram cache. Vercel Cron hits this with
 * `Authorization: Bearer <CRON_SECRET>` on the schedule in vercel.json; a
 * logged-in admin can also trigger it by hand from a browser tab.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const payload = await getPayload({ config: configPromise })

  const secret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  const hasValidSecret = Boolean(secret) && authHeader === `Bearer ${secret}`

  if (!hasValidSecret) {
    let isAdmin = false
    try {
      const { user } = await payload.auth({
        req: req as unknown as PayloadRequest,
        headers: req.headers,
      })
      isAdmin = Boolean(user?.roles?.includes('admin'))
    } catch (err) {
      payload.logger.error({ err }, 'Error verifying admin session for Instagram cron')
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
  }

  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const handle = settings?.instagramHandle || DEFAULT_HANDLE

  const summary = await syncInstagram({ payload, handle, limit: 12 })

  revalidatePath('/')
  revalidatePath('/social')
  revalidatePath('/gallery')

  return NextResponse.json({ handle, ...summary })
}
