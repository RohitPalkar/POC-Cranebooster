import * as React from 'react'
import { CircleAlert, Inbox, Lock, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/state/i18n'
import { cn } from '@/lib/utils'

export function StatePanel({
  icon: Icon,
  title,
  body,
  action,
  tone = 'neutral',
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body?: string
  action?: React.ReactNode
  tone?: 'neutral' | 'danger' | 'brand'
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center', className)}>
      <span
        className={cn(
          'mb-4 inline-flex size-12 items-center justify-center rounded-full',
          tone === 'danger' ? 'bg-danger-soft text-danger' : tone === 'brand' ? 'bg-brand-soft text-brand-text' : 'bg-neutral-soft text-muted-foreground',
        )}
      >
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="text-base font-semibold text-foreground">{title}</p>
      {body && <p className="mt-1 max-w-md text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}

export function LoadingState({ label }: { label: string }) {
  const t = useT()
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">
        {t('Loading')} {label}
      </span>
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-5">
          <div className="h-4 w-40 rounded bg-neutral-soft animate-shimmer" />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((j) => (
              <div key={j} className="h-14 rounded-lg bg-neutral-soft animate-shimmer" />
            ))}
          </div>
          <div className="mt-4 h-3 w-3/4 rounded bg-neutral-soft animate-shimmer" />
          <div className="mt-2 h-3 w-1/2 rounded bg-neutral-soft animate-shimmer" />
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ label, onRetry }: { label: string; onRetry: () => void }) {
  const t = useT()
  return (
    <StatePanel
      icon={CircleAlert}
      tone="danger"
      title={`${t("Couldn't load")} ${label}`}
      body={t('The server did not respond in time. Your other tabs are not affected.')}
      action={
        <Button onClick={onRetry}>
          <RotateCw aria-hidden />
          {t('Try again')}
        </Button>
      }
    />
  )
}

export function NoPermissionState({ label }: { label: string }) {
  const t = useT()
  return (
    <StatePanel
      icon={Lock}
      title={`${t("You don't have access to")} ${label}`}
      body={t('Your role can see this record but not this tab. Ask an admin for access.')}
      action={<Button>{t('Request access')}</Button>}
    />
  )
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return <StatePanel icon={Inbox} tone="brand" title={title} body={body} action={action} />
}
