import { Link, useParams } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { moduleById, itemPath, type Kpi } from '@/data/nav'
import { Badge } from '@/components/ui/badge'
import { Stat } from '@/workspace/ui'
import { Ltr, useT } from '@/state/i18n'
import { NotFound } from './NotFound'
import { Page, PageHeader } from './lists/common'

const statTone = (k: Kpi) => (k.tone === 'success' || k.tone === 'warning' || k.tone === 'danger' ? k.tone : undefined)

export function ModuleOverview() {
  const t = useT()
  const { module } = useParams()
  const mod = moduleById[module ?? '']
  if (!mod || !mod.kpis) return <NotFound />
  return (
    <Page>
      <PageHeader title={t(mod.label)} description={t('Overview and queues that need action')} />
      <section aria-label={t('Key numbers')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {mod.kpis.map((k) => (
          <Stat key={k.label} label={k.label} value={k.value} hint={k.delta ? t(k.delta) : undefined} tone={statTone(k)} />
        ))}
      </section>
      <section aria-labelledby="queues" className="flex flex-col gap-3">
        <h2 id="queues" className="text-base font-semibold text-foreground">{t('Queues')}</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {mod.queues?.map((q) => (
            <li key={q.label}>
              <Link to={itemPath(mod.id, q.item)} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring">
                <Badge tone={q.tone}><Ltr>{q.count}</Ltr></Badge>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{t(q.label)}</span>
                  <span className="block text-sm text-muted-foreground">{t(q.hint)}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  )
}
