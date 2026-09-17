'use client'

import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import React, { useCallback, useMemo, useState } from 'react'

import type { Product, Variant } from '@/payload-types'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatAUD } from '@/utilities/formatAUD'
import { PaymentForm } from './PaymentForm'
import { emptyBillingAddress, type BillingAddress } from './types'
import styles from './checkout.module.css'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
const hasStripeKey = Boolean(publishableKey)
const stripePromise = hasStripeKey ? loadStripe(publishableKey) : null

const auStates = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']

export const CheckoutClient: React.FC = () => {
  const { cart } = useCart()
  const { initiatePayment } = usePayments()

  const [email, setEmail] = useState('')
  const [address, setAddress] = useState<BillingAddress>(emptyBillingAddress)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isStartingPayment, setIsStartingPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const items = cart?.items || []
  const isEmpty = items.length === 0

  const subtotal = useMemo(() => {
    if (typeof cart?.subtotal === 'number') return cart.subtotal
    return items.reduce((sum, item) => {
      const product = typeof item.product === 'object' ? (item.product as Product) : undefined
      const variant = typeof item.variant === 'object' ? (item.variant as Variant) : undefined
      const unitPrice = variant?.priceInAUD ?? product?.priceInAUD ?? 0
      return sum + unitPrice * item.quantity
    }, 0)
  }, [cart?.subtotal, items])

  const canSubmit = Boolean(
    email &&
      address.firstName &&
      address.lastName &&
      address.phone &&
      address.addressLine1 &&
      address.city &&
      address.state &&
      address.postalCode,
  )

  const updateField = useCallback(
    <K extends keyof BillingAddress>(key: K) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress((prev) => ({ ...prev, [key]: e.target.value }))
      },
    [],
  )

  const startPayment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!canSubmit || isEmpty) return

      setIsStartingPayment(true)
      setError(null)

      try {
        const result = (await initiatePayment('stripe', {
          additionalData: {
            customerEmail: email,
            billingAddress: address,
            // Every order is collected at training, so the shipping address
            // is the same block. This is what puts the buyer's name and
            // phone on the order for the committee to see.
            shippingAddress: address,
          },
        })) as Record<string, unknown>

        if (result && typeof result['clientSecret'] === 'string') {
          setClientSecret(result['clientSecret'])
        } else {
          setError('Could not start the payment. Try again in a moment.')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not start the payment.'
        setError(message)
      } finally {
        setIsStartingPayment(false)
      }
    },
    [canSubmit, isEmpty, initiatePayment, email, address],
  )

  if (isEmpty) {
    return (
      <div style={{ padding: '60px 0' }}>
        <p style={{ marginBottom: 18 }}>Your cart is empty, so there is nothing to check out.</p>
        <Link className="btn btn-red" href="/shop">
          Visit the shop
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <form className={styles.form} onSubmit={startPayment}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Contact</legend>
          <div className={styles.field}>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              disabled={Boolean(clientSecret)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Billing address</legend>
          <div className={styles.row2}>
            <div className={styles.field}>
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                required
                disabled={Boolean(clientSecret)}
                value={address.firstName}
                onChange={updateField('firstName')}
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                required
                disabled={Boolean(clientSecret)}
                value={address.lastName}
                onChange={updateField('lastName')}
              />
            </div>
          </div>

          <div className={styles.field}>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              required
              disabled={Boolean(clientSecret)}
              value={address.phone}
              onChange={updateField('phone')}
            />
          </div>

          <div className={styles.field}>
            <Label htmlFor="addressLine1">Address</Label>
            <Input
              id="addressLine1"
              required
              disabled={Boolean(clientSecret)}
              value={address.addressLine1}
              onChange={updateField('addressLine1')}
            />
          </div>

          <div className={styles.field}>
            <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
            <Input
              id="addressLine2"
              disabled={Boolean(clientSecret)}
              value={address.addressLine2}
              onChange={updateField('addressLine2')}
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <Label htmlFor="city">Suburb</Label>
              <Input
                id="city"
                required
                disabled={Boolean(clientSecret)}
                value={address.city}
                onChange={updateField('city')}
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="postalCode">Postcode</Label>
              <Input
                id="postalCode"
                required
                disabled={Boolean(clientSecret)}
                value={address.postalCode}
                onChange={updateField('postalCode')}
              />
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <Label htmlFor="state">State</Label>
              <select
                id="state"
                required
                disabled={Boolean(clientSecret)}
                value={address.state}
                onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
                style={{
                  height: 36,
                  borderRadius: 6,
                  border: '1px solid var(--line)',
                  padding: '0 10px',
                  background: 'var(--white)',
                }}
              >
                <option value="">Select</option>
                {auStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value="Australia" disabled />
            </div>
          </div>

          <p className={styles.pickupNote}>
            No shipping. Every order is collected at training: we will email you when it is
            ready.
          </p>
        </fieldset>

        {!clientSecret && (
          <div>
            <button className="btn btn-red" type="submit" disabled={!canSubmit || isStartingPayment}>
              {isStartingPayment ? 'Preparing payment...' : 'Continue to payment'}
            </button>
            {error && <p className={styles.error} style={{ marginTop: 12 }}>{error}</p>}
          </div>
        )}

        {clientSecret && hasStripeKey && stripePromise && (
          <div className={styles.paymentBox}>
            <p className={styles.legend} style={{ marginBottom: 16 }}>
              Payment
            </p>
            <Elements
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#D2312E',
                    colorText: '#0F1210',
                    fontFamily: 'var(--font-body), sans-serif',
                    borderRadius: '10px',
                  },
                },
              }}
              stripe={stripePromise}
            >
              <PaymentForm customerEmail={email} billingAddress={address} />
            </Elements>
          </div>
        )}

        {!hasStripeKey && (
          <div className={styles.noStripeNotice}>
            <strong>Online payment is being switched on</strong>
            <p>
              Email{' '}
              <a href="mailto:secretary@basinwildcats.com">secretary@basinwildcats.com</a> to
              order in the meantime.
            </p>
            <button className="btn btn-red" type="button" disabled>
              Pay
            </button>
          </div>
        )}
      </form>

      <aside className={styles.summary}>
        <p className={styles.summaryTitle}>Order summary</p>
        {items.map((item) => {
          const product = typeof item.product === 'object' ? (item.product as Product) : undefined
          const variant = typeof item.variant === 'object' ? (item.variant as Variant) : undefined
          if (!product) return null
          const unitPrice = variant?.priceInAUD ?? product.priceInAUD ?? 0
          const variantLabel = variant?.options
            ?.map((o) => (typeof o === 'object' ? o.label : null))
            .filter(Boolean)
            .join(', ')

          return (
            <div className={styles.summaryItem} key={item.id}>
              <span>
                {product.title}
                {variantLabel ? ` (${variantLabel})` : ''} × {item.quantity}
              </span>
              <span>{formatAUD(unitPrice * item.quantity)}</span>
            </div>
          )
        })}
        <div className={styles.summaryTotal}>
          <span>Total</span>
          <span>{formatAUD(subtotal)}</span>
        </div>
      </aside>
    </div>
  )
}
