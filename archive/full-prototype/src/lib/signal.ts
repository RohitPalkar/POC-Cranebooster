import * as React from 'react'

/** Tiny shared state for demo-only controls that live outside the main store. */
export function createSignal<T>(initial: T) {
  let value = initial
  const subs = new Set<() => void>()
  const set = (v: T) => {
    value = v
    subs.forEach((s) => s())
  }
  const use = () =>
    React.useSyncExternalStore(
      (cb) => {
        subs.add(cb)
        return () => subs.delete(cb)
      },
      () => value,
    )
  return { use, set, get: () => value }
}
