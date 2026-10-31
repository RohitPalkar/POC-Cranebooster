import * as React from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ChevronRight, Ellipsis, Lock, MessageCircle, Pin, PinOff } from 'lucide-react'
import { records, type Fact, type RecordData } from '@/data/records'
import { workspaceByList, type WorkspaceConfig } from '@/data/workspaces'
import { moduleById } from '@/data/nav'
import { defaultTab } from '@/lib/paths'
import { useStore } from '@/state/store'
import { Ltr } from '@/state/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/controls'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/menu'
import { cn } from '@/lib/utils'
import { WorkspaceContext, type WsCtx } from './context'
import { typeModules } from './registry'
import { Stepper } from './Stepper'
import { TabBar } from './TabBar'
import { RightRail } from './RightRail'
import { ChatDrawer } from './ChatDrawer'
import { ActionButton } from './ActionButton'
import { ActionBar } from './ActionBar'
import { PlaceholderTab } from './PlaceholderTab'
import { ApprovalBanner } from './ApprovalBanner'
import { NotFound } from '@/pages/NotFound'

export function RecordWorkspacePage() {
  const { module, list, recordId, tab } = useParams()
  const cfg = workspaceByList[`${module}/${list}`]
  const base = recordId ? records[recordId] : undefined
  if (!cfg || !base || base.type !== cfg.type) return <NotFound />
  return <RecordWorkspace key={base.id} cfg={cfg} base={base} tabParam={tab} />
}

