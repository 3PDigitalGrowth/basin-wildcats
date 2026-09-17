import React from 'react'

import type { Post } from '@/payload-types'

import { Card } from '../../components/Card'

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
}

export const RelatedPosts: React.FC<RelatedPostsProps> = (props) => {
  const { className, docs } = props

  const list = (docs || []).filter((doc) => typeof doc === 'object')
  if (list.length === 0) return null

  return (
    <div className={className}>
      <div className="section-head">
        <h2 className="section-title reveal">
          Related <em>News</em>
        </h2>
      </div>
      <div className="news-grid cols-2">
        {list.map((doc, index) => (
          <Card key={index} doc={doc} relationTo="posts" showCategories />
        ))}
      </div>
    </div>
  )
}
