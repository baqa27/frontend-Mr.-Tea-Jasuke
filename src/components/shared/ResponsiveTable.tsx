import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  header: React.ReactNode
  /** Label teks untuk kartu ponsel bila header berisi elemen interaktif */
  label?: string
  cell: (row: T) => React.ReactNode
  align?: "left" | "right" | "center"
  /** title: baris judul kartu, aside: kanan judul, row: label dan nilai, hidden: tidak tampil di ponsel */
  mobile?: "title" | "aside" | "row" | "hidden"
  className?: string
  headerClassName?: string
}

interface Props<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  rowClassName?: (row: T) => string | undefined
  caption?: string
  dense?: boolean
  /** Tanpa bingkai di layar lebar, untuk tabel di dalam Panel */
  flush?: boolean
}

/** Tabel di layar lebar, kartu di bawah 768 px (NAV-06) */
export function ResponsiveTable<T>({ rows, columns, rowKey, onRowClick, rowClassName, caption, dense, flush }: Props<T>) {
  const title = columns.filter((c) => c.mobile === "title")
  const aside = columns.filter((c) => c.mobile === "aside")
  const rowCols = columns.filter((c) => !c.mobile || c.mobile === "row")
  const align = (a?: string) => (a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left")

  return (
    <>
      <div className={cn("max-w-full hidden overflow-x-auto md:block", !flush && "rounded-xl border bg-card")}>
        <table className="w-full text-sm table-fixed">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={cn("px-4 font-semibold whitespace-nowrap text-muted-foreground", dense ? "h-9" : "h-10", align(c.align), c.headerClassName)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={rowKey(r)}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                onKeyDown={onRowClick ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onRowClick(r)) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                className={cn(
                  "border-b last:border-0",
                  onRowClick && "cursor-pointer hover:bg-accent/60 focus-visible:bg-accent focus-visible:outline-none",
                  rowClassName?.(r),
                )}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 align-middle", dense ? "py-2" : "py-3", align(c.align), c.className)}>
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className={cn("md:hidden", flush ? "divide-y" : "grid gap-2")} aria-label={caption}>
        {rows.map((r) => {
          const Comp = onRowClick ? "button" : "div"
          return (
            <li key={rowKey(r)}>
              <Comp
                {...(onRowClick ? { type: "button" as const, onClick: () => onRowClick(r) } : {})}
                className={cn("block w-full text-left", flush ? "px-4 py-3" : "rounded-xl border bg-card p-3.5", onRowClick && "active:bg-accent", rowClassName?.(r))}
              >
                {(title.length > 0 || aside.length > 0) && (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 font-semibold">{title.map((c) => <div key={c.key}>{c.cell(r)}</div>)}</div>
                    {aside.length > 0 && <div className="shrink-0 text-right">{aside.map((c) => <div key={c.key}>{c.cell(r)}</div>)}</div>}
                  </div>
                )}
                {rowCols.length > 0 && (
                  <dl className="mt-2 grid gap-1 text-sm">
                    {rowCols.map((c) => (
                      <div key={c.key} className="flex items-baseline justify-between gap-3">
                        <dt className="text-muted-foreground">{c.label ?? c.header}</dt>
                        <dd className="text-right">{c.cell(r)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </Comp>
            </li>
          )
        })}
      </ul>
    </>
  )
}
