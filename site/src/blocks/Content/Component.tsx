import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const list = columns || []
  if (list.length === 0) return null

  return (
    <div className="wrap">
      <div className="content-cols">
        {list.map((col, index) => {
          const { enableLink, link, richText, size } = col

          return (
            <div className={`content-col content-col-${size || 'full'}`} key={index}>
              {richText && (
                <RichText
                  className="prose-club"
                  data={richText}
                  enableGutter={false}
                  enableProse={false}
                />
              )}

              {enableLink && link?.label && <CMSLink className="content-col-link" {...link} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
