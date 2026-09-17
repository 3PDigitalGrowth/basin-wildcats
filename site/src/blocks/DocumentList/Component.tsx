import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Document, DocumentListBlock as Props } from '@/payload-types'
import { documentCategories } from '@/collections/Documents'

const labelFor = (value?: string | null) =>
  documentCategories.find((c) => c.value === value)?.label || value || ''

const typeLabel = (mime?: string | null) => {
  if (!mime) return 'File'
  if (mime.includes('pdf')) return 'PDF'
  if (mime.includes('word')) return 'Word'
  if (mime.includes('sheet') || mime.includes('excel')) return 'Excel'
  if (mime.startsWith('image/')) return 'Image'
  return 'File'
}

const sizeLabel = (bytes?: number | null) => {
  if (!bytes) return ''
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export const DocumentListBlock: React.FC<Props> = async ({
  title,
  intro,
  mode,
  categories,
  documents: selected,
  showSuperseded,
}) => {
  let docs: Document[] = []

  if (mode === 'selected' && selected && selected.length > 0) {
    docs = selected.filter((d): d is Document => typeof d === 'object' && d !== null)
  } else {
    const payload = await getPayload({ config: configPromise })
    const cats = (categories || []) as string[]
    const result = await payload.find({
      collection: 'documents',
      depth: 0,
      limit: 200,
      sort: 'title',
      where: {
        and: [
          ...(cats.length > 0 ? [{ category: { in: cats } }] : []),
          ...(showSuperseded ? [] : [{ superseded: { not_equals: true } }]),
        ],
      },
    })
    docs = result.docs
  }

  if (docs.length === 0) return null

  // Group by category so a mixed list reads as sections.
  const groups = new Map<string, Document[]>()
  for (const d of docs) {
    const key = d.category || 'other'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(d)
  }
  const showHeadings = groups.size > 1

  return (
    <section className="wrap">
      {(title || intro) && (
        <div className="section-head">
          {title && <h2 className="section-title reveal">{title}</h2>}
          {intro && <p className="section-kicker reveal reveal-d1">{intro}</p>}
        </div>
      )}
      {Array.from(groups.entries()).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 32 }}>
          {showHeadings && (
            <h3
              className="display"
              style={{ fontWeight: 800, fontSize: 22, color: 'var(--green)', margin: '0 0 12px', letterSpacing: '0.06em' }}
            >
              {labelFor(cat)}
            </h3>
          )}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid var(--line)' }}>
            {items.map((d) => (
              <li key={d.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <a
                  href={d.url || '#'}
                  target="_blank"
                  rel="noopener"
                  className="doc-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr auto',
                    gap: 16,
                    alignItems: 'center',
                    padding: '14px 6px',
                    textDecoration: 'none',
                  }}
                >
                  <span
                    className="display"
                    style={{
                      fontWeight: 800,
                      fontSize: 13,
                      letterSpacing: '0.1em',
                      background: 'var(--ink)',
                      color: 'var(--cream)',
                      borderRadius: 8,
                      padding: '8px 0',
                      textAlign: 'center',
                    }}
                  >
                    {typeLabel(d.mimeType)}
                  </span>
                  <span>
                    <span style={{ fontWeight: 600, display: 'block' }}>
                      {d.title}
                      {d.superseded && (
                        <span style={{ color: 'var(--grey)', fontWeight: 400, fontSize: 13 }}> (superseded)</span>
                      )}
                    </span>
                    {d.description && (
                      <span style={{ color: 'var(--grey)', fontSize: 14.5, display: 'block' }}>{d.description}</span>
                    )}
                  </span>
                  <span style={{ color: 'var(--grey)', fontSize: 13.5, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {d.season && <span style={{ display: 'block' }}>{d.season}</span>}
                    {sizeLabel(d.filesize)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
