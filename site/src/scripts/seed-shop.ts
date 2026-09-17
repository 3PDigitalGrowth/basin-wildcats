/**
 * Idempotent seed for the club shop: the "Size" variant type and its nine
 * options, the Hoodies-2023 media item (pulled from the old WordPress site),
 * and the Grey Hoodie product with one published variant per size.
 *
 * Run from the `site` folder:
 *   pnpm payload run src/scripts/seed-shop.ts
 *
 * Safe to re-run: media is matched by filename, the variant type/options by
 * name/label, the product by slug, and each variant by its product + size
 * combination.
 */
import { getPayload } from 'payload'

import config from '@payload-config'
import type { Product, VariantOption, VariantType } from '../payload-types'

// Source: content/wp-export/media.json, item id 20214 ("Hoodies 2023").
const HOODIE_IMAGE_URL =
  'https://www.basinwildcats.com/wordpress/wp-content/uploads/2019/06/Hoodies-2023.jpg'
const HOODIE_IMAGE_FILENAME = 'Hoodies-2023.jpg'

// A context flag the page/header/footer hooks check before calling
// next/cache's revalidatePath/revalidateTag, which throw outside a live
// Next.js request. This script runs standalone, so always disable it.
const noRevalidate = { context: { disableRevalidate: true } }

const SIZES = [
  { label: 'Child 8', value: 'child-8' },
  { label: 'Child 10', value: 'child-10' },
  { label: 'Child 12', value: 'child-12' },
  { label: 'Child 14', value: 'child-14' },
  { label: 'Adult S', value: 'adult-s' },
  { label: 'Adult M', value: 'adult-m' },
  { label: 'Adult L', value: 'adult-l' },
  { label: 'Adult XL', value: 'adult-xl' },
  { label: 'Adult XXL', value: 'adult-xxl' },
]

const HOODIE_PRICE_CENTS = 6000
const PLACEHOLDER_STOCK = 10

// ---------------------------------------------------------------------
// Lexical helpers: minimal root > paragraph > text node tree.
// ---------------------------------------------------------------------

const textNode = (text: string) => ({
  type: 'text',
  version: 1,
  text,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
})

const paragraphNode = (text: string) => ({
  type: 'paragraph',
  version: 1,
  children: [textNode(text)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
})

const lex = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    children: paragraphs.map(paragraphNode),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

// ---------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------

async function upsertHoodieMedia(payload: Awaited<ReturnType<typeof getPayload>>) {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: HOODIE_IMAGE_FILENAME } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.log(`  media "${HOODIE_IMAGE_FILENAME}" already exists, skipping download`)
    return existing.docs[0]
  }

  console.log(`  downloading ${HOODIE_IMAGE_URL}`)
  const res = await fetch(HOODIE_IMAGE_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  })
  if (!res.ok) {
    throw new Error(`Could not download ${HOODIE_IMAGE_URL}: ${res.status} ${res.statusText}`)
  }
  const arrayBuffer = await res.arrayBuffer()
  const data = Buffer.from(arrayBuffer)

  const doc = await payload.create({
    collection: 'media',
    data: { alt: 'Grey Wildcats hoodie, front and back' },
    file: {
      data,
      name: HOODIE_IMAGE_FILENAME,
      mimetype: 'image/jpeg',
      size: data.length,
    },
  })
  console.log(`  uploaded media "${HOODIE_IMAGE_FILENAME}" (id ${doc.id})`)
  return doc
}

// ---------------------------------------------------------------------
// Variants: one "Size" type, nine options
// ---------------------------------------------------------------------

