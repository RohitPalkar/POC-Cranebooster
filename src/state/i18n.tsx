import * as React from 'react'

/** The POC is English only. Kept as a seam so the archived Arabic dictionary can return in the full build. */
export function useT() {
  return React.useCallback((s: string) => s, [])
}

/** Keeps IDs and numbers in one run. */
export function Ltr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <bdi dir="ltr" className={className}>
      {children}
    </bdi>
  )
}
