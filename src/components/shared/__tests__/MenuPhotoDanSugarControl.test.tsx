import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { useState } from "react"
import type { TingkatGula } from "@/types/domain"
import { MenuPhoto } from "../MenuPhoto"
import { SugarControl } from "../SugarControl"

describe("MenuPhoto", () => {
  it("memakai foto lokal per menuId dan beri label Ilustrasi AI bila tanpa fotoUrl", () => {
    render(<MenuPhoto id="m-teh-ori" kategori="teh" nama="Es Teh Manis" />)
    const img = containerImg()
    expect(img).toHaveAttribute("src", "/menu/m-teh-ori.webp")
    expect(screen.getByText("Ilustrasi AI")).toBeInTheDocument()
  })

  it("ilustrasi kategori, tanpa img, bila menuId dan fotoUrl kosong", () => {
    const { container } = render(<MenuPhoto kategori="teh" nama="Es Teh Manis" />)
    expect(container.querySelector("img")).not.toBeInTheDocument()
    expect(container.querySelector("svg")).toBeInTheDocument()
    expect(screen.getByText("Ilustrasi AI")).toBeInTheDocument()
  })

  it("menampilkan fallback ilustrasi jika gambar gagal memuat", () => {
    const { container } = render(<MenuPhoto fotoUrl="/foto-rusak.jpg" kategori="jasuke" nama="Jasuke Susu" />)
    const img = containerImg()
    expect(img).toBeInTheDocument()
    fireEvent.error(img)
    expect(container.querySelector("img")).not.toBeInTheDocument()
    expect(container.querySelector("svg")).toBeInTheDocument()
    expect(screen.getByText("Ilustrasi AI")).toBeInTheDocument()
  })

  it("tanpa label Ilustrasi AI untuk foto dari backend", () => {
    render(<MenuPhoto fotoUrl="https://cdn.example.com/foto.jpg" kategori="teh" nama="Teh" />)
    expect(containerImg()).toHaveAttribute("src", "https://cdn.example.com/foto.jpg")
    expect(screen.queryByText("Ilustrasi AI")).not.toBeInTheDocument()
  })
})

function containerImg() {
  return document.querySelector("img") as HTMLImageElement
}

function ControlledSugarControl({ initialValue }: { initialValue?: TingkatGula }) {
  const [val, setVal] = useState<TingkatGula | undefined>(initialValue)
  return <SugarControl value={val} onChange={setVal} />
}

describe("SugarControl", () => {
  it("memiliki nilai default 'normal' jika tidak disediakan", () => {
    render(<SugarControl onChange={() => {}} />)
    const normalRadio = screen.getByRole("radio", { name: /normal/i })
    expect(normalRadio).toHaveAttribute("aria-checked", "true")
  })

  it("memanggil onChange saat opsi diklik", () => {
    const handleChange = vi.fn()
    render(<SugarControl value="normal" onChange={handleChange} />)
    const ekstraRadio = screen.getByRole("radio", { name: /ekstra/i })
    fireEvent.click(ekstraRadio)
    expect(handleChange).toHaveBeenCalledWith("ekstra")
  })

  it("berpindah pilihan dan memindahkan fokus saat menekan panah kanan dan kiri", () => {
    render(<ControlledSugarControl initialValue="normal" />)
    const normalRadio = screen.getByRole("radio", { name: /normal/i })
    const ekstraRadio = screen.getByRole("radio", { name: /ekstra/i })
    const kurangRadio = screen.getByRole("radio", { name: /kurang/i })

    normalRadio.focus()
    expect(document.activeElement).toBe(normalRadio)

    fireEvent.keyDown(normalRadio, { key: "ArrowRight" })
    expect(ekstraRadio).toHaveAttribute("aria-checked", "true")
    expect(document.activeElement).toBe(ekstraRadio)

    fireEvent.keyDown(ekstraRadio, { key: "ArrowLeft" })
    expect(normalRadio).toHaveAttribute("aria-checked", "true")
    expect(document.activeElement).toBe(normalRadio)

    fireEvent.keyDown(normalRadio, { key: "ArrowLeft" })
    expect(kurangRadio).toHaveAttribute("aria-checked", "true")
    expect(document.activeElement).toBe(kurangRadio)
  })
})
