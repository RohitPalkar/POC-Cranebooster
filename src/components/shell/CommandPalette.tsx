import * as React from 'react'
import { Command } from 'cmdk'
import { Dialog as D } from 'radix-ui'
import { useNavigate } from 'react-router'
import { CornerDownLeft, FileText, Search } from 'lucide-react'
import { allRecords, QUOTE } from '@/data/records'
import { itemPath, modules } from '@/data/nav'
import { workspaces } from '@/data/workspaces'
import { recordPath } from '@/lib/paths'
import { useStore } from '@/state/store'
import { Ltr } from '@/state/i18n'
import { Kbd } from '@/components/ui/controls'

const itemCls = 'flex min-h-11 cursor-default items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground outline-none data-[selected=true]:bg-neutral-soft [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground'
const groupCls = '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground'

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate()
  const { recents, lastTab } = useStore()
  const [q, setQ] = React.useState('')
  React.useEffect(() => {
    if (open) setQ('')
  }, [open])
  const go = (path: string) => {
    onOpenChange(false)
    navigate(path)
  }
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-overlay animate-in" />
        <D.Content className="fixed top-[12vh] left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-lg animate-in" aria-describedby={undefined}>
          <D.Title className="sr-only">Command palette</D.Title>
          <Command label="Command palette" loop>
            <div className="flex items-center gap-2 border-b border-border-subtle px-4">
              <Search className="size-4 text-muted-foreground" aria-hidden />
              <Command.Input autoFocus value={q} onValueChange={setQ} placeholder="Type a record ID or page…" className="h-14 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground" />
              <Kbd>Esc</Kbd>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">No results. Try ENQ-1042, BK-2207 or CR-025.</Command.Empty>
              {!q && (
                <Command.Group heading="Recent records" className={groupCls}>
                  {recents.map((r) => (
                    <Command.Item key={r.id} value={`recent ${r.id}`} onSelect={() => go(r.path)} className={itemCls}>
                      <FileText aria-hidden />
                      <Ltr className="font-semibold tabular">{r.id}</Ltr>
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.type}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              {!!q && (
                <>
                  <Command.Group heading="Records" className={groupCls}>
                    <Command.Item value={`${QUOTE} quotation pride`} onSelect={() => go('/crm/enquiries/ENQ-1042/quotations?quote=v3')} className={itemCls}>
                      <FileText aria-hidden />
                      <Ltr className="font-semibold tabular">{QUOTE}</Ltr>
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">Quotation v3 · Pride Group</span>
                    </Command.Item>
                    {allRecords.map((r) => (
                      <Command.Item key={r.id} value={`${r.id} ${r.name} ${workspaces[r.type].label}`} onSelect={() => go(recordPath(r.id, lastTab[r.id]))} className={itemCls}>
                        <FileText aria-hidden />
                        <Ltr className="font-semibold tabular">{r.id}</Ltr>
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{workspaces[r.type].label}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                  <Command.Group heading="Pages" className={groupCls}>
                    {modules.flatMap((m) =>
                      m.items.map((it) => (
                        <Command.Item key={`${m.id}/${it.id}`} value={`${it.label} ${m.label}`} onSelect={() => go(itemPath(m.id, it.id))} className={itemCls}>
                          <span className="flex-1">{it.label}</span>
                          <span className="text-xs text-muted-foreground">{m.label}</span>
                        </Command.Item>
                      )),
                    )}
                  </Command.Group>
                </>
              )}
            </Command.List>
            <div className="flex items-center gap-3 border-t border-border-subtle px-4 py-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CornerDownLeft className="size-3.5" aria-hidden /> to open
              </span>
              <span>↑ ↓ to move</span>
            </div>
          </Command>
        </D.Content>
      </D.Portal>
    </D.Root>
  )
}
