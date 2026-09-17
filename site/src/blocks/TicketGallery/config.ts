import type { Block } from 'payload'

export const TicketGallery: Block = {
  slug: 'ticketGallery',
  interfaceName: 'TicketGalleryBlock',
  labels: { singular: 'Photo tickets', plural: 'Photo tickets' },
  fields: [
    { name: 'title', type: 'text', required: true, defaultValue: 'Game day' },
    { name: 'titleHollow', type: 'text', label: 'Outlined word(s)', defaultValue: 'moments' },
    { name: 'kicker', type: 'textarea' },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'tag', type: 'text' },
        { name: 'caption', type: 'text', required: true },
        { name: 'sub', type: 'text' },
      ],
    },
  ],
}
