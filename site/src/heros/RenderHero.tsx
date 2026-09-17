import React from 'react'

import type { Page } from '@/payload-types'

import { ClubHero } from '@/heros/ClubHero'
import { PageHero } from '@/heros/PageHero'

export const RenderHero: React.FC<Page['hero']> = (props) => {
  const { type } = props || {}

  if (!type || type === 'none') return null
  if (type === 'club') return <ClubHero {...props} />
  return <PageHero {...props} />
}
