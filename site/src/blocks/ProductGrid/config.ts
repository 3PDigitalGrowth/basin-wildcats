import type { Block } from 'payload'

export const ProductGrid: Block = {
  slug: 'productGrid',
  interfaceName: 'ProductGridBlock',
  labels: { singular: 'Shop products', plural: 'Shop products' },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Club merchandise' },
    { name: 'kicker', type: 'textarea' },
    { name: 'limit', type: 'number', defaultValue: 4, min: 1, max: 12 },
  ],
}
