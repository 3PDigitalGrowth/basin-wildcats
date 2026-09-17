import React from 'react'

import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  if (!posts || posts.length === 0) {
    return (
      <div className="wrap">
        <div className="news-empty">
          <p>No news yet. Follow the Wildcats on Instagram for the latest.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap">
      <div className="news-grid">
        {posts.map((result, index) => {
          if (typeof result !== 'object' || result === null) return null
          return <Card key={index} doc={result} relationTo="posts" showCategories />
        })}
      </div>
    </div>
  )
}
