import * as React from 'react'
import { Dialog as D } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/state/i18n'

export const Sheet = D.Root
export const SheetTrigger = D.Trigger
export const SheetClose = D.Close

type Side = 'end' | 'start' | 'bottom'

const sideClass: Record<Side, string> = {
  end: 'inset-y-0 end-0 h-full w-full max-w-xl border-s rtl:animate-sheet-start ltr:animate-sheet-end',
  start: 'inset-y-0 start-0 h-full w-80 max-w-[85vw] border-e ltr:animate-sheet-start rtl:animate-sheet-end',
  bottom: 'inset-x-0 bottom-0 max-h-[85dvh] w-full rounded-t-2xl border-t animate-sheet-up',
}

export function SheetContent({
  side = 'end',
  className,
  children,
  title,
  description,
  headerExtra,
  ...props
}: Omit<React.ComponentProps<typeof D.Content>, 'title'> & {
  side?: Side
  title: React.ReactNode
  description?: React.ReactNode
  headerExtra?: React.ReactNode
}) {
  const t = useT()
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-overlay animate-in" />
      <D.Content
        className={cn('fixed z-50 flex flex-col border-border bg-surface shadow-lg focus-visible:outline-none', sideClass[side], className)}
        {...props}
      >
        {side === 'bottom' && <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border-strong" aria-hidden />}
        <div className="flex items-start gap-3 border-b border-border-subtle px-5 py-4">
          <div className="min-w-0 flex-1">
            <D.Title className="truncate text-base font-semibold text-foreground">{title}</D.Title>
            {description ? (
              <D.Description className="mt-0.5 text-sm text-muted-foreground">{description}</D.Description>
            ) : (
              <D.Description className="sr-only">{typeof title === 'string' ? title : ''}</D.Description>
            )}
          </div>
          {headerExtra}
          <D.Close
            className="-me-2 -mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-neutral-soft hover:text-foreground pointer-coarse:size-11"
            aria-label={t('Close')}
          >
            <X className="size-4" aria-hidden />
          </D.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </D.Content>
    </D.Portal>
  )
}
