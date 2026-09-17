import Link from 'next/link'
import React from 'react'

import { Mascot } from '@/components/Mascot'

import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <div className="hero-shell">
      <section className="hero-card joined" style={{ minHeight: '60vh', display: 'grid', alignItems: 'center' }}>
        <div className="page-hero no-media">
          <div className={styles.wrap}>
            <div className={styles.copy}>
              <p className="hero-eyebrow">Out of bounds</p>
              <h1 className="page-hero-title">
                Nothing <span className="accent">here</span>
              </h1>
              <p className="page-hero-sub">
                That page has moved or never existed. The club site was rebuilt in 2026, so an old
                bookmark may point somewhere that is gone.
              </p>
              <div className="page-hero-ctas">
                <Link className="btn btn-red" href="/">
                  Back to the homepage
                </Link>
                <Link className="btn btn-ghost" href="/join">
                  Join the Wildcats
                </Link>
              </div>
            </div>
            {/* Placeholder mascot cut from the club's own Instagram posts.
                Final artwork TBC, client to supply the original mascot files
                (docs/build-brief.md). */}
            <div className={styles.mascotCol}>
              <Mascot pose="dribble" size={240} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
