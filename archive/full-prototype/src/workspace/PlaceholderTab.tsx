import * as React from 'react'
import { CircleCheck, Clock } from 'lucide-react'
import { useWorkspace } from './context'
import { Panel, KeyValues } from './ui'
import { Field, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Ltr, useT } from '@/state/i18n'
import { useStore } from '@/state/store'

/** Shows the designed tab for one record and placeholder content for the rest of its type. */
export function only(id: string, C: React.ComponentType) {
  return function HeroTab() {
    const { record } = useWorkspace()
    return record.id === id ? <C /> : <PlaceholderTab />
  }
}

/** Light placeholder content for workspaces that are not fully designed yet. */
export function PlaceholderTab() {
  const t = useT()
  const { cfg, record, tab, setDirty, readOnly } = useWorkspace()
  const store = useStore()
  const label = cfg.tabs.find((x) => x.id === tab)?.label ?? ''
  const [note, setNote] = React.useState('')
  const dirty = (store.dirty[record.id] ?? []).includes(tab)
  const seed = (record.id.charCodeAt(record.id.length - 1) + tab.length) % 3
  const rows = [
    { title: `${t(label)} ${t('entry')} 1`, meta: '10 Nov 2025 · ' + record.owner, done: true },
    { title: `${t(label)} ${t('entry')} 2`, meta: '7 Nov 2025 · Imran Shaikh', done: seed > 0 },
    { title: `${t(label)} ${t('entry')} 3`, meta: '3 Nov 2025 · Meera Joshi', done: seed > 1 },
  ]
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Panel title={t(label)} description={`${t(cfg.label)} · ${record.id}`} className="xl:col-span-2">
        <KeyValues items={record.facts.map((f) => ({ label: f.label, value: f.ltr ? f.value : t(f.value), ltr: f.ltr }))} />
        <ul className="mt-5 flex flex-col divide-y divide-border-subtle rounded-lg border border-border-subtle">
          {rows.map((r) => (
            <li key={r.title} className="flex items-center gap-3 px-4 py-3">
              {r.done ? <CircleCheck className="size-4 text-success" aria-hidden /> : <Clock className="size-4 text-muted-foreground" aria-hidden />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  <Ltr>{r.meta}</Ltr>
                </p>
              </div>
              <Badge tone={r.done ? 'success' : 'neutral'} size="sm">
                {r.done ? t('Done') : t('Open')}
              </Badge>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title={t('Notes')} description={t('Edits here mark the tab as unsaved')}>
        <Field label={t('Internal note')} htmlFor={`note-${tab}`}>
          <Textarea
            id={`note-${tab}`}
            value={note}
            disabled={readOnly}
            onChange={(e) => {
              setNote(e.target.value)
              setDirty(tab, e.target.value.length > 0)
            }}
            placeholder={t('Add context for your team')}
          />
        </Field>
        <div className="mt-3 flex justify-end gap-2">
          <Button
            size="sm"
            variant="primary"
            disabled={!dirty}
            onClick={() => {
              setDirty(tab, false)
              setNote('')
              store.toast(t('Note saved'))
            }}
          >
            {t('Save note')}
          </Button>
        </div>
      </Panel>
    </div>
  )
}
