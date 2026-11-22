import { Suspense } from "react"
import { Outlet, ScrollRestoration, useLocation } from "react-router"
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary"
import { NetworkBanners } from "@/components/feedback/NetworkBanners"
import { PageSkeleton } from "@/components/feedback/states"
import { ChatbotPopup } from "@/features/assistant/ChatbotPopup"
import { useOnboarding } from "@/features/onboarding/tour"
import { BottomNav } from "./BottomNav"
import { BrandMark } from "./BrandMark"
import { ShiftChip } from "./ShiftChip"
import { Sidebar } from "./Sidebar"
import { StockBell } from "./StockBell"
import { UserMenu } from "./UserMenu"

export function AppShell() {
  const loc = useLocation()
  useOnboarding()
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* Pindah halaman mulai dari atas, kembali (back) memulihkan posisi sebelumnya. Jalan di router browser dan hash. */}
      <ScrollRestoration getKey={(l) => l.pathname} />
      <Sidebar className="no-print sticky top-0 hidden h-dvh lg:flex" />
      <div className="flex min-w-0 flex-col">
        <div className="sticky top-0 z-30">
          <NetworkBanners />
          <header className="no-print flex h-14 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
            <BrandMark compact className="lg:hidden" />
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <ShiftChip />
              <StockBell />
              <UserMenu className="lg:hidden" />
            </div>
          </header>
        </div>
        <main id="konten" className="print-full mx-auto w-full max-w-[1240px] min-w-0 flex-1 px-4 pt-5 pb-28 sm:px-6 lg:pt-7 lg:pb-12">
          <ErrorBoundary resetKey={loc.pathname}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
        <BottomNav className="lg:hidden" />
      </div>
      <ChatbotPopup />
    </div>
  )
}
