const v = import.meta.env

const on = (value: string | undefined, fallback: boolean) =>
  value === undefined || value === "" ? fallback : value === "true"

/** Feature flag dibaca sekali saat build. Ubah lewat variabel lingkungan, bukan kode. */
export const flags = {
  dashboard: on(v.VITE_FLAG_DASHBOARD, true),
  riskModel: on(v.VITE_FLAG_RISK_MODEL, false),
  assistant: on(v.VITE_FLAG_ASSISTANT, true),
}
