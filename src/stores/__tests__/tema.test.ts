import { describe, expect, it, beforeEach } from "vitest"
import { resolusiTema, terapkanTema, dengarkanTemaSistem } from "@/lib/tema"

describe("resolusiTema", () => {
  it("sistem mengikuti OS", () => {
    expect(resolusiTema("sistem", true)).toBe("gelap")
    expect(resolusiTema("sistem", false)).toBe("terang")
  })
  it("pilihan eksplisit mengabaikan OS", () => {
    expect(resolusiTema("terang", true)).toBe("terang")
    expect(resolusiTema("gelap", false)).toBe("gelap")
  })
})

describe("terapkanTema DOM", () => {
  beforeEach(() => {
    document.documentElement.className = ""
    document.documentElement.style.colorScheme = ""
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      const el = document.createElement("meta")
      el.setAttribute("name", "theme-color")
      document.head.appendChild(el)
    }
  })

  it("menerapkan tema terang: hapus .dark, colorScheme light, theme-color #F4FBF8", () => {
    document.documentElement.classList.add("dark")
    const hasil = terapkanTema("terang")
    expect(hasil).toBe("terang")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe("terang")
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe("#F4FBF8")
  })

  it("menerapkan tema gelap: pasang .dark, colorScheme gelap, theme-color #141a17", () => {
    const hasil = terapkanTema("gelap")
    expect(hasil).toBe("gelap")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe("gelap")
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe("#141a17")
  })

  it("cleanup dengarkanTemaSistem menghentikan listener", () => {
    let dipanggil = 0
    const cleanup = dengarkanTemaSistem("sistem", () => { dipanggil++ })
    cleanup?.()
    expect(dipanggil).toBe(0)
  })
})
