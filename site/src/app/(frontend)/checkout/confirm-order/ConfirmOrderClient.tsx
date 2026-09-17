'use client'

import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

/**
 * Landing page Stripe returns to for payment methods that redirect away
 * from the page (most card payments never hit this: PaymentForm confirms
 * them without a redirect). Finishes the order, then sends the buyer on.
 */
export const ConfirmOrderClient: React.FC = () => {
  const { confirmOrder } = usePayments()
  const { cart, clearCart } = useCart()
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasConfirmed = useRef(false)

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) return

    const paymentIntentID = searchParams.get('payment_intent')
    const email = searchParams.get('email')

    if (!paymentIntentID) {
      router.push('/checkout')
      return
    }

    if (hasConfirmed.current) return
    hasConfirmed.current = true

    confirmOrder('stripe', {
      additionalData: {
        paymentIntentID,
        ...(email ? { customerEmail: email } : {}),
      },
    })
      .then((result) => {
        if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
          const accessToken = 'accessToken' in result ? (result.accessToken as string) : ''
          const params = new URLSearchParams()
          params.set('order', String(result.orderID))
          if (accessToken) params.set('accessToken', accessToken)

          clearCart()
          router.push(`/checkout/confirmation?${params.toString()}`)
        }
      })
      .catch(() => {
        router.push('/checkout')
      })
  }, [cart, confirmOrder, clearCart, router, searchParams])

  return (
    <div style={{ padding: '80px 0', textAlign: 'center' }}>
      <p className="section-kicker">Confirming your order...</p>
    </div>
  )
}
