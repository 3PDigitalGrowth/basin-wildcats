import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Ops helper: clear cached data after a script writes directly to the
 * database (seeds, migrations). Guarded by CRON_SECRET.
 *
 *   GET /api/revalidate?tag=redirects
 *   GET /api/revalidate?path=/policies
 *   GET /api/revalidate?all=1   (redirects, globals, homepage)
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tag = searchParams.get('tag')
  const path = searchParams.get('path')
  const all = searchParams.get('all')
  const done: string[] = []

  const tags = all
    ? ['redirects', 'global_header', 'global_footer', 'global_site-settings', 'pages-sitemap', 'news-sitemap']
    : tag
      ? [tag]
      : []

  for (const t of tags) {
    revalidateTag(t, 'max')
    done.push(`tag:${t}`)
  }
  if (path) {
    revalidatePath(path)
    done.push(`path:${path}`)
  }
  if (all) {
    revalidatePath('/', 'layout')
    done.push('path:/ (layout)')
  }

  return NextResponse.json({ revalidated: done, at: new Date().toISOString() })
}
