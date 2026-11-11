/**
 * Skenario uji untuk mode mock. Aktifkan lewat query string sekali, misalnya ?mock=ai-down,
 * lalu nilainya disimpan di sessionStorage. Pakai ?mock=normal untuk kembali.
 *  - ai-down     : endpoint AI (perkiraan, chat, risiko) membalas 503
 *  - gemini-down : chat dijawab model cadangan
 *  - slow        : semua permintaan dalam 40 detik pertama menunggu server bangun, meniru cold start Render
 *  - empty       : semua daftar kosong
 */
export type Skenario = "normal" | "ai-down" | "gemini-down" | "slow" | "empty"
const KUNCI = "mrtea-mock-scenario"

function baca(): Skenario {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("mock") ??
      new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("mock")
    if (fromUrl) sessionStorage.setItem(KUNCI, fromUrl)
    return (sessionStorage.getItem(KUNCI) as Skenario) || "normal"
  } catch {
    return "normal"
  }
}

const aktif = baca()
/** Pada skenario slow, server dianggap tidur dan baru bangun 40 detik setelah halaman dibuka (cold start Render) */
const LAMA_BANGUN_MS = 40_000
const bangunPada = aktif === "slow" ? Date.now() + LAMA_BANGUN_MS : 0

export const scenario = () => aktif
/** Sisa waktu sampai server tiruan bangun. Permintaan yang dikirim sebelum itu menunggu sampai server bangun. */
export function ambilJedaLambat(): number {
  return Math.max(0, bangunPada - Date.now())
}
