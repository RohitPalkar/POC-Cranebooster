import { CircleCheck, CircleX, ShieldAlert } from 'lucide-react'
import type { RecordData } from '@/data/records'
import { useStore } from '@/state/store'
import { Button } from '@/components/ui/button'

export function ApprovalBanner({ record }: { record: RecordData }) {
  const { approvals, decide, toast } = useStore()
  const a = record.approval
  if (!a) return null
  const state = approvals[a.id]
  if (state !== 'pending')
    return (
      <div role="status" className={`mt-3 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-foreground ${state === 'approved' ? 'border-success/30 bg-success-soft' : 'border-danger/30 bg-danger-soft'}`}>
        {state === 'approved' ? <CircleCheck className="size-5 shrink-0 text-success" aria-hidden /> : <CircleX className="size-5 shrink-0 text-danger" aria-hidden />}
        <span><span className="font-semibold">{a.title}</span>: {state === 'approved' ? 'approved by Rakesh Kulkarni.' : 'rejected. Neha Patil has been notified.'}</span>
      </div>
    )
  return (
    <div role="region" aria-label="Approval required" className="mt-3 flex items-center gap-3 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3">
      <ShieldAlert className="size-5 shrink-0 text-warning" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Waiting for approval: {a.title}</p>
        <p className="mt-0.5 text-sm text-foreground-secondary">{a.detail}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="destructive-outline" onClick={() => { decide(a.id, 'rejected'); toast('v3 rejected', 'info') }}>
          <CircleX aria-hidden />
          Reject
        </Button>
        <Button variant="success" onClick={() => { decide(a.id, 'approved'); toast('v3 approved') }}>
          <CircleCheck aria-hidden />
          Approve v3
        </Button>
      </div>
    </div>
  )
}