async function upsertSizeVariantType(
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<VariantType> {
  const existing = await payload.find({
    collection: 'variantTypes',
    where: { name: { equals: 'size' } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.log('  variant type "Size" already exists, skipping')
    return existing.docs[0]
  }

  const doc = await payload.create({
    collection: 'variantTypes',
    data: { label: 'Size', name: 'size' },
  })
  console.log(`  created variant type "Size" (id ${doc.id})`)
  return doc
}

async function upsertSizeOptions(
  payload: Awaited<ReturnType<typeof getPayload>>,
  variantTypeId: VariantType['id'],
): Promise<VariantOption[]> {
  const options: VariantOption[] = []

  for (const size of SIZES) {
    const existing = await payload.find({
      collection: 'variantOptions',
      where: {
        and: [{ variantType: { equals: variantTypeId } }, { label: { equals: size.label } }],
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`  variant option "${size.label}" already exists, skipping`)
      options.push(existing.docs[0])
      continue
    }

    const doc = await payload.create({
      collection: 'variantOptions',
      data: { variantType: variantTypeId, label: size.label, value: size.value },
    })
    console.log(`  created variant option "${size.label}" (id ${doc.id})`)
    options.push(doc)
  }

  return options
}

// ---------------------------------------------------------------------
// Product + per-size variants
// ---------------------------------------------------------------------

async function upsertGreyHoodieProduct(
  payload: Awaited<ReturnType<typeof getPayload>>,
  hoodieImageId: number,
  sizeVariantTypeId: VariantType['id'],
): Promise<Product> {
  const description = lex([
    'Grey Wildcats hoodie, great for those cooler days at the courts.',
    'True to size across the child and adult range. Not sure which one to pick? Ask a committee member at training.',
    'Stock levels are indicative; the committee confirms availability when your order comes in.',
  ])

  const existing = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'grey-hoodie' } },
    limit: 1,
  })

  const data = {
    title: 'Grey Hoodie',
    description,
    gallery: [{ image: hoodieImageId }],
    enableVariants: true,
    variantTypes: [sizeVariantTypeId],
    priceInAUDEnabled: true,
    priceInAUD: HOODIE_PRICE_CENTS,
    generateSlug: false,
    slug: 'grey-hoodie',
    _status: 'published' as const,
    meta: {
      title: 'Grey Hoodie | The Basin Wildcats Shop',
      description:
        'Grey Wildcats hoodie, sized Child 8 to Adult XXL. Collected at training, no shipping.',
    },
  }

  if (existing.docs.length > 0) {
    const doc = await payload.update({
      collection: 'products',
      id: existing.docs[0].id,
      data,
      ...noRevalidate,
    })
    console.log(`  updated product "Grey Hoodie" (id ${doc.id})`)
    return doc
  }

  const doc = await payload.create({
    collection: 'products',
    data,
    ...noRevalidate,
  })
  console.log(`  created product "Grey Hoodie" (id ${doc.id})`)
  return doc
}

async function upsertHoodieVariants(
  payload: Awaited<ReturnType<typeof getPayload>>,
  productId: Product['id'],
  options: VariantOption[],
) {
  const existingVariants = await payload.find({
    collection: 'variants',
    where: { product: { equals: productId } },
    limit: 100,
  })

  for (const option of options) {
    const match = existingVariants.docs.find((v) => {
      const ids = (v.options || []).map((o) => (typeof o === 'object' ? o.id : o))
      return ids.length === 1 && ids[0] === option.id
    })

    if (match) {
      console.log(`  variant for "${option.label}" already exists, skipping`)
      continue
    }

    const doc = await payload.create({
      collection: 'variants',
      data: {
        product: productId,
        options: [option.id],
        inventory: PLACEHOLDER_STOCK,
        priceInAUDEnabled: true,
        priceInAUD: HOODIE_PRICE_CENTS,
        _status: 'published',
      },
      ...noRevalidate,
    })
    console.log(`  created variant for "${option.label}" (id ${doc.id})`)
  }
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

async function main() {
  const payload = await getPayload({ config })

  console.log('\n[1/4] Hoodie media')
  const hoodieImage = await upsertHoodieMedia(payload)

  console.log('\n[2/4] Size variant type and options')
  const sizeType = await upsertSizeVariantType(payload)
  const sizeOptions = await upsertSizeOptions(payload, sizeType.id)

  console.log('\n[3/4] Grey Hoodie product')
  const product = await upsertGreyHoodieProduct(payload, hoodieImage.id, sizeType.id)

  console.log('\n[4/4] Per-size variants')
  await upsertHoodieVariants(payload, product.id, sizeOptions)

  console.log('\nShop seed complete.')

  // Close the Postgres pool explicitly. `payload run` tears the process down
  // with its own process.exit(0) the instant this module's dynamic import()
  // resolves, which happens as soon as top-level evaluation finishes -- so
  // this script relies on a top-level `await main()` below (not a floating
  // `main().catch()`) to make sure that import() doesn't resolve, and the
  // process doesn't get killed, until all of this async work is done.
  const db = (payload as unknown as { db?: { destroy?: () => Promise<void> } }).db
  if (db?.destroy) await db.destroy()
}

try {
  await main()
} catch (err) {
  console.error('Shop seed failed:', err)
  process.exitCode = 1
}
