'use client'

import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'

import type { BillingAddress } from './types'
import styles from './checkout.module.css'

type Props = {
  customerEmail: string
  billingAddress: BillingAddress
}

/**
 * Lives inside the Stripe <Elements> wrapper once a PaymentIntent has been
 * created. Confirms the card, then confirms the order with the ecommerce
 * plugin and sends the buyer to the confirmation page.
 */
export const PaymentForm: React.FC<Props> = ({ customerEmail, billingAddress }) => {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { clearCart } = useCart()
  const { confirmOrder } = usePayments()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!stripe || !elements) return

      setIsSubmitting(true)
      setError(null)

      const returnUrl = `${window.location.origin}/checkout/confirm-order?email=${encodeURIComponent(customerEmail)}`

      try {
        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
          confirmParams: {
            return_url: returnUrl,
            payment_method_data: {
              billing_details: {
                email: customerEmail,
                name: `${billingAddress.firstName} ${billingAddress.lastName}`.trim(),
                phone: billingAddress.phone,
                address: {
                  line1: billingAddress.addressLine1,
                  line2: billingAddress.addressLine2,
                  city: billingAddress.city,
                  state: billingAddress.state,
                  postal_code: billingAddress.postalCode,
                  country: billingAddress.country,
                },
              },
            },
          },
          elements,
          redirect: 'if_required',
        })

        if (stripeError) {
          setError(stripeError.message || 'The payment could not be processed.')
          setIsSubmitting(false)
          return
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          const result = await confirmOrder('stripe', {
            additionalData: {
              paymentIntentID: paymentIntent.id,
              customerEmail,
            },
          })

          if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
            const accessToken = 'accessToken' in result ? (result.accessToken as string) : ''
            const params = new URLSearchParams()
            params.set('order', String(result.orderID))
            if (accessToken) params.set('accessToken', accessToken)

            clearCart()
            router.push(`/checkout/confirmation?${params.toString()}`)
            return
          }
        }

        // Anything else (e.g. requires_action that stayed on-page) falls through here.
        setIsSubmitting(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.'
        setError(message)
        setIsSubmitting(false)
      }
    },
    [stripe, elements, customerEmail, billingAddress, confirmOrder, clearCart, router],
  )

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className={styles.error} style={{ marginTop: 14 }}>{error}</p>}
      <button
        className="btn btn-red"
        style={{ marginTop: 20 }}
        disabled={!stripe || isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Processing...' : 'Pay now'}
      </button>
    </form>
  )
}
