import * as React from 'react'
import { Link } from 'react-router'
import { Bell, Inbox, LogOut, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, Kbd } from '@/components/ui/controls'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/state/store'
import { Ltr } from '@/state/i18n'
import { approvalItems, notifications } from '@/data/approvals'
import { cn } from '@/lib/utils'

export function TopBar({ onSearch }: { onSearch: () => void }) {
  const { approvals, later } = useStore()
  const [apprOpen, setApprOpen] = React.useState(false)
  const [notifOpen, setNotifOpen] = React.useState(false)
  const pending = Object.values(approvals).filter((s) => s === 'pending').length
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform)
  return (
    <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-4">
      <button
        type="button"
        onClick={onSearch}
        aria-label="Search records, pages and actions"
        aria-keyshortcuts="Control+K Meta+K"
        className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-input px-3 text-sm text-muted-foreground transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Search className="size-4" aria-hidden />
        <span className="flex-1 truncate text-start">Search records, pages, actions</span>
        <Kbd>{isMac ? '⌘K' : 'Ctrl K'}</Kbd>
      </button>
      <div className="ms-auto flex items-center gap-1">
        <Popover open={apprOpen} onOpenChange={setApprOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={`Approvals inbox, ${pending} pending`}>
              <Inbox aria-hidden />
              {pending > 0 && (
                <span className="absolute end-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold text-primary-foreground" aria-hidden>
                  <Ltr>{pending}</Ltr>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <p className="border-b border-border-subtle px-4 py-3 text-sm font-semibold">Approvals inbox</p>
            <ul className="p-1.5">
              {approvalItems.map((a) => (
                <li key={a.id}>
                  <Link to={a.path} onClick={() => setApprOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-neutral-soft focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{a.title}</span>
                      <span className="block text-xs text-muted-foreground">{a.meta}</span>
                    </span>
                    {approvals[a.id] === 'pending' ? <Badge tone="warning" size="sm">Pending</Badge> : approvals[a.id] === 'approved' ? <Badge tone="success" size="sm">Approved</Badge> : <Badge tone="danger" size="sm">Rejected</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${notifications.length} unread`}>
              <Bell aria-hidden />
              <span className="absolute end-2 top-2 size-2 rounded-full bg-danger-solid ring-2 ring-surface" aria-hidden />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <p className="border-b border-border-subtle px-4 py-3 text-sm font-semibold">Notifications</p>
            <ul className="p-1.5">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link to={n.path} onClick={() => setNotifOpen(false)} className="flex gap-3 rounded-lg px-3 py-2.5 hover:bg-neutral-soft focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                    <span className={cn('mt-1.5 size-2 shrink-0 rounded-full bg-warning-solid')} aria-hidden />
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
            <button type="button" aria-label="User menu: Rakesh Kulkarni" className="ms-1 inline-flex items-center rounded-lg p-1 hover:bg-neutral-soft focus-visible:outline-2 focus-visible:outline-ring">
              <Avatar name="Rakesh Kulkarni" tone="brand" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="px-2.5 py-2">
              <p className="text-sm font-semibold">Rakesh Kulkarni</p>
              <p className="text-xs text-muted-foreground">Admin · Kulkarni Cranes Pvt Ltd</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={later}>
              <LogOut aria-hidden />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
