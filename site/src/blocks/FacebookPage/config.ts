import type { Block } from 'payload'

export const FacebookPage: Block = {
  slug: 'facebookPage',
  interfaceName: 'FacebookPageBlock',
  labels: { singular: 'Facebook page', plural: 'Facebook pages' },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Find us on Facebook' },
    {
      name: 'pageUrl',
      type: 'text',
      admin: { description: 'Leave blank to use the Facebook page URL from Site settings.' },
    },
    { name: 'height', type: 'number', defaultValue: 600 },
  ],
}
