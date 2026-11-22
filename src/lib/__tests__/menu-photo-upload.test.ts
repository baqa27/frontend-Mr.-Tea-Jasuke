import { describe, expect, it } from "vitest"
import { pesanGalatFotoMenu } from "../menu-photo-upload"

describe("pesanGalatFotoMenu", () => {
  it("menerima JPEG, PNG, dan WebP hingga 5 MB", () => {
    expect(pesanGalatFotoMenu({ type: "image/jpeg", size: 5 * 1024 * 1024 })).toBeUndefined()
    expect(pesanGalatFotoMenu({ type: "image/png", size: 1 })).toBeUndefined()
    expect(pesanGalatFotoMenu({ type: "image/webp", size: 1 })).toBeUndefined()
  })

  it("menolak format dan ukuran tidak valid dengan pesan perbaikan", () => {
    expect(pesanGalatFotoMenu({ type: "image/gif", size: 1 })).toBe("Pilih foto berformat JPEG, PNG, atau WebP.")
    expect(pesanGalatFotoMenu({ type: "image/png", size: 5 * 1024 * 1024 + 1 })).toBe("Ukuran foto maksimal 5 MB. Pilih foto yang lebih kecil.")
  })
})
