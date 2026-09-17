import { getPayload } from 'payload'

import configPromise from '../payload.config'
import { syncInstagram } from '../lib/instagram/sync'

/**
 * One-off / manual run of the Instagram sync outside the cron route.
 * Usage: pnpm payload run src/scripts/sync-instagram.ts
 */
const run = async () => {
  const payload = await getPayload({ config: configPromise })

  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const handle = settings?.instagramHandle || 'thebasin.wildcats'

  payload.logger.info(`Syncing Instagram for @${handle}...`)

  const summary = await syncInstagram({ payload, handle, limit: 12 })

  payload.logger.info(summary, 'Instagram sync finished')

  if (summary.errors.length > 0) {
    console.error('Instagram sync errors:')
    for (const error of summary.errors) console.error(`  - ${error}`)
  }

  await payload.destroy()
}

// Top-level await: `payload run` only awaits the module import itself, so
// without this the process exits as soon as run() returns its (still
// pending) promise, killing the sync mid-flight.
try {
  await run()
  process.exitCode = 0
} catch (err) {
  console.error('Instagram sync script failed:', err)
  process.exitCode = 1
}
