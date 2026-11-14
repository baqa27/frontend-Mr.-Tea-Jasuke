import { lazy } from "react"
import { createBrowserRouter, createHashRouter, type RouteObject } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { GuestOnly, RequireActiveShift, RequireAuth, RequireRole, RoleRedirect } from "@/components/guards/guards"
import { ForbiddenPage, NotFoundPage } from "@/features/misc/pages"
import { DevTokens } from "@/components/dev/DevTokens"
import { env } from "@/lib/env"
import { flags } from "@/lib/flags"

// Setiap halaman dimuat lazy agar bundle awal kecil (NAV-04)
const LoginPage = lazy(() => import("@/features/auth/LoginPage"))
const ShiftPage = lazy(() => import("@/features/shift/ShiftPage"))
const CloseShiftPage = lazy(() => import("@/features/shift/CloseShiftPage"))
const ShiftRecapPage = lazy(() => import("@/features/shift/ShiftRecapPage"))
const PosPage = lazy(() => import("@/features/pos/PosPage"))
const OrdersPage = lazy(() => import("@/features/orders/OrdersPage"))
const StockPage = lazy(() => import("@/features/stock/StockPage"))
const StockInPage = lazy(() => import("@/features/stock/StockInPage"))
const OwnerHomePage = lazy(() => import("@/features/owner-home/OwnerHomePage"))
const RecapListPage = lazy(() => import("@/features/recap/RecapListPage"))
const RecapDetailPage = lazy(() => import("@/features/recap/RecapDetailPage"))
const MenuMasterPage = lazy(() => import("@/features/master/MenuMasterPage"))
const IngredientMasterPage = lazy(() => import("@/features/master/IngredientMasterPage"))
const ForecastPage = lazy(() => import("@/features/forecast/ForecastPage"))
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"))
const AssistantPage = lazy(() => import("@/features/assistant/AssistantPage"))
const HelpPage = lazy(() => import("@/features/help/HelpPage"))

const routes: RouteObject[] = [
  { element: <GuestOnly />, children: [{ path: "/login", element: <LoginPage /> }] },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <RoleRedirect /> },
          { path: "/shift", element: <ShiftPage /> },
          { path: "/shift/:id/rekap", element: <ShiftRecapPage /> },
          {
            element: <RequireActiveShift />,
            children: [
              { path: "/pos", element: <PosPage /> },
              { path: "/stok/barang-masuk", element: <StockInPage /> },
              { path: "/shift/tutup", element: <CloseShiftPage /> },
            ],
          },
          { path: "/pesanan", element: <OrdersPage /> },
          { path: "/stok", element: <StockPage /> },
          ...(flags.assistant ? [{ path: "/asisten", element: <AssistantPage /> }] : []),
          { path: "/bantuan", element: <HelpPage /> },
          ...(import.meta.env.DEV ? [{ path: "/dev/tokens", element: <DevTokens /> }] : []),
          {
            path: "/pemilik",
            element: <RequireRole peran="pemilik" />,
            children: [
              { path: "beranda", element: <OwnerHomePage /> },
              { path: "rekap", element: <RecapListPage /> },
              { path: "rekap/:tanggal", element: <RecapDetailPage /> },
              { path: "perkiraan-belanja", element: <ForecastPage /> },
              ...(flags.dashboard ? [{ path: "dasbor", element: <DashboardPage /> }] : []),
              { path: "master/menu", element: <MenuMasterPage /> },
              { path: "master/bahan", element: <IngredientMasterPage /> },
            ],
          },
          { path: "/403", element: <ForbiddenPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

/** VITE_ROUTER=hash dipakai untuk preview statis yang tidak mendukung rewrite SPA */
export const router = env.router === "hash" ? createHashRouter(routes) : createBrowserRouter(routes)
