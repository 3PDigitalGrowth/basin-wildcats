import type { Block } from 'payload'

export const Table: Block = {
  slug: 'table',
  interfaceName: 'TableBlock',
  labels: { singular: 'Table', plural: 'Tables' },
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Shown under the table, for example "Winter 2025 fees".' },
    },
    {
      name: 'columns',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'rows',
      type: 'array',
      fields: [
        {
          name: 'cells',
          type: 'array',
          fields: [{ name: 'value', type: 'text' }],
        },
      ],
    },
    { name: 'note', type: 'textarea', label: 'Footnote' },
  ],
}
