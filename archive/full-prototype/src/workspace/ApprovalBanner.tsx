import * as React from 'react'
import { CircleCheck, CircleX, Clock, ShieldAlert } from 'lucide-react'
import type { RecordData } from '@/data/records'
import { useStore } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, Textarea } from '@/components/ui/input'

export function ApprovalBanner({ record }: { record: RecordData }) {
  const t = useT()
  const { approvals, decide, role, toast } = useStore()
  const [rejecting, setRejecting] = React.useState(false)
  const [reason, setReason] = React.useState('')
  const [err, setErr] = React.useState('')
  const a = record.approval
  if (!a) return null
  const state = approvals[a.id]
  if (state === 'approved')
    return (
      <div role="status" className="mt-3 flex items-start gap-3 rounded-xl border border-success/30 bg-success-soft px-4 py-3">
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
        <p className="text-sm text-foreground">
          <span className="font-semibold">{t(a.title)}</span>: {t('approved by')} Priya Nair. <Ltr>{a.amount}</Ltr>
        </p>
      </div>
    )
  if (state === 'rejected')
    return (
      <div role="status" className="mt-3 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3">
        <CircleX className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
        <p className="text-sm text-foreground">
          <span className="font-semibold">{t(a.title)}</span>: {t('rejected. The requester has been notified.')}
        </p>
      </div>
    )
  return (
    <div role="region" aria-label={t('Approval required')} className="mt-3 flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {t('Waiting for approval')}: {t(a.title)}
          </p>
          <p className="mt-0.5 text-sm text-foreground-secondary">{t(a.detail)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('Requested by')} {a.requestedBy} · {t('Approver')}: Priya Nair ({t('Sales manager')})
          </p>
        </div>
      </div>
      {role === 'manager' ? (
        <div className="flex shrink-0 gap-2">
          <Button variant="destructive-outline" onClick={() => setRejecting(true)}>
            <CircleX aria-hidden />
            {t('Reject')}
          </Button>
          <Button
            variant="success"
            onClick={() => {
              decide(a.id, 'approved')
              toast(`${t(a.title)}: ${t('approved')}`)
            }}
          >
            <CircleCheck aria-hidden />
            {t('Approve')}
          </Button>
        </div>
      ) : (
        <Badge tone="warning" icon={Clock} className="shrink-0">
          {t('Only the approver can decide')}
        </Badge>
      )}
      <Dialog open={rejecting} onOpenChange={setRejecting}>
        <DialogContent>
          <form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault()
              if (!reason.trim()) return setErr(t('A reason is required so the requester knows what to change.'))
              decide(a.id, 'rejected')
              toast(`${t(a.title)}: ${t('rejected')}`, 'info')
              setRejecting(false)
            }}
          >
            <DialogHeader>
              <DialogTitle>{t('Reject request')}</DialogTitle>
              <DialogDescription>{t(a.title)}</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field label={t('Reason')} htmlFor="reject-reason" required error={err}>
                <Textarea id="reject-reason" value={reason} onChange={(e) => setReason(e.target.value)} aria-invalid={!!err} />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button onClick={() => setRejecting(false)}>{t('Cancel')}</Button>
              <Button type="submit" variant="destructive">
                {t('Reject')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
