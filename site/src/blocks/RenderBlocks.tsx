import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CardGridBlock } from '@/blocks/CardGrid/Component'
import { ContactCardsBlock } from '@/blocks/ContactCards/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { CtaStripBlock } from '@/blocks/CtaStrip/Component'
import { DarkBandBlock } from '@/blocks/DarkBand/Component'
import { DocumentListBlock } from '@/blocks/DocumentList/Component'
import { EmbedBlock } from '@/blocks/Embed/Component'
import { FacebookPageBlock } from '@/blocks/FacebookPage/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { ImageTextBlock } from '@/blocks/ImageText/Component'
import { InstagramFeedBlock } from '@/blocks/InstagramFeed/Component'
import { MarqueeBlock } from '@/blocks/Marquee/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { ProductGridBlock } from '@/blocks/ProductGrid/Component'
import { SponsorGridBlock } from '@/blocks/SponsorGrid/Component'
import { StatementBlock } from '@/blocks/Statement/Component'
import { TableBlock } from '@/blocks/Table/Component'
import { TicketGalleryBlock } from '@/blocks/TicketGallery/Component'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blockComponents: Record<string, React.FC<any>> = {
  archive: ArchiveBlock,
  cardGrid: CardGridBlock,
  contactCards: ContactCardsBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  ctaStrip: CtaStripBlock,
  darkBand: DarkBandBlock,
  documentList: DocumentListBlock,
  embed: EmbedBlock,
  facebookPage: FacebookPageBlock,
  formBlock: FormBlock,
  imageText: ImageTextBlock,
  instagramFeed: InstagramFeedBlock,
  marquee: MarqueeBlock,
  mediaBlock: MediaBlock,
  productGrid: ProductGridBlock,
  sponsorGrid: SponsorGridBlock,
  statement: StatementBlock,
  table: TableBlock,
  ticketGallery: TicketGalleryBlock,
}

/** Blocks that manage their own vertical rhythm and full-bleed shells. */
const selfSpaced = new Set([
  'cardGrid',
  'ctaStrip',
  'darkBand',
  'marquee',
  'sponsorGrid',
  'statement',
  'ticketGallery',
  'instagramFeed',
  'productGrid',
])

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              if (selfSpaced.has(blockType)) {
                return <Block key={index} {...block} disableInnerContainer />
              }
              return (
                <div className="section-tight" key={index}>
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
