import * as React from 'react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground transition-shadow focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 read-only:bg-surface-subtle aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, 'h-10 pointer-coarse:h-11', className)} {...props} />
  ),
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(fieldBase, 'min-h-24 py-2', className)} {...props} />,
)
Textarea.displayName = 'Textarea'

export function Label({ className, required, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn('text-sm font-medium text-foreground', className)} {...props}>
      {children}
      {required && (
        <span className="ms-0.5 text-danger" aria-hidden>
          *
        </span>
      )}
    </label>
  )
}

export function Field({
  label,
  htmlFor,
  required,
  helper,
  error,
  children,
  className,
}: {
  label: string
  htmlFor: string
  required?: boolean
  helper?: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : (
        helper && (
          <p id={`${htmlFor}-helper`} className="text-xs text-muted-foreground">
            {helper}
          </p>
        )
      )}
    </div>
  )
}
