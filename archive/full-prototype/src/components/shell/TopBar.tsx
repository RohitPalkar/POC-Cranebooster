import * as React from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Bell,
  Building2,
  CalendarPlus,
  Check,
  ChevronDown,
  ClipboardList,
  FilePlus2,
  Inbox,
  Languages,
  LogOut,
  Menu,
  Moon,
  PanelLeft,
  Plus,
  Receipt,
  Search,
  Siren,
  Sun,
  UserPlus,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, Kbd } from '@/components/ui/controls'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Tooltip } from '@/components/ui/tooltip'
import { Logo } from './Logo'
import { useStore } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { approvalItems, notifications } from '@/data/approvals'
import { recordPath } from '@/lib/paths'
import { cn } from '@/lib/utils'

const quickCreate = [
  { key: 'Lead', icon: UserPlus, id: 'LD-0892', list: '/crm/leads' },
  { key: 'Enquiry', icon: FilePlus2, id: 'ENQ-1049', list: '/crm/enquiries' },
  { key: 'Booking', icon: CalendarPlus, id: 'BK-2212', list: '/bookings/bookings' },
  { key: 'Work order', icon: ClipboardList, id: 'WO-3320', list: '/operations/work-orders' },
  { key: 'Breakdown', icon: Siren, id: 'MWO-0916', list: '/maintenance/breakdowns' },
  { key: 'Expense', icon: Receipt, id: 'EXP-1204', list: '/finance/payables' },
]

export const branches = [
  { id: 'Pune HQ', currency: 'INR' },
  { id: 'Mumbai', currency: 'INR' },
  { id: 'Dubai', currency: 'AED' },
]

