import * as React from 'react'
import { ar } from '@/data/ar'

export type Lang = 'en' | 'ar'

export const LangContext = React.createContext<Lang>('en')

export function translate(lang: Lang, s: string) {
  if (lang !== 'ar') return s
  return (
    ar[s] ??
    s
      .replace(/^Today, /, 'اليوم، ')
      .replace(/^Yesterday, /, 'أمس، ')
      .replace(/^Tomorrow, /, 'غدًا، ')
      .replace(/^Allocated (\S+) and (.+)$/, 'خُصصت $1 و$2')
      .replace(/^(\d+) checks are still open\.$/, '$1 فحوصات ما زالت مفتوحة.')
      .replace(/^(\d+) checks open$/, '$1 فحوصات مفتوحة')
  )
}

/** Returns a translator for UI strings. Data such as record IDs and amounts pass through unchanged. */
export function useT() {
  const lang = React.useContext(LangContext)
  return React.useCallback((s: string) => translate(lang, s), [lang])
}

export function useLang() {
  return React.useContext(LangContext)
}

/** Keeps IDs, numbers and dates left to right inside RTL text. */
export function Ltr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <bdi dir="ltr" className={className}>
      {children}
    </bdi>
  )
}
