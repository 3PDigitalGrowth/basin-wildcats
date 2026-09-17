'use client'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'

import type { Product, Variant, VariantOption, VariantType } from '@/payload-types'

import { formatAUD } from '@/utilities/formatAUD'
import styles from './PurchasePanel.module.css'

type Props = {
  product: Product
}

/**
 * Handles size selection, quantity and add-to-cart for a product page.
 * Variant state lives in the URL (?size=<optionId>&variant=<variantId>) so
 * the choice survives a refresh and can be shared or linked to directly.
 */
export const PurchasePanel: React.FC<Props> = ({ product }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { addItem, cart, isLoading } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const variants = useMemo(
    () => (product.variants?.docs || []).filter((v): v is Variant => typeof v === 'object'),
    [product.variants],
  )
  const variantTypes = useMemo(
    () => (product.variantTypes || []).filter((t): t is VariantType => typeof t === 'object'),
    [product.variantTypes],
  )
  const hasVariants = Boolean(product.enableVariants && variants.length && variantTypes.length)

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return undefined
    const variantId = searchParams.get('variant')
    if (!variantId) return undefined
    return variants.find((v) => String(v.id) === variantId)
  }, [hasVariants, variants, searchParams])

  // Every size costs the same here, so show the product's base price until
  // a size is picked, then switch to that variant's own price if it differs.
  const price = selectedVariant?.priceInAUD ?? product.priceInAUD
  const stock = hasVariants ? (selectedVariant?.inventory ?? null) : (product.inventory ?? null)

  const quantityInCart = useMemo(() => {
    const existing = cart?.items?.find((item) => {
      const productID = typeof item.product === 'object' ? item.product?.id : item.product
      if (productID !== product.id) return false
      if (!hasVariants) return true
      const variantID = typeof item.variant === 'object' ? item.variant?.id : item.variant
      return variantID === selectedVariant?.id
    })
    return existing?.quantity || 0
  }, [cart?.items, product.id, hasVariants, selectedVariant])

  const remainingStock = stock === null ? null : Math.max(stock - quantityInCart, 0)
  const outOfStock = stock !== null && remainingStock === 0
  const needsSelection = hasVariants && !selectedVariant
  const canAdd = !needsSelection && !outOfStock && !isLoading

  const selectOption = useCallback(
    (typeName: string, optionId: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('variant')
      params.set(typeName, String(optionId))

      const chosenIds = variantTypes
        .map((type) => params.get(type.name))
        .filter((v): v is string => Boolean(v))

      const match = variants.find((v) => {
        const opts = (v.options || []).map((o) => String(typeof o === 'object' ? o.id : o))
        return opts.length === chosenIds.length && opts.every((o) => chosenIds.includes(o))
      })

      if (match) params.set('variant', String(match.id))
      setQuantity(1)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, variantTypes, variants, router, pathname],
  )

  const handleAdd = useCallback(() => {
    setAddError(null)
    addItem({ product: product.id, variant: selectedVariant?.id }, quantity)
      .then(() => {
        setJustAdded(true)
        setQuantity(1)
        setTimeout(() => setJustAdded(false), 2500)
      })
      .catch(() => {
        setAddError('Could not add that to the cart. Try again in a moment.')
      })
  }, [addItem, product.id, selectedVariant, quantity])

  const maxQuantity = remainingStock === null ? 20 : Math.min(remainingStock, 20)

  return (
    <div>
      <div className={styles.priceRow}>
        {typeof price === 'number' && <span className={styles.price}>{formatAUD(price)}</span>}
      </div>

      {hasVariants && (
        <div className={styles.variantBlock}>
          {variantTypes.map((type) => {
            const options = (type.options?.docs || []).filter(
              (o): o is VariantOption => typeof o === 'object',
            )
            if (!options.length) return null
            const currentValue = searchParams.get(type.name)

            return (
              <div key={type.id} style={{ marginBottom: 18 }}>
                <p className={styles.variantLabel}>{type.label}</p>
                <div className={styles.pills}>
                  {options.map((option) => {
                    const isActive = currentValue === String(option.id)

                    const wouldMatch = variants.some((v) => {
                      const opts = (v.options || []).map((o) =>
                        typeof o === 'object' ? o.id : o,
                      )
                      return opts.includes(option.id)
                    })
                    const matchedVariant = variants.find((v) => {
                      const opts = (v.options || []).map((o) =>
                        typeof o === 'object' ? o.id : o,
                      )
                      return opts.length === 1 && opts[0] === option.id
                    })
                    const isSoldOut =
                      variantTypes.length === 1 &&
                      matchedVariant &&
                      (matchedVariant.inventory || 0) <= 0

                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
                        disabled={!wouldMatch || Boolean(isSoldOut)}
                        title={isSoldOut ? `${option.label} (out of stock)` : option.label}
                        onClick={() => selectOption(type.name, option.id)}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className={`${styles.stock} ${outOfStock ? styles.out : stock !== null && stock < 10 ? styles.low : ''}`}>
        {needsSelection && 'Choose a size to see stock.'}
        {!needsSelection && outOfStock && 'Out of stock.'}
        {!needsSelection &&
          !outOfStock &&
          remainingStock !== null &&
          remainingStock < 10 &&
          `Only ${remainingStock} left.`}
        {!needsSelection &&
          !outOfStock &&
          (remainingStock === null || remainingStock >= 10) &&
          'In stock.'}
      </p>

      <div className={styles.purchaseRow}>
        <div className={styles.stepper}>
          <button
            type="button"
            className={styles.stepperBtn}
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className={styles.stepperValue}>{quantity}</span>
          <button
            type="button"
            className={styles.stepperBtn}
            disabled={quantity >= maxQuantity}
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button type="button" className="btn btn-red" disabled={!canAdd} onClick={handleAdd}>
          {needsSelection ? 'Select a size' : outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>

        {justAdded && <span className={styles.added}>Added to your cart.</span>}
      </div>

      {addError && <p className={styles.stock}>{addError}</p>}

      {product.collectionNote && <p className={styles.note}>{product.collectionNote}</p>}
    </div>
  )
}
