import { useId } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FieldProps {
  label: React.ReactNode
  error?: string
  hint?: React.ReactNode
  help?: React.ReactNode
  className?: string
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode
}

/** Label, kontrol, petunjuk, dan pesan galat yang terhubung lewat aria-describedby */
export function Field({ label, error, hint, help, className, children }: FieldProps) {
  const id = useId()
  const descId = error || hint ? `${id}-desc` : undefined
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-center gap-1">
        <Label htmlFor={id}>{label}</Label>
        {help}
      </div>
      {children({ id, "aria-invalid": !!error, "aria-describedby": descId })}
      {error ? (
        <p id={descId} className="text-sm text-bahaya">
          {error}
        </p>
      ) : hint ? (
        <p id={descId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
