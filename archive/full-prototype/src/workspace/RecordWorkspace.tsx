import * as React from 'react'
import { Link, useBlocker, useLocation, useNavigate, useParams } from 'react-router'
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  Copy,
  Ellipsis,
  FlaskConical,
  Lock,
  MessageCircle,
  Printer,
  RotateCcw,
  Share2,
  ShieldAlert,
  UserRoundCog,
  Archive,
} from 'lucide-react'
import { records, recordsOfType, type Fact, type RecordData } from '@/data/records'
import { workspaceByList, type WorkspaceConfig } from '@/data/workspaces'
import { moduleById } from '@/data/nav'
import { defaultTab } from '@/lib/paths'
import { useStore, type DemoState } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/controls'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/menu'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, Textarea } from '@/components/ui/input'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { WorkspaceContext, type WsCtx } from './context'
import { typeModules } from './registry'
import { Stepper } from './Stepper'
import { TabBar } from './TabBar'
import { RailContent, RightRail } from './RightRail'
import { ChatDrawer } from './ChatDrawer'
import { ActionButton } from './ActionButton'
import { EmptyState, ErrorState, LoadingState, NoPermissionState } from './states'
import { PlaceholderTab } from './PlaceholderTab'
import { ApprovalBanner } from './ApprovalBanner'
import { NotFound } from '@/pages/NotFound'

type ListState = { ids?: string[]; listLabel?: string; listPath?: string } | null

export function RecordWorkspacePage() {
  const { module, list, recordId, tab } = useParams()
  const cfg = workspaceByList[`${module}/${list}`]
  const base = recordId ? records[recordId] : undefined
  if (!cfg || !base || base.type !== cfg.type) return <NotFound />
  return <RecordWorkspace key={base.id} cfg={cfg} base={base} tabParam={tab} />
}

