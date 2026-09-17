import React from 'react'

import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header as HeaderType, SiteSetting } from '@/payload-types'

import { HeaderClient } from './Component.client'

export async function Header() {
  const [headerData, settings] = await Promise.all([
    getCachedGlobal('header', 1)() as Promise<HeaderType>,
    getCachedGlobal('site-settings', 0)() as Promise<SiteSetting>,
  ])

  return <HeaderClient data={headerData} settings={settings} />
}
