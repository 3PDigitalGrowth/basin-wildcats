import React from 'react'

import type { TableBlock as Props } from '@/payload-types'

export const TableBlock: React.FC<Props> = ({ title, caption, columns, rows, note }) => {
  const cols = columns || []
  const list = rows || []
  if (cols.length === 0 && list.length === 0) return null

  return (
    <section className="wrap">
      {title && (
        <h2 className="section-title reveal" style={{ marginBottom: 24 }}>
          {title}
        </h2>
      )}
      <div className="prose-club reveal" style={{ maxWidth: 'none' }}>
        <table>
          {caption && <caption style={{ captionSide: 'bottom', textAlign: 'left', color: 'var(--grey)', fontSize: 14, paddingTop: 10 }}>{caption}</caption>}
          {cols.length > 0 && (
            <thead>
              <tr>
                {cols.map((c, i) => (
                  <th key={i} scope="col">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {list.map((row, r) => (
              <tr key={r}>
                {(row.cells || []).map((cell, c) =>
                  c === 0 ? (
                    <th key={c} scope="row" style={{ fontFamily: 'var(--font-body)', textTransform: 'none', letterSpacing: 0, fontSize: 15.5, color: 'var(--ink)', fontWeight: 600 }}>
                      {cell.value}
                    </th>
                  ) : (
                    <td key={c}>{cell.value}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {note && <p style={{ color: 'var(--grey)', fontSize: 14.5 }}>{note}</p>}
      </div>
    </section>
  )
}
