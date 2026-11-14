import { CloudOff, RotateCcw, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toApiError } from "@/lib/api-error"
import { cn } from "@/lib/utils"

export function EmptyState({ icon: Icon = SearchX, title, children, action, className }: { icon?: React.ElementType; title: string; children?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-start gap-3 rounded-xl border border-dashed bg-card/60 px-5 py-8 sm:items-center sm:text-center", className)}>
      <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="max-w-sm">
        <p className="font-semibold">{title}</p>
        {children && <div className="mt-1 text-sm text-muted-foreground">{children}</div>}
      </div>
      {action}
    </div>
  )
}

export function ErrorState({ error, onRetry, title = "Data belum bisa dimuat", className }: { error: unknown; onRetry?: () => void; title?: string; className?: string }) {
  const e = toApiError(error)
  return (
    <div role="alert" className={cn("flex flex-col items-start gap-3 rounded-xl border border-bahaya/25 bg-bahaya-muda/50 px-5 py-6", className)}>
      <div>
        <p className="font-semibold text-bahaya">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{e.message}</p>
        {e.requestId && <p className="mt-1 text-xs text-muted-foreground">Kode kejadian: {e.requestId}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw />
          Coba lagi
        </Button>
      )}
    </div>
  )
}

/** Dipakai widget AI: galatnya tidak menahan bagian lain di halaman (T4, FC-06, AST-09) */
export function AiUnavailableCard({ title, onRetry, children }: { title: string; onRetry?: () => void; children?: React.ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-start gap-3 rounded-xl border bg-card px-5 py-6">
      <span className="grid size-10 place-items-center rounded-full bg-warn-muda text-warn">
        <CloudOff className="size-5" aria-hidden />
      </span>
      <div className="max-w-md">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {children ?? "Layanan AI sedang tidak tersedia. Pencatatan pesanan, stok, dan shift tetap berjalan normal."}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw />
          Coba lagi
        </Button>
      )}
    </div>
  )
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="grid gap-2" aria-busy="true" aria-label="Memuat">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-lg" />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Memuat halaman">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
