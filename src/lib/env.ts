const raw = import.meta.env

const bool = (v: string | undefined, fallback = false) =>
  v === undefined || v === "" ? fallback : v === "true" || v === "1"

export interface DemoAccount {
  label: string
  username: string
  password: string
}

function parseDemoAccounts(v: string | undefined): DemoAccount[] {
  if (!v) return []
  return v
    .split(";")
    .map((row) => row.split("|"))
    .filter((p) => p.length === 3)
    .map(([label, username, password]) => ({ label, username, password }))
}

export const env = {
  apiBaseUrl: raw.VITE_API_BASE_URL ?? "/api/v1",
  /** Sama persis dengan pengecekan statis di lib/axios.ts: hanya "true" yang menyalakan mock */
  useMock: raw.VITE_USE_MOCK === "true",
  appEnv: (raw.VITE_APP_ENV ?? "development") as "development" | "preview" | "production",
  router: (raw.VITE_ROUTER ?? "browser") as "browser" | "hash",
  dashboardUrl: raw.VITE_DASHBOARD_URL ?? "",
  dashboardSimulasi: bool(raw.VITE_DASHBOARD_SIMULASI, true),
  showDemoAccounts: bool(raw.VITE_SHOW_DEMO_ACCOUNTS),
  demoAccounts: parseDemoAccounts(raw.VITE_DEMO_ACCOUNTS),
  userManualUrl: raw.VITE_USER_MANUAL_URL ?? "",
}

export const isProduction = env.appEnv === "production"
