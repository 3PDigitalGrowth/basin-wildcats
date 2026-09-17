import Link from 'next/link'
import React from 'react'

import type { CtaStripBlock as Props } from '@/payload-types'
import { Mascot } from '@/components/Mascot'
import { hrefFromLink } from '@/utilities/hrefFromLink'

import styles from './CtaStrip.module.css'

/**
 * Coloured call-to-action strip. The club mascot leaps over the right-hand
 * edge on desktop (placeholder cut from the club's own Instagram graphics;
 * final artwork TBC, club to supply the original files).
 */
export const CtaStripBlock: React.FC<Props> = ({ title, body, tone, link }) => {
  const href = hrefFromLink(link)
  const toneClass = tone && tone !== 'green' ? ` tone-${tone}` : ''

  return (
    <section className="strip-wrap">
      <div className="wrap">
        <div className={`join-strip reveal${toneClass} ${styles.strip}`}>
          <div className="join-strip-copy">
            <h3>{title}</h3>
            {body && <p>{body}</p>}
          </div>
          {href && link?.label && (
            <Link
              className="btn btn-red"
              href={href}
              {...(link.newTab ? { target: '_blank', rel: 'noopener' } : {})}
            >
              {link.label}
            </Link>
          )}
          <Mascot pose="dunk" size={300} className={styles.mascot} />
        </div>
      </div>
    </section>
  )
}
