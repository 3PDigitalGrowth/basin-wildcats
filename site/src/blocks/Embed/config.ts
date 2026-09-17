import type { Block } from 'payload'

export const Embed: Block = {
  slug: 'embed',
  interfaceName: 'EmbedBlock',
  labels: { singular: 'Embed', plural: 'Embeds' },
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: { description: 'Iframe address, for example a YouTube embed link or a Google Map.' },
    },
    { name: 'height', type: 'number', defaultValue: 480 },
  ],
}
