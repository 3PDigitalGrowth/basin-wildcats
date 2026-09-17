import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

type Props = CTABlockProps & {
  /** Set false when rendered inline inside rich text, which already sits in a `.wrap`. */
  enableGutter?: boolean
}

export const CallToActionBlock: React.FC<Props> = ({ links, richText, enableGutter = true }) => {
  return (
    <div className={enableGutter ? 'wrap' : undefined}>
      <div className="cta-card">
        <div className="cta-card-copy">
          {richText && (
            <RichText
              className="prose-club on-dark"
              data={richText}
              enableGutter={false}
              enableProse={false}
            />
          )}
        </div>
        {(links || []).length > 0 && (
          <div className="cta-card-actions">
            {(links || []).map(({ link }, i) => (
              <CMSLink key={i} appearance={i === 0 ? 'default' : 'ghost'} {...link} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
