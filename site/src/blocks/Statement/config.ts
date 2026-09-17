import type { Block } from 'payload'
import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

export const Statement: Block = {
  slug: 'statement',
  interfaceName: 'StatementBlock',
  labels: { singular: 'Big statement', plural: 'Big statements' },
  fields: [
    { name: 'tabLabel', type: 'text', defaultValue: 'Our Club', label: 'Pill label' },
    {
      name: 'statement',
      type: 'richText',
      required: true,
      label: 'Statement',
      admin: { description: 'Bold text renders green, italic text renders red.' },
      editor: lexicalEditor({
        features: () => [FixedToolbarFeature(), InlineToolbarFeature()],
      }),
    },
    { name: 'body', type: 'textarea', label: 'Supporting paragraph' },
    { name: 'imageLeft', type: 'upload', relationTo: 'media' },
    { name: 'imageRight', type: 'upload', relationTo: 'media' },
  ],
}