function RecordWorkspace({ cfg, base, tabParam }: { cfg: WorkspaceConfig; base: RecordData; tabParam?: string }) {
  const store = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const mod = typeModules[cfg.type] ?? {}
  const record = mod.live ? mod.live(base, store) : base
  const basePath = `/${cfg.module}/${cfg.list}/${record.id}`
  const tab = cfg.tabs.some((x) => x.id === tabParam) ? tabParam! : defaultTab(record.id, record.stage)
  const navModule = moduleById[cfg.module]
  const navItem = navModule?.items.find((i) => i.id === cfg.list)
  const [action, runAction] = React.useState<string | null>(null)
  const [chatOpen, setChatOpen] = React.useState(false)
  const [railCollapsed, setRailCollapsed] = React.useState(false)
  const readOnly = !!record.closed

  React.useEffect(() => {
    if (tabParam !== tab) navigate(`${basePath}/${tab}${location.search}`, { replace: true })
  }, [tabParam, tab, basePath, navigate, location.search])
  React.useEffect(() => {
    store.pushRecent({ id: record.id, label: record.name.split(',')[0], path: `${basePath}/${tab}`, type: cfg.label })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.id])
  React.useEffect(() => {
    store.setLastTab(record.id, tab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.id, tab])

  const goTab = React.useCallback((id: string, search = '') => navigate(`${basePath}/${id}${search}`), [basePath, navigate])
  const ctx: WsCtx = { cfg, record, tab, goTab, action, runAction, readOnly }

  const primary = cfg.primary[cfg.stages ? (record.stage ?? '') : 'default'] ?? null
  const blockedReason = readOnly ? 'This record is closed and read-only.' : (mod.primaryBlocked?.(record, store) ?? null)
  const runPrimary = () => {
    if (!primary) return
    if (primary.tab) goTab(primary.tab)
    if (primary.action) runAction(primary.action)
  }
  const next = mod.next?.(record, store, ctx) ?? (primary && !readOnly ? { title: primary.label, cta: { label: primary.label, onClick: runPrimary } } : null)
  const handlers = mod.handlers?.(ctx, store)
  const tabCfg = cfg.tabs.find((x) => x.id === tab)
  const TabComp = mod.tabs?.[tab] ?? PlaceholderTab
  const unread = store.chatRead[record.id] ? 0 : (record.chat ?? 0)
  const idBase = `ws-${record.id}`
  const pin = { path: basePath, label: `${record.id} · ${record.name.split(',')[0]}` }
  const pinned = store.isPinned(basePath)

  return (
    <WorkspaceContext.Provider value={ctx}>
      <div className="flex min-h-full">
        <div className="min-w-0 flex-1">
          <div className="px-6 pt-4">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <li>{navModule?.label}</li>
                <li aria-hidden><ChevronRight className="size-3.5" /></li>
                <li>
                  <Link to={`/${cfg.module}/${cfg.list}`} className="rounded hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring">{navItem?.label ?? cfg.label}</Link>
                </li>
                <li aria-hidden><ChevronRight className="size-3.5" /></li>
                <li aria-current="page" className="font-medium text-foreground"><Ltr>{record.id}</Ltr></li>
              </ol>
            </nav>

            {readOnly && (
              <div role="status" className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-neutral-soft px-4 py-3 text-sm text-foreground">
                <Lock className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                <span><span className="font-semibold">Closed: {record.status.label}.</span> This record is read-only.</span>
              </div>
            )}
            <ApprovalBanner record={record} />

            <section aria-labelledby={`${idBase}-title`} className="mt-3 rounded-xl border border-border bg-surface p-5 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">{cfg.label}</span>
                    <Ltr className="text-sm font-semibold text-foreground tabular">{record.id}</Ltr>
                    <Badge tone={record.status.tone}>{record.status.label}</Badge>
                  </div>
                  <h1 id={`${idBase}-title`} className="mt-1 text-2xl font-semibold text-balance text-foreground">{record.name}</h1>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    onClick={() => {
                      setChatOpen(true)
                      store.markChatRead(record.id)
                    }}
                    aria-label={unread ? `Chat, ${unread} unread` : 'Chat'}
                  >
                    <MessageCircle aria-hidden />
                    Chat
                    {unread > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground" aria-hidden>{unread}</span>}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" aria-label="More actions"><Ellipsis aria-hidden /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => store.togglePin(pin)}>
                        {pinned ? <PinOff aria-hidden /> : <Pin aria-hidden />}
                        {pinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {primary && (
                    <ActionButton variant="primary" disabledReason={blockedReason} onClick={runPrimary}>{primary.label}</ActionButton>
                  )}
                </div>
              </div>
              <dl className="mt-3 flex flex-wrap gap-2">
                {record.facts.map((fct: Fact) => (
                  <div key={fct.label} className="rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-1.5">
                    <dt className="text-xs text-muted-foreground">{fct.label}</dt>
                    <dd className={cn('text-sm font-medium', fct.tone === 'warning' ? 'text-warning' : fct.tone === 'danger' ? 'text-danger' : fct.tone === 'success' ? 'text-success' : fct.tone === 'info' ? 'text-info' : 'text-foreground')}>{fct.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar name={record.owner} className="size-6 text-[0.625rem]" />
                  Owner · <span className="font-medium text-foreground">{record.owner}</span>
                </p>
                {cfg.actions && <ActionBar actions={cfg.actions} handlers={handlers} />}
              </div>
              {blockedReason && primary && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" aria-hidden />
                  {primary.label}: {blockedReason}
                </p>
              )}
            </section>

            {cfg.stages && (
              <div className="mt-3 rounded-xl border border-border bg-surface px-2 py-3 shadow-xs">
                <Stepper cfg={cfg} stage={record.stage} blocked={record.blocked} onStep={goTab} activeTab={tab} />
              </div>
            )}
          </div>

          <div className="sticky top-0 z-20 mt-2 bg-background/95 px-6 backdrop-blur">
            <TabBar tabs={cfg.tabs} active={tab} onSelect={(id) => goTab(id)} meta={mod.meta?.(record, store) ?? {}} dirty={[]} idBase={idBase} label={`${cfg.label} ${record.id}`} />
          </div>
          <div id={`${idBase}-panel`} role="tabpanel" aria-labelledby={`${idBase}-tab-${tab}`} tabIndex={0} className="flex flex-col gap-4 px-6 py-5 focus-visible:outline-none">
            {tabCfg?.actions && <ActionBar actions={tabCfg.actions} handlers={handlers} />}
            <TabComp />
          </div>
        </div>
        <RightRail record={record} next={next} collapsed={railCollapsed} onToggle={() => setRailCollapsed((c) => !c)} />
      </div>
      {mod.Extras && <mod.Extras />}
      <ChatDrawer open={chatOpen} onOpenChange={setChatOpen} recordId={record.id} name={record.name} />
    </WorkspaceContext.Provider>
  )
}
