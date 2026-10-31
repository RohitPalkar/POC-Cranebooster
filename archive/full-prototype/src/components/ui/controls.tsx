import * as React from 'react'
import { Switch as S, Checkbox as C, RadioGroup as R } from 'radix-ui'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Switch({ className, ...props }: React.ComponentProps<typeof S.Root>) {
  return (
    <S.Root
      className={cn(
        'peer relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-border-strong transition-colors data-[state=checked]:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <S.Thumb className="block size-5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-4 rtl:data-[state=checked]:-translate-x-4" />
    </S.Root>
  )
}

export function Checkbox({ className, ...props }: React.ComponentProps<typeof C.Root>) {
  return (
    <C.Root
      className={cn(
        'peer inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
      {...props}
    >
      <C.Indicator>
        {props.checked === 'indeterminate' ? <Minus className="size-3" strokeWidth={3} /> : <Check className="size-3" strokeWidth={3} />}
      </C.Indicator>
    </C.Root>
  )
}

/** Segmented control built on RadioGroup for view switches and filters. */
export function Segmented<T extends string>({
  value,
  onValueChange,
  options,
  label,
  size = 'md',
  className,
}: {
  value: T
  onValueChange: (v: T) => void
  options: { value: T; label: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }[]
  label: string
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <R.Root
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
      aria-label={label}
      orientation="horizontal"
      className={cn('inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-surface-sunken p-0.5', className)}
    >
      {options.map((o) => (
        <R.Item
          key={o.value}
          value={o.value}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=checked]:bg-surface data-[state=checked]:text-foreground data-[state=checked]:shadow-xs focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-11',
            size === 'sm' ? 'h-7 text-xs' : 'h-8 text-sm',
          )}
        >
          {o.icon && <o.icon className="size-4" aria-hidden />}
          {o.label}
        </R.Item>
      ))}
    </R.Root>
  )
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn('inline-flex h-5 items-center rounded border border-border bg-surface px-1.5 font-sans text-[0.6875rem] font-medium text-muted-foreground', className)}>
      {children}
    </kbd>
  )
}

export function Avatar({ name, className, tone = 'neutral' }: { name: string; className?: string; tone?: 'neutral' | 'brand' }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        tone === 'brand' ? 'bg-brand-deep text-white' : 'bg-neutral-soft text-foreground-secondary',
        className,
      )}
    >
      {initials}
    </span>
  )
}

export function Separator({ className, vertical }: { className?: string; vertical?: boolean }) {
  return <div role="separator" aria-orientation={vertical ? 'vertical' : 'horizontal'} className={cn('shrink-0 bg-border', vertical ? 'h-5 w-px' : 'h-px w-full', className)} />
}
