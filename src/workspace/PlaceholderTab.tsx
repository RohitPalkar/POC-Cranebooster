import * as React from 'react'
import { useWorkspace } from './context'

/** Shows the designed tab for one record and placeholder content for the rest of its type. */
export function only(id: string, C: React.ComponentType) {
  return function HeroTab() {
    const { record } = useWorkspace()
    return record.id === id ? <C /> : <PlaceholderTab />
  }
}

export function Skeleton() {
  return (
    <ul aria-label="Placeholder content" className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <li key={i} aria-hidden className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
          <span className="h-3 w-28 rounded bg-neutral-soft" />
          <span className="h-3 flex-1 rounded bg-neutral-soft" />
          <span className="h-3 w-20 rounded bg-neutral-soft" />
        </li>
      ))}
    </ul>
  )
}

/** Tabs outside the demo path: title, one line, then skeleton rows. Actions come from the shell. */
export function PlaceholderTab() {
  const { cfg, tab } = useWorkspace()
  const label = cfg.tabs.find((x) => x.id === tab)?.label ?? ''
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">{label}</h2>
        <p className="text-sm text-muted-foreground">Placeholder for the demo. This tab keeps its place in the {cfg.label.toLowerCase()} workspace.</p>
      </div>
      <Skeleton />
    </div>
  )
}