function QuickCreateDialog({ kind, onClose }: { kind: (typeof quickCreate)[number] | null; onClose: () => void }) {
  const t = useT()
  const { toast } = useStore()
  const navigate = useNavigate()
  const [name, setName] = React.useState('')
  const [err, setErr] = React.useState('')
  React.useEffect(() => {
    setName('')
    setErr('')
  }, [kind])
  if (!kind) return null
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) {
              setErr(t('Enter a customer or title to continue.'))
              return
            }
            toast(`${t(kind.key)} ${kind.id} ${t('created')}`)
            onClose()
            navigate(kind.list)
          }}
          className="contents"
        >
          <DialogHeader>
            <DialogTitle>
              {t('New')} {t(kind.key).toLowerCase()}
            </DialogTitle>
            <DialogDescription>{t('Capture the basics now. You can add detail in the record workspace.')}</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <Field label={t('Customer or title')} htmlFor="qc-name" required error={err}>
              <Input id="qc-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!err} placeholder="Vardhman Buildcon Pvt Ltd" autoFocus />
            </Field>
            <Field label={t('Notes')} htmlFor="qc-notes" helper={t('Optional')}>
              <Textarea id="qc-notes" />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button onClick={onClose}>{t('Cancel')}</Button>
            <Button variant="primary" type="submit">
              {t('Create')} {t(kind.key).toLowerCase()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ApprovalsList({ onPick }: { onPick?: () => void }) {
  const t = useT()
  const { approvals } = useStore()
  return (
    <ul className="flex flex-col">
      {approvalItems.map(({ record, approval }) => {
        const state = approvals[approval.id]
        return (
          <li key={approval.id}>
            <Link
              to={recordPath(record.id, approval.tab) + (record.id === 'ENQ-1042' ? '?quote=v2' : '')}
              onClick={onPick}
              className="flex flex-col gap-1 rounded-lg px-3 py-2.5 hover:bg-neutral-soft focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <span className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{t(approval.title)}</span>
                {state === 'pending' ? (
                  <Badge tone="warning" size="sm">
                    {t('Pending')}
                  </Badge>
                ) : state === 'approved' ? (
                  <Badge tone="success" size="sm">
                    {t('Approved')}
                  </Badge>
                ) : (
                  <Badge tone="danger" size="sm">
                    {t('Rejected')}
                  </Badge>
                )}
              </span>
              <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span>{t(approval.module)}</span>
                <span aria-hidden>·</span>
                <Ltr>{approval.amount}</Ltr>
                <span aria-hidden>·</span>
                <span>
                  {t('Requested by')} {approval.requestedBy}
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function TopBar({ onMenu, onSearch, mode }: { onMenu: () => void; onSearch: () => void; mode: 'mobile' | 'rail' | 'full' }) {
  const t = useT()
  const store = useStore()
  const { theme, setTheme, lang, setLang, role, setRole, branch, setBranch, approvals } = store
  const [qc, setQc] = React.useState<(typeof quickCreate)[number] | null>(null)
  const [apprOpen, setApprOpen] = React.useState(false)
  const [notifOpen, setNotifOpen] = React.useState(false)
  const pending = Object.values(approvals).filter((s) => s === 'pending').length
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <header className="z-30 flex h-16 shrink-0 items-center gap-0.5 border-b border-border bg-surface px-2 sm:gap-2 md:px-4">
      <Tooltip content={mode === 'mobile' ? t('Open menu') : t('Toggle sidebar')}>
        <Button variant="ghost" size="icon" onClick={onMenu} aria-label={mode === 'mobile' ? t('Open menu') : t('Toggle sidebar')}>
          {mode === 'mobile' ? <Menu aria-hidden /> : <PanelLeft className="dir-icon" aria-hidden />}
        </Button>
      </Tooltip>
      <Link to="/" className="rounded-md focus-visible:outline-2 focus-visible:outline-ring" aria-label={t('Crane Booster home')}>
        <Logo className="w-14 sm:w-18" />
      </Link>
      <span className="hidden text-sm font-semibold text-foreground lg:inline">{t('CSP ERP')}</span>

      <div className="mx-auto hidden w-full max-w-md px-2 sm:block">
        <button
          type="button"
          onClick={onSearch}
          className="flex h-10 w-full items-center gap-2 rounded-lg border border-border bg-input px-3 text-sm text-muted-foreground transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring"
          aria-label={t('Search records, pages and actions')}
          aria-keyshortcuts="Control+K Meta+K"
        >
          <Search className="size-4" aria-hidden />
          <span className="flex-1 truncate text-start">{t('Search records, pages, actions')}</span>
          <Kbd>
            <Ltr>{isMac ? '⌘K' : 'Ctrl K'}</Ltr>
          </Kbd>
        </button>
      </div>

      <div className="ms-auto flex items-center sm:ms-0 sm:gap-1">
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={onSearch} aria-label={t('Search')}>
          <Search aria-hidden />
        </Button>

        <DropdownMenu>
          <Tooltip content={t('Quick create')}>
            <DropdownMenuTrigger asChild>
              <Button variant="primary" size="icon" aria-label={t('Quick create')} className="md:w-auto md:px-3">
                <Plus aria-hidden />
                <span className="hidden md:inline">{t('Create')}</span>
              </Button>
            </DropdownMenuTrigger>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('Quick create')}</DropdownMenuLabel>
            {quickCreate.map((q) => (
              <DropdownMenuItem key={q.key} onSelect={() => setQc(q)}>
                <q.icon aria-hidden />
                {t(q.key)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover open={apprOpen} onOpenChange={setApprOpen}>
          <Tooltip content={`${t('Approvals')} (${pending} ${t('pending')})`}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label={`${t('Approvals inbox')}, ${pending} ${t('pending')}`}>
                <Inbox aria-hidden />
                {pending > 0 && (
                  <span className="absolute end-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold text-primary-foreground" aria-hidden>
                    <Ltr>{pending}</Ltr>
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </Tooltip>
          <PopoverContent align="end" className="w-[min(24rem,calc(100vw-1.5rem))] p-0">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <p className="text-sm font-semibold">{t('Approvals inbox')}</p>
              <span className="text-xs text-muted-foreground">
                <Ltr>{pending}</Ltr> {t('pending')}
              </span>
            </div>
            <div className="p-1.5">
              <ApprovalsList onPick={() => setApprOpen(false)} />
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <Tooltip content={t('Notifications')}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label={`${t('Notifications')}, ${notifications.length} ${t('unread')}`}>
                <Bell aria-hidden />
                <span className="absolute end-2 top-2 size-2 rounded-full bg-danger-solid ring-2 ring-surface" aria-hidden />
              </Button>
            </PopoverTrigger>
          </Tooltip>
          <PopoverContent align="end" className="w-[min(24rem,calc(100vw-1.5rem))] p-0">
            <p className="border-b border-border-subtle px-4 py-3 text-sm font-semibold">{t('Notifications')}</p>
            <ul className="p-1.5">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link to={n.path} onClick={() => setNotifOpen(false)} className="flex gap-3 rounded-lg px-3 py-2.5 hover:bg-neutral-soft focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                    <span
                      className={cn(
                        'mt-1.5 size-2 shrink-0 rounded-full',
                        n.tone === 'warning' && 'bg-warning-solid',
                        n.tone === 'danger' && 'bg-danger-solid',
                        n.tone === 'success' && 'bg-success-solid',
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block text-sm text-foreground">{n.title}</span>
                      <span className="block text-xs text-muted-foreground">{n.meta}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="hidden gap-1.5 px-2.5 lg:inline-flex" aria-label={`${t('Branch')}: ${t(branch)}`}>
              <Building2 aria-hidden />
              <span className="max-w-28 truncate">{t(branch)}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('Switch branch')}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={branch} onValueChange={setBranch}>
              {branches.map((b) => (
                <DropdownMenuRadioItem key={b.id} value={b.id}>
                  <span className="flex-1">{t(b.id)}</span>
                  <span className="text-xs text-muted-foreground">{b.currency}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip content={theme === 'dark' ? t('Switch to light mode') : t('Switch to dark mode')}>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? t('Switch to light mode') : t('Switch to dark mode')}
          >
            {theme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
          </Button>
        </Tooltip>
        <Tooltip content={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}>
          <Button
            variant="ghost"
            className="hidden px-2.5 md:inline-flex"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            lang={lang === 'ar' ? 'en' : 'ar'}
          >
            <Languages aria-hidden />
            <span>{lang === 'ar' ? 'EN' : 'ع'}</span>
          </Button>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ms-1 inline-flex items-center gap-2 rounded-lg p-1 hover:bg-neutral-soft focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-11"
              aria-label={`${t('User menu')}: Priya Nair`}
            >
              <Avatar name="Priya Nair" tone="brand" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="px-2.5 py-2">
              <p className="text-sm font-semibold">Priya Nair</p>
              <p className="text-xs text-muted-foreground">
                {t(role === 'manager' ? 'Sales manager, approver' : 'Sales executive')} · {t(branch)}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t('Demo role')}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <DropdownMenuRadioItem value="manager">{t('Sales manager (can approve)')}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="executive">{t('Sales executive (view only)')}</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <div className="md:hidden">
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
                {theme === 'dark' ? t('Switch to light mode') : t('Switch to dark mode')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
                <Languages aria-hidden />
                {lang === 'ar' ? 'English' : 'العربية'}
              </DropdownMenuItem>
            </div>
            <div className="lg:hidden">
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t('Switch branch')}</DropdownMenuLabel>
              {branches.map((b) => (
                <DropdownMenuItem key={b.id} onSelect={() => setBranch(b.id)}>
                  {branch === b.id ? <Check aria-hidden /> : <Building2 aria-hidden />}
                  {t(b.id)}
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Wrench aria-hidden />
                {t('Settings')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => store.toast(t('Signed out (demo)'), 'info')}>
              <LogOut aria-hidden />
              {t('Sign out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <QuickCreateDialog kind={qc} onClose={() => setQc(null)} />
    </header>
  )
}
