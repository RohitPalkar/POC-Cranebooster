import * as React from 'react'

export function useMediaQuery(query: string) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false)
  const [matches, setMatches] = React.useState(get)
  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const on = () => setMatches(mql.matches)
    on()
    mql.addEventListener('change', on)
    return () => mql.removeEventListener('change', on)
  }, [query])
  return matches
}

/** 'mobile' < 768, 'rail' 768 to 1279, 'full' >= 1280 */
export function useLayoutMode() {
  const md = useMediaQuery('(min-width: 768px)')
  const xl = useMediaQuery('(min-width: 1280px)')
  return !md ? 'mobile' : xl ? 'full' : 'rail'
}
