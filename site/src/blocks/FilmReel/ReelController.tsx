'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

type ActiveReel = { src: string; poster: string; label: string; link: string }

/**
 * Interaction layer for the film reel: a pause control for the moving strip
 * (WCAG 2.2.2) and a lightbox that plays a reel when its frame is pressed.
 * The strip itself is server-rendered and passed in as children.
 */
export const ReelController: React.FC<{
  animate: boolean
  instagramUrl: string | null
  children: React.ReactNode
}> = ({ animate, instagramUrl, children }) => {
  const [paused, setPaused] = useState(false)
  const [active, setActive] = useState<ActiveReel | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (active && dialog && !dialog.open) dialog.showModal()
  }, [active])

  const onStripClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const button = (e.target as HTMLElement).closest<HTMLElement>('[data-reel-video]')
    if (!button?.dataset.reelVideo) return
    setActive({
      src: button.dataset.reelVideo,
      poster: button.dataset.reelPoster || '',
      label: button.dataset.reelLabel || 'Wildcats reel',
      link: button.dataset.reelLink || '',
    })
  }, [])

  const close = () => dialogRef.current?.close()

  return (
    <div className={`reel-wrap${paused || active ? ' is-paused' : ''}`}>
      <div onClick={onStripClick}>{children}</div>

      {(animate || instagramUrl) && (
        <div className="wrap reel-controls">
          {animate && (
            <button
              type="button"
              className="reel-toggle"
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? 'Play the reel' : 'Pause the reel'}
            </button>
          )}
          {instagramUrl && (
            <a className="reel-more" href={instagramUrl} target="_blank" rel="noopener">
              Every Wildcats Rewind on Instagram
            </a>
          )}
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="reel-dialog"
        aria-label={active?.label}
        onClose={() => setActive(null)}
        onClick={(e) => {
          // A click on the backdrop lands on the dialog element itself.
          if (e.target === dialogRef.current) close()
        }}
      >
        {active && (
          <div className="reel-dialog-inner">
            <video
              key={active.src}
              src={active.src}
              poster={active.poster || undefined}
              controls
              autoPlay
              playsInline
            />
            <div className="reel-dialog-bar">
              <p>{active.label}</p>
              {active.link && (
                <a href={active.link} target="_blank" rel="noopener">
                  Open on Instagram
                </a>
              )}
              <button type="button" className="reel-dialog-close" onClick={close} autoFocus>
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}
