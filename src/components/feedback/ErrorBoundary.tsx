import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: (reset: () => void) => ReactNode
  resetKey?: unknown
}
interface State {
  error: Error | null
}

/** Galat render di satu bagian tidak menjatuhkan seluruh aplikasi (ERR-01) */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }
  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error)
  }
  reset = () => this.setState({ error: null })
  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback) return this.props.fallback(this.reset)
    return (
      <div role="alert" className="rounded-xl border border-bahaya/25 bg-bahaya-muda/50 p-5">
        <p className="font-semibold text-bahaya">Bagian ini gagal ditampilkan</p>
        <p className="mt-1 text-sm text-foreground/80">Muat ulang bagian ini. Bila terus terjadi, laporkan ke tim dengan tangkapan layar.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={this.reset}>
          Muat ulang bagian ini
        </Button>
      </div>
    )
  }
}
