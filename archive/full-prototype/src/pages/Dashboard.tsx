import { Link } from 'react-router'
import { ArrowRight, CircleAlert, Clock, Inbox } from 'lucide-react'
import { TODAY } from '@/data/records'
import { approvalItems, notifications } from '@/data/approvals'
import { Badge } from '@/components/ui/badge'
import { recordPath } from '@/lib/paths'
import { useStore } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { Panel, Stat } from '@/workspace/ui'
import { Page, PageHeader } from './lists/common'

export function Dashboard() {
  const t = useT()
  const { approvals } = useStore()
  const pending = approvalItems.filter((a) => approvals[a.approval.id] === 'pending')
  return (
    <Page>
      <PageHeader title={t('Dashboard')} description={TODAY} />
      <section aria-label={t('Key numbers')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open enquiries" value="38" hint={t('5 BMC replies due today')} tone="warning" />
        <Stat label="Today's jobs" value="19" hint={t('3 not ready')} tone="warning" />
        <Stat label="Cranes on site" value="31 / 46" hint={t('74% utilisation')} tone="success" />
        <Stat label="Receivables" value="₹1,42,18,000" hint={t('₹18,64,000 overdue')} tone="danger" />
      </section>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title={t('Waiting for your approval')} actions={<Badge tone="warning" icon={Inbox}><Ltr>{pending.length}</Ltr></Badge>} bodyClassName="p-0">
          {pending.length ? (
            <ul>
              {pending.map(({ record, approval }) => (
                <li key={approval.id}>
                  <Link to={recordPath(record.id, approval.tab) + (record.id === 'ENQ-1042' ? '?quote=v2' : '')} className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-0 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{t(approval.title)}</span>
                      <span className="block text-xs text-muted-foreground">{t(approval.module)} · <Ltr>{approval.amount}</Ltr></span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-muted-foreground">{t('Nothing waiting. You are up to date.')}</p>
          )}
        </Panel>
        <Panel title={t('Needs attention today')} bodyClassName="p-0">
          <ul>
            {notifications.slice(0, 4).map((n) => (
              <li key={n.id}>
                <Link to={n.path} className="flex items-start gap-3 border-b border-border-subtle px-5 py-3 last:border-0 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                  {n.tone === 'danger' ? <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden /> : <Clock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-foreground">{t(n.title)}</span>
                    <span className="block text-xs text-muted-foreground">{t(n.meta)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </Page>
  )
}
