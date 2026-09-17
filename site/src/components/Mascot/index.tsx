import React from 'react'

/**
 * The Basin Wildcats mascot: placeholder artwork cut from the club's own
 * Instagram posts (see docs/build-brief.md, "Mascot" section, for sources).
 * Final artwork TBC, club to supply the original mascot files.
 */
export type MascotPose = 'banner' | 'dribble' | 'dunk'

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
}

interface MascotProps {
  pose: MascotPose
  /** Rendered width in pixels. Height is derived from the source aspect ratio. */
  size?: number
  className?: string
  style?: React.CSSProperties
}

export const Mascot: React.FC<MascotProps> = ({ pose, size = 200, className, style }) => {
  const asset = mascotPoses[pose]
  const height = Math.round((asset.height / asset.width) * size)

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={asset.src}
      alt=""
      width={size}
      height={height}
      loading="lazy"
      className={className}
      style={style}
    />
  )
}

export default Mascot
