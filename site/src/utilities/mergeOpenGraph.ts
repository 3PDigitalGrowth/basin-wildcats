import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'The Basin Wildcats are a family basketball club in the Knox competition, founded 1975. New players welcome every season.',
  images: [
    {
      url: `${getServerSideURL()}/logo.png`,
    },
  ],
  siteName: 'The Basin Wildcats Basketball Club',
  title: 'The Basin Wildcats Basketball Club',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
