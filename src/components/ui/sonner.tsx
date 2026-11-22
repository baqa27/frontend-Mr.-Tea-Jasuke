import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTema } from "@/stores/tema-store"
import { resolusiTema, type PilihanTema } from "@/lib/tema"

const Toaster = ({ ...props }: ToasterProps) => {
  const pilihan = useTema((s) => s.pilihan)
  const osGelap = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  const mapTema: Record<PilihanTema, "dark" | "light" | "system"> = { terang: "light", gelap: "dark", sistem: "system" }
const tema = mapTema[resolusiTema(pilihan, osGelap)]
  return (
    <Sonner
      theme={tema}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
