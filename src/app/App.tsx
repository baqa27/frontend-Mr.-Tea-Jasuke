import { Suspense, useEffect } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router"
import { authApi } from "@/api/auth"
import { PageSkeleton } from "@/components/feedback/states"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { bersihkanSesi } from "@/features/auth/session"
import { setUnauthorizedHandler } from "@/lib/axios"
import { queryClient } from "@/lib/query-client"
import { router } from "./router"

setUnauthorizedHandler(() => {
  bersihkanSesi()
  router.navigate("/login?alasan=sesi", { replace: true })
})

export function App() {
  useEffect(() => {
    // Bangunkan backend yang tertidur di Render Free sejak aplikasi dibuka (ERR-02)
    authApi.health().catch(() => undefined)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <Suspense fallback={<div className="p-6"><PageSkeleton /></div>}>
          <RouterProvider router={router} />
        </Suspense>
        <Toaster position="top-center" richColors={false} closeButton toastOptions={{ classNames: { toast: "font-sans" } }} />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
