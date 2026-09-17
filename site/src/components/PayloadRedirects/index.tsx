import type React from 'react'
import type { Page, Post } from '@/payload-types'

import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { notFound, permanentRedirect } from 'next/navigation'

interface Props {
  disableNotFound?: boolean
  url: string
}

const normalise = (path: string) => {
  const trimmed = path.replace(/\/+$/, '').toLowerCase()
  return trimmed === '' ? '/' : trimmed
}

/**
 * Server-side redirects driven by the Redirects collection. Matches with or
 * without a trailing slash and ignores case, so every old WordPress address
 * resolves. Uses a 308 permanent redirect so search engines carry the old
 * page's standing to the new one.
 */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  const redirects = await getCachedRedirects()()
  const wanted = normalise(url)

  const redirectItem = redirects.find((r) => typeof r.from === 'string' && normalise(r.from) === wanted)

  if (redirectItem) {
    if (redirectItem.to?.url) {
      permanentRedirect(redirectItem.to.url)
    }

    let redirectUrl = ''
    const relationTo = redirectItem.to?.reference?.relationTo
    const prefix = relationTo === 'posts' ? '/news' : ''

    if (typeof redirectItem.to?.reference?.value === 'string' && relationTo) {
      const document = (await getCachedDocument(
        relationTo,
        redirectItem.to.reference.value,
      )()) as Page | Post
      redirectUrl = `${prefix}/${document?.slug}`
    } else if (typeof redirectItem.to?.reference?.value === 'object') {
      redirectUrl = `${prefix}/${redirectItem.to?.reference?.value?.slug}`
    }

    if (redirectUrl && redirectUrl !== '/undefined') permanentRedirect(redirectUrl)
  }

  if (disableNotFound) return null

  notFound()
}
