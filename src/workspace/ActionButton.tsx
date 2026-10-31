import * as React from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { useT } from '@/state/i18n'

/** A button that stays focusable when unavailable and always explains why. */
export function ActionButton({ disabledReason, onClick, children, ...props }: ButtonProps & { disabledReason?: string | null }) {
  const id = React.useId()
  const t = useT()
  if (!disabledReason) return <Button onClick={onClick} {...props}>{children}</Button>
  return (
    <Tooltip content={t(disabledReason)}>
      <Button {...props} aria-disabled aria-describedby={id} onClick={(e) => e.preventDefault()}>
        {children}
        <span id={id} className="sr-only">
          {t(disabledReason)}
        </span>
      </Button>
    </Tooltip>
  )
}
