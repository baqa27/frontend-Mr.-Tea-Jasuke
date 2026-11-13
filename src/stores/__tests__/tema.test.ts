import { describe, expect, it } from "vitest"
import { resolusiTema } from "../ui-store"

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
