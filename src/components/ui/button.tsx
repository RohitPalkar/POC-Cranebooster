import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rtl:[&_svg.dir-icon]:-scale-x-100',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover',
        secondary: 'border border-border bg-surface text-foreground shadow-xs hover:bg-surface-subtle',
        soft: 'bg-brand-soft text-brand-text hover:bg-brand-soft/70',
        ghost: 'text-foreground-secondary hover:bg-neutral-soft hover:text-foreground',
        destructive: 'bg-danger-solid text-white shadow-xs hover:opacity-90',
        'destructive-outline': 'border border-danger/40 bg-surface text-danger hover:bg-danger-soft',
        success: 'bg-success-solid text-white shadow-xs hover:opacity-90 dark:text-background',
        link: 'h-auto px-0 text-brand-text underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs pointer-coarse:min-h-11',
        md: 'h-10 px-4 pointer-coarse:min-h-11',
        lg: 'h-12 px-5 text-base',
        icon: 'size-10 pointer-coarse:size-11',
        'icon-sm': 'size-8 pointer-coarse:size-11',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...(asChild ? {} : { type: props.type ?? 'button' })}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <LoaderCircle className="animate-spin" aria-hidden />}
            {children}
          </>
        )}
      </Comp>
    )
  },
)
Button.displayName = 'Button'
