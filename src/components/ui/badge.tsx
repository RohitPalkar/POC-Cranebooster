import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleX,
  Clock,
  Info,
  Lock,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

const badgeVariants = cva(
  'inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full font-medium [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        neutral: 'bg-neutral-soft text-foreground-secondary',
        brand: 'bg-brand-soft text-brand-text',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        danger: 'bg-danger-soft text-danger',
        info: 'bg-info-soft text-info',
      },
      variant: {
        soft: '',
        outline: 'border border-current/25 bg-surface',
        dot: 'border border-border bg-surface text-foreground',
      },
      size: { sm: 'h-5 px-2 text-xs', md: 'h-6 px-2.5 text-xs' },
    },
    defaultVariants: { tone: 'neutral', variant: 'soft', size: 'md' },
  },
)

const toneIcon: Record<Tone, LucideIcon> = {
  neutral: CircleDashed,
  brand: CircleDot,
  success: CircleCheck,
  warning: Clock,
  danger: CircleAlert,
  info: Info,
}

const dotColor: Record<Tone, string> = {
  neutral: 'bg-muted-foreground',
  brand: 'bg-brand',
  success: 'bg-success-solid',
  warning: 'bg-warning-solid',
  danger: 'bg-danger-solid',
  info: 'bg-info-solid',
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: LucideIcon | false
}

/** Status badge: meaning is always carried by text plus an icon or dot, never colour alone. */
export function Badge({ className, tone = 'neutral', variant, size, icon, children, ...props }: BadgeProps) {
  const Icon = icon === false ? null : (icon ?? toneIcon[tone ?? 'neutral'])
  return (
    <span className={cn(badgeVariants({ tone, variant, size }), className)} {...props}>
      {variant === 'dot' ? (
        <span className={cn('size-2 shrink-0 rounded-full', dotColor[tone ?? 'neutral'])} aria-hidden />
      ) : (
        Icon && <Icon aria-hidden />
      )}
      <span className="truncate">{children}</span>
    </span>
  )
}

export function CountBadge({ count, tone = 'brand', className, label }: { count: number; tone?: Tone; className?: string; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular',
        tone === 'brand' && 'bg-primary text-primary-foreground',
        tone === 'neutral' && 'bg-neutral-soft text-foreground-secondary',
        tone === 'danger' && 'bg-danger-solid text-white',
        tone === 'warning' && 'bg-warning-soft text-warning',
        className,
      )}
      aria-label={label}
    >
      <bdi dir="ltr">{count}</bdi>
    </span>
  )
}

export const ReadOnlyIcon = Lock
