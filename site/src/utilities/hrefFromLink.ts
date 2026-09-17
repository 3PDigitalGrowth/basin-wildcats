/**
 * Resolve a CMS link group (internal reference or custom URL) to an href.
 * Collection prefixes match the frontend routes: posts live at /news,
 * products at /shop, pages at the root.
 */
type Ref = {
  relationTo?: string
  value?: { slug?: string | null } | string | number | null
} | null

type LinkLike = {
  type?: 'custom' | 'reference' | null
  url?: string | null
  reference?: Ref
} | null

export const collectionPrefix: Record<string, string> = {
  pages: '',
  posts: '/news',
  products: '/shop',
}

export const hrefFromLink = (link: LinkLike | undefined): string | null => {
  if (!link) return null
  if (link.type === 'reference' && link.reference && typeof link.reference.value === 'object') {
    const slug = link.reference.value?.slug
    if (!slug) return null
    const prefix = collectionPrefix[link.reference.relationTo || 'pages'] ?? ''
    if (link.reference.relationTo === 'pages' && slug === 'home') return '/'
    return `${prefix}/${slug}`
  }
  return link.url || null
}
