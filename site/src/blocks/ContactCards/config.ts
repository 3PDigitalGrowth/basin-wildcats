import type { Block } from 'payload'

export const ContactCards: Block = {
  slug: 'contactCards',
  interfaceName: 'ContactCardsBlock',
  labels: { singular: 'Contact cards', plural: 'Contact cards' },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'settings',
      options: [
        { label: 'Committee contacts from Site settings', value: 'settings' },
        { label: 'Custom list', value: 'custom' },
      ],
    },
    {
      name: 'contacts',
      type: 'array',
      admin: { condition: (_, siblingData) => siblingData?.source === 'custom' },
      fields: [
        { name: 'role', type: 'text', required: true },
        { name: 'name', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
      ],
    },
  ],
}
