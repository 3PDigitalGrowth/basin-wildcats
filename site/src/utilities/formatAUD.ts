/** Prices are stored in cents by the ecommerce plugin. */
export const formatAUD = (cents: number): string =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