function RecordWorkspace({ cfg, base, tabParam }: { cfg: WorkspaceConfig; base: RecordData; tabParam?: string }) {
  const t = useT()
  const store = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const mod = typeModules[cfg.type] ?? {}
  const record = mod.live ? mod.live(base, store) : base
  const basePath = `/${cfg.module}/${cfg.list}/${record.id}`
  const tab = cfg.tabs.some((x) => x.id === tabParam) ? tabParam! : defaultTab(record.id, record.stage)
  const listState = location.state as ListState
  const navModule = moduleById[cfg.module]
  const navItem = navModule?.items.find((i) => i.id === cfg.list)
  const listPath = listState?.listPath ?? `/${cfg.module}/${cfg.list}`
  const listLabel = listState?.listLabel ?? navItem?.label ?? cfg.label

  const [demo, setDemo] = React.useState<DemoState>('live')
  const [action, runAction] = React.useState<string | null>(null)
  const [chatOpen, setChatOpen] = React.useState(false)
  const [activityOpen, setActivityOpen] = React.useState(false)
  const [railCollapsed, setRailCollapsed] = React.useState(false)
  const dirtyTabs = store.dirty[record.id] ?? []
  const readOnly = !!record.closed

  React.useEffect(() => {
    if (tabParam !== tab) navigate(`${basePath}/${tab}${location.search}`, { replace: true, state: location.state })
  }, [tabParam, tab, basePath, navigate, location.search, location.state])

  React.useEffect(() => {
    store.pushRecent({ id: record.id, label: record.name.split(',')[0], path: `${basePath}/${tab}`, type: cfg.label })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.id])

  React.useEffect(() => {
    store.setLastTab(record.id, tab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.id, tab])

  const goTab = React.useCallback(
    (id: string, search = '') => navigate(`${basePath}/${id}${search}`, { state: location.state }),
    [basePath, navigate, location.state],
  )

  const ctx: WsCtx = {
    cfg,
    record,
    tab,
    goTab,
    action,
    runAction,
    setDirty: (tb, d) => store.setDirty(record.id, tb, d),
    readOnly,
  }

  const meta = mod.meta?.(record, store) ?? {}
  const primaryKey = cfg.stages ? record.stage : 'default'
  const primary = primaryKey ? cfg.primary[primaryKey] : null
  const blockedReason = readOnly ? t('This record is closed and read-only.') : (mod.primaryBlocked?.(record, store) ?? null)
  const runPrimary = () => {
    if (!primary) return
    if (primary.tab) goTab(primary.tab)
    if (primary.action && mod.Extras) runAction(primary.action)
    else if (!mod.tabs?.[primary.tab ?? '']) store.toast(`${t(primary.label)}: ${t('opened')}`, 'info')
  }
  const next =
    mod.next?.(record, store, ctx) ??
    record.next ??
    (primary && !readOnly ? { title: primary.label, detail: undefined, cta: { label: primary.label, onClick: runPrimary } } : null)

  const ids = listState?.ids ?? recordsOfType(cfg.type).map((r) => r.id)
  const idx = ids.indexOf(record.id)
  const prevId = idx > 0 ? ids[idx - 1] : undefined
  const nextId = idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : undefined
  const step = (id?: string) => id && navigate(`/${cfg.module}/${cfg.list}/${id}/${tab}`, { state: location.state })

  const blocker = useBlocker(({ nextLocation }) => dirtyTabs.length > 0 && !nextLocation.pathname.startsWith(`${basePath}/`))

  const tabLabel = t(cfg.tabs.find((x) => x.id === tab)?.label ?? '')
  const TabComp = mod.tabs?.[tab]
  const notStarted = mod.notStarted?.(record, store)?.[tab]
  const unread = store.chatRead[record.id] ? 0 : (record.chat ?? 0)
  const idBase = `ws-${record.id}`

  let content: React.ReactNode
  if (demo === 'loading') content = <LoadingState label={tabLabel} />
  else if (demo === 'error') content = <ErrorState label={tabLabel} onRetry={() => setDemo('live')} />
  else if (demo === 'no-permission') content = <NoPermissionState label={tabLabel} />
  else if (demo === 'empty' || notStarted)
    content = notStarted ? (
      <EmptyState
        title={t(notStarted.title)}
        body={t(notStarted.body)}
        action={
          <ActionButton variant="primary" disabledReason={readOnly ? t('This record is closed and read-only.') : null} onClick={() => notStarted.run(ctx)}>
            {t(notStarted.action)}
          </ActionButton>
        }
      />
    ) : (
      <EmptyState
        title={`${t('No')} ${tabLabel.toLowerCase()} ${t('yet')}`}
        body={t('When something is added here it will show up for everyone working on this record.')}
        action={<Button variant="primary">{t('Add the first one')}</Button>}
      />
    )
  else content = TabComp ? <TabComp /> : <PlaceholderTab />

  return (
    <WorkspaceContext.Provider value={ctx}>
      <div className="flex min-h-full">
        <div className="min-w-0 flex-1">
          <div className="px-4 pt-4 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <nav aria-label={t('Breadcrumb')} className="min-w-0">
                <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                  <li className="hidden sm:block">
                    <Link to={`/${cfg.module}`} className="rounded hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring">
                      {t(navModule?.label ?? '')}
                    </Link>
                  </li>
                  <li aria-hidden className="hidden sm:block">
                    <ChevronRight className="size-3.5 rtl:-scale-x-100" />
                  </li>
                  <li className="min-w-0">
                    <Link to={listPath} className="block truncate rounded hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring">
                      {t(listLabel)}
                    </Link>
                  </li>
                  <li aria-hidden>
                    <ChevronRight className="size-3.5 rtl:-scale-x-100" />
                  </li>
                  <li aria-current="page" className="font-medium text-foreground">
                    <Ltr>{record.id}</Ltr>
                  </li>
                </ol>
              </nav>
              <div className="flex items-center gap-1">
                {mod.DemoControls && <mod.DemoControls />}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={cn(demo !== 'live' && 'bg-brand-soft text-brand-text')}>
                      <FlaskConical aria-hidden />
                      {t('Demo states')}
                      {demo !== 'live' && <span className="sr-only">: {t(demo)}</span>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('Show this tab as')}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={demo} onValueChange={(v) => setDemo(v as DemoState)}>
                      {(['live', 'loading', 'empty', 'error', 'no-permission'] as DemoState[]).map((d) => (
                        <DropdownMenuRadioItem key={d} value={d}>
                          {t(d === 'live' ? 'Live data' : d === 'no-permission' ? 'No permission' : d[0].toUpperCase() + d.slice(1))}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-1 border-s border-border ps-1">
                  <span className="hidden px-1 text-xs text-muted-foreground tabular md:inline">
                    <Ltr>
                      {idx + 1} / {ids.length}
                    </Ltr>
                  </span>
                  <Tooltip content={prevId ? `${t('Previous')}: ${prevId}` : t('This is the first record in the list')}>
                    <Button variant="ghost" size="icon-sm" onClick={() => step(prevId)} aria-disabled={!prevId} aria-label={prevId ? `${t('Previous record')}, ${prevId}` : t('No previous record')}>
                      <ChevronLeft className="dir-icon" aria-hidden />
                    </Button>
                  </Tooltip>
                  <Tooltip content={nextId ? `${t('Next')}: ${nextId}` : t('This is the last record in the list')}>
                    <Button variant="ghost" size="icon-sm" onClick={() => step(nextId)} aria-disabled={!nextId} aria-label={nextId ? `${t('Next record')}, ${nextId}` : t('No next record')}>
                      <ChevronRight className="dir-icon" aria-hidden />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {readOnly && (
              <div role="status" className="mt-3 flex items-start gap-3 rounded-xl border border-border bg-neutral-soft px-4 py-3">
                <Lock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">
                    {t('Closed')}: {t(record.status.label)}.
                  </span>{' '}
                  {t(mod.reopen ? 'This record is read-only. Reopen it from the More menu to make changes.' : 'This record is read-only.')}
                </p>
              </div>
            )}
            <ApprovalBanner record={record} />
            {mod.Banner && <mod.Banner />}

            <section aria-labelledby={`${idBase}-title`} className="mt-3 rounded-xl border border-border bg-surface p-4 shadow-xs md:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">{t(cfg.label)}</span>
                    <Ltr className="text-sm font-semibold text-foreground tabular">{record.id}</Ltr>
                    <Badge tone={record.status.tone}>{t(record.status.label)}</Badge>
                  </div>
                  <h1 id={`${idBase}-title`} className="mt-1 text-xl font-semibold text-balance text-foreground md:text-2xl">
                    {record.name}
                  </h1>
                  <dl className="mt-3 flex flex-wrap gap-2">
                    {record.facts.map((fct: Fact) => (
                      <div key={fct.label} className="rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-1.5">
                        <dt className="text-xs text-muted-foreground">{t(fct.label)}</dt>
                        <dd
                          className={cn(
                            'text-sm font-medium',
                            fct.tone === 'warning' ? 'text-warning' : fct.tone === 'danger' ? 'text-danger' : fct.tone === 'success' ? 'text-success' : fct.tone === 'info' ? 'text-info' : 'text-foreground',
                          )}
                        >
                          {fct.ltr ? <Ltr>{fct.value}</Ltr> : t(fct.value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar name={record.owner} className="size-6 text-[0.625rem]" />
                    {t('Owner')} · <span className="font-medium text-foreground">{record.owner}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button className="xl:hidden" onClick={() => setActivityOpen(true)}>
                    <Activity aria-hidden />
                    {t('Activity')}
                  </Button>
                  <Button
                    onClick={() => {
                      setChatOpen(true)
                      store.markChatRead(record.id)
                    }}
                    aria-label={unread ? `${t('Chat')}, ${unread} ${t('unread')}` : t('Chat')}
                  >
                    <MessageCircle aria-hidden />
                    {t('Chat')}
                    {unread > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground" aria-hidden>
                        <Ltr>{unread}</Ltr>
                      </span>
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" aria-label={t('More actions')}>
                        <Ellipsis aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {readOnly && mod.reopen && (
                        <DropdownMenuItem
                          onSelect={() => {
                            mod.reopen?.(store)
                            store.toast(`${record.id}: ${t('reopened')}`)
                          }}
                        >
                          <RotateCcw aria-hidden />
                          {t('Reopen')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onSelect={() => store.toast(t('Link copied'), 'info')}>
                        <Share2 aria-hidden />
                        {t('Copy link')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => store.toast(t('Preparing PDF'), 'info')}>
                        <Printer aria-hidden />
                        {t('Print or PDF')}
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={readOnly}>
                        <Copy aria-hidden />
                        {t('Duplicate')}
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={readOnly}>
                        <UserRoundCog aria-hidden />
                        {t('Change owner')}
                        {readOnly && <span className="ms-auto text-xs text-muted-foreground">{t('Closed')}</span>}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled={!!record.approval && store.approvals[record.approval.id] === 'pending'}>
                        <Archive aria-hidden />
                        {t('Archive')}
                        {record.approval && store.approvals[record.approval.id] === 'pending' && <span className="ms-auto text-xs text-muted-foreground">{t('Approval open')}</span>}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {primary && (
                    <ActionButton variant="primary" disabledReason={blockedReason} onClick={runPrimary}>
                      {t(primary.label)}
                    </ActionButton>
                  )}
                </div>
              </div>
              {blockedReason && primary && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground xl:justify-end">
                  <Lock className="size-3.5" aria-hidden />
                  {t(primary.label)}: {t(blockedReason)}
                </p>
              )}
            </section>

            {cfg.stages && (
              <div className="mt-3 rounded-xl border border-border bg-surface px-2 py-3 shadow-xs">
                <Stepper cfg={cfg} stage={record.stage} blocked={record.blocked} onStep={goTab} activeTab={tab} />
              </div>
            )}
          </div>

          <div className="sticky top-0 z-20 mt-2 bg-background/95 px-4 backdrop-blur md:px-6">
            <TabBar tabs={cfg.tabs} active={tab} onSelect={(id) => goTab(id)} meta={meta} dirty={dirtyTabs} idBase={idBase} label={`${t(cfg.label)} ${record.id}`} />
          </div>
          <div id={`${idBase}-panel`} role="tabpanel" aria-labelledby={`${idBase}-tab-${tab}`} tabIndex={0} className="px-4 py-5 focus-visible:outline-none md:px-6">
            {content}
          </div>
        </div>
        <RightRail record={record} next={next} collapsed={railCollapsed} onToggle={() => setRailCollapsed((c) => !c)} />
      </div>

      {mod.Extras && <mod.Extras />}
      <ChatDrawer open={chatOpen} onOpenChange={setChatOpen} recordId={record.id} name={record.name} />
      <Sheet open={activityOpen} onOpenChange={setActivityOpen}>
        <SheetContent side="bottom" title={t('Activity')} description={`${t(cfg.label)} ${record.id}`}>
          <RailContent record={record} next={next} />
        </SheetContent>
      </Sheet>

      <Dialog open={blocker.state === 'blocked'} onOpenChange={(o) => !o && blocker.reset?.()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Save changes before leaving?')}</DialogTitle>
            <DialogDescription>
              {t('You have unsaved edits on')} <Ltr>{record.id}</Ltr>: {dirtyTabs.map((d) => t(cfg.tabs.find((x) => x.id === d)?.label ?? d)).join(', ')}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => blocker.reset?.()}>{t('Stay here')}</Button>
            <Button
              variant="destructive-outline"
              onClick={() => {
                store.clearDirty(record.id)
                blocker.proceed?.()
              }}
            >
              {t('Discard')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                store.clearDirty(record.id)
                store.toast(t('Changes saved'))
                blocker.proceed?.()
              }}
            >
              {t('Save and leave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspaceContext.Provider>
  )
}
