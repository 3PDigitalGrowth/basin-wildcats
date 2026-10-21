import React from 'react'

/**
 * The Basin Wildcats mascot. `banner`, `dribble` and `dunk` are placeholder
 * cut-outs from the club's own Instagram posts (see docs/build-brief.md,
 * "Mascot" section). `dash` is the club's original artwork, emailed by Mel
 * on 12 Oct 2026 (originals kept outside git in content/client-assets).
 */
export type MascotPose = 'banner' | 'dribble' | 'dunk' | 'dash'

interface MascotPoseAsset {
  src: string
  width: number
  height: number
}

/** Intrinsic pixel dimensions of each cut-out PNG in /public/mascot. */
export const mascotPoses: Record<MascotPose, MascotPoseAsset> = {
  banner: { src: '/mascot/mascot-banner.png', width: 417, height: 898 },
  dribble: { src: '/mascot/mascot-dribble.png', width: 765, height: 711 },
  dunk: { src: '/mascot/mascot-dunk.png', width: 893, height: 562 },
  dash: { src: '/mascot/mascot-dash.webp', width: 720, height: 855 },
}

interface MascotProps {
  pose: MascotPose
  /** Rendered width in pixels. Height is derived from the source aspect ratio. */
  size?: number
  className?: string
  style?: React.CSSProperties
  /** Load straight away (above the fold) instead of lazily. */
  eager?: boolean
}

export const Mascot: React.FC<MascotProps> = ({ pose, size = 200, className, style, eager }) => {
  const asset = mascotPoses[pose]
  const height = Math.round((asset.height / asset.width) * size)

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={asset.src}
      alt=""
      width={size}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      className={className}
      style={style}
    />
  )
}

export default Mascot
