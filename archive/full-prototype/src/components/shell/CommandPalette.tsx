import * as React from 'react'
import { Command } from 'cmdk'
import { Dialog as D } from 'radix-ui'
import { useNavigate } from 'react-router'
import { ArrowRight, CornerDownLeft, FileText, Languages, LayoutGrid, Moon, Plus, Search, Siren } from 'lucide-react'
import { allRecords } from '@/data/records'
import { modules, modulePath, itemPath } from '@/data/nav'
import { workspaces } from '@/data/workspaces'
import { recordPath, defaultTab } from '@/lib/paths'
import { useStore } from '@/state/store'
import { Ltr, useT } from '@/state/i18n'
import { Kbd } from '@/components/ui/controls'

const itemCls =
  'flex min-h-11 cursor-default items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground outline-none data-[selected=true]:bg-neutral-soft [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground'
const groupCls =
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground'

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const t = useT()
  const navigate = useNavigate()
  const store = useStore()
  const go = (path: string) => {
    onOpenChange(false)
    navigate(path)
  }
  const tabFor = (id: string) => (id === 'ENQ-1042' ? 'quotations' : (store.lastTab[id] ?? defaultTab(id)))

  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-overlay animate-in" />
        <D.Content
          className="fixed top-[12vh] left-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-lg animate-in"
          aria-describedby={undefined}
        >
          <D.Title className="sr-only">{t('Command palette')}</D.Title>
          <Command label={t('Command palette')} loop>
            <div className="flex items-center gap-2 border-b border-border-subtle px-4">
              <Search className="size-4 text-muted-foreground" aria-hidden />
              <Command.Input
                autoFocus
                placeholder={t('Type a record ID, page or action…')}
                className="h-14 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Kbd>Esc</Kbd>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">{t('No results. Try ENQ-1042, QT-2231 or BK-2207.')}</Command.Empty>
              <Command.Group heading={t('Records')} className={groupCls}>
                <Command.Item value="QT-2231 quotation vardhman discount" onSelect={() => go('/crm/enquiries/ENQ-1042/quotations?quote=v2')} className={itemCls}>
                  <FileText aria-hidden />
                  <Ltr className="font-semibold tabular">QT-2231</Ltr>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{t('Quotation')} v2 · Vardhman Buildcon</span>
                  <span className="text-xs text-muted-foreground">{t('Opens')} ENQ-1042 › {t('Quotations')}</span>
                </Command.Item>
                {allRecords.map((r) => {
                  const cfg = workspaces[r.type]
                  const tab = tabFor(r.id)
                  const tabLabel = cfg.tabs.find((x) => x.id === tab)?.label ?? ''
                  return (
                    <Command.Item key={r.id} value={`${r.id} ${r.name} ${cfg.label}`} onSelect={() => go(recordPath(r.id, tab))} className={itemCls}>
                      <FileText aria-hidden />
                      <Ltr className="font-semibold tabular">{r.id}</Ltr>
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">{r.name}</span>
                      <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                        {t(cfg.label)} › {t(tabLabel)}
                      </span>
                    </Command.Item>
                  )
                })}
              </Command.Group>
              <Command.Group heading={t('Actions')} className={groupCls}>
                {[
                  { label: 'New quotation', hint: 'ENQ-1042', icon: Plus, run: () => go('/crm/enquiries/ENQ-1042/quotations/new') },
                  { label: 'New enquiry', hint: 'CRM & Sales', icon: Plus, run: () => go('/crm/enquiries') },
                  { label: 'New booking', hint: 'Bookings', icon: Plus, run: () => go('/bookings/bookings') },
                  { label: 'Report breakdown', hint: 'CR-050', icon: Siren, run: () => go('/fleet/cranes/CR-050/maintenance-breakdowns') },
                  {
                    label: store.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
                    icon: Moon,
                    run: () => {
                      store.setTheme(store.theme === 'dark' ? 'light' : 'dark')
                      onOpenChange(false)
                    },
                  },
                  {
                    label: store.lang === 'ar' ? 'Switch to English' : 'Switch to Arabic',
                    icon: Languages,
                    run: () => {
                      store.setLang(store.lang === 'ar' ? 'en' : 'ar')
                      onOpenChange(false)
                    },
                  },
                ].map((a) => (
                  <Command.Item key={a.label} value={`${a.label} ${t(a.label)}`} onSelect={a.run} className={itemCls}>
                    <a.icon aria-hidden />
                    <span className="flex-1">{t(a.label)}</span>
                    {a.hint && <span className="text-xs text-muted-foreground">{t(a.hint)}</span>}
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading={t('Pages')} className={groupCls}>
                {modules.flatMap((m) => [
                  <Command.Item key={m.id} value={`${m.label} ${t(m.label)} overview`} onSelect={() => go(modulePath(m.id))} className={itemCls}>
                    <LayoutGrid aria-hidden />
                    <span className="flex-1">{t(m.label)}</span>
                    <ArrowRight className="dir-icon rtl:-scale-x-100" aria-hidden />
                  </Command.Item>,
                  ...m.items.map((it) => (
                    <Command.Item key={`${m.id}/${it.id}`} value={`${it.label} ${t(it.label)} ${m.label}`} onSelect={() => go(itemPath(m.id, it.id))} className={itemCls}>
                      <span className="size-4" aria-hidden />
                      <span className="flex-1">{t(it.label)}</span>
                      <span className="text-xs text-muted-foreground">{t(m.label)}</span>
                    </Command.Item>
                  )),
                ])}
              </Command.Group>
            </Command.List>
            <div className="flex items-center gap-3 border-t border-border-subtle px-4 py-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CornerDownLeft className="size-3.5" aria-hidden /> {t('to open')}
              </span>
              <span>↑ ↓ {t('to move')}</span>
            </div>
          </Command>
        </D.Content>
      </D.Portal>
    </D.Root>
  )
}
