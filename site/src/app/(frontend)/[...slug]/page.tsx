import React from 'react'

import { PayloadRedirects } from '@/components/PayloadRedirects'

/**
 * Catch-all for nested paths. Nothing on the new site lives more than one
 * segment deep except /news and /shop (which have their own routes), so any
 * other nested URL is an old WordPress address: look it up in Redirects,
 * send a permanent redirect, or 404.
 */
type Args = {
  params: Promise<{ slug?: string[] }>
}

export default async function CatchAll({ params: paramsPromise }: Args) {
  const { slug = [] } = await paramsPromise
  const url = '/' + slug.map((s) => decodeURIComponent(s)).join('/')
  return <PayloadRedirects url={url} />
}
