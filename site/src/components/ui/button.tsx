'use client'

import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

/**
 * Maps CMSLink appearance / shadcn button variants onto the club's own
 * `.btn` system from globals.css, instead of the template's Tailwind
 * button styles. Sizes are no-ops: the design system only has one button
 * size (`.btn`'s own padding).
 */
const buttonVariants = cva('', {
  variants: {
    variant: {
      default: 'btn btn-red',
      destructive: 'btn btn-red',
      outline: 'btn btn-outline',
      secondary: 'btn btn-dark',
      ghost: 'btn btn-ghost',
      link: 'underline underline-offset-4 decoration-1',
    },
    size: {
      clear: '',
      default: '',
      sm: '',
      lg: '',
      icon: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button: React.FC<ButtonProps> = ({ asChild = false, className, size, variant, ...props }) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
