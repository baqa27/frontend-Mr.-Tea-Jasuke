/**
 * Membuat 12 foto menu ilustratif sintetis (SVG dirasterisasi ke WebP oleh sharp).
 * Tidak mengunduh apa pun dari internet. Jalankan: npm run foto:menu
 */
import { mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, "../public/menu")

const W = 640
const H = 480

// Bentuk sederhana, warna datar mengikuti token teh/jagung/tinta.
const svg = (isi) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#f5efe3"/>
  ${isi}
</svg>`

// Gelas teh: cup trapesium + tutup + sedotan
const teh = svg(`
  <rect x="0" y="0" width="640" height="480" fill="#f5efe3"/>
  <path d="M220 150 L420 150 L390 430 L250 430 Z" fill="#8a4b2a"/>
  <path d="M225 250 L415 250 L400 400 L240 400 Z" fill="#c98a5e"/>
  <rect x="215" y="120" width="210" height="30" rx="15" fill="#e0c8a8"/>
  <rect x="360" y="40" width="14" height="180" rx="7" fill="#3a8f5d"/>
  <ellipse cx="320" cy="250" rx="88" ry="26" fill="#5d3018" opacity="0.5"/>
`)

// Jasuke: cup jagung + topping keju
const jasuke = svg(`
  <rect x="0" y="0" width="640" height="480" fill="#f5efe3"/>
  <path d="M240 160 L400 160 L380 420 L260 420 Z" fill="#f2c440"/>
  <path d="M245 300 L395 300 L385 380 L255 380 Z" fill="#d9a520"/>
  <rect x="230" y="130" width="180" height="32" rx="16" fill="#e8d9b8"/>
  <circle cx="285" cy="140" r="18" fill="#e8e2d0"/>
  <circle cx="330" cy="132" r="18" fill="#e8e2d0"/>
  <circle cx="370" cy="140" r="18" fill="#e8e2d0"/>
`)

// Es teh: gelas tinggi + es + irisan lemon
const esTeh = svg(`
  <rect x="0" y="0" width="640" height="480" fill="#f5efe3"/>
  <path d="M250 110 L390 110 L370 430 L270 430 Z" fill="#c98a3e"/>
  <rect x="245" y="90" width="150" height="22" rx="11" fill="#e0c8a8"/>
  <rect x="270" y="200" width="50" height="50" rx="8" fill="#f4f0e6" opacity="0.8"/>
  <rect x="310" y="260" width="45" height="45" rx="8" fill="#f4f0e6" opacity="0.7"/>
  <circle cx="320" cy="150" r="32" fill="#f5d63d"/>
  <path d="M288 150 L352 150" stroke="#e2b70c" stroke-width="3"/>
`)

// Minuman lain: gelas susu + meses
const minuman = svg(`
  <rect x="0" y="0" width="640" height="480" fill="#f5efe3"/>
  <path d="M255 120 L385 120 L365 425 L275 425 Z" fill="#efe3cf"/>
  <rect x="250" y="95" width="140" height="24" rx="12" fill="#dcbf9a"/>
  <ellipse cx="320" cy="130" rx="66" ry="16" fill="#b45a3a"/>
  <circle cx="300" cy="126" r="10" fill="#8a4b2a"/>
  <circle cx="340" cy="134" r="9" fill="#6b4a2f"/>
  <rect x="345" y="30" width="12" height="150" rx="6" fill="#3a8f5d"/>
`)

const files = [
  { nama: "m-teh-ori.webp", svg: teh },
  { nama: "m-teh-jumbo.webp", svg: teh.replace("M220 150 L420", "M185 130 L455").replace("L390 430 L250", "L415 440 L225") },
  { nama: "m-teh-lemon.webp", svg: esTeh },
  { nama: "m-teh-leci.webp", svg: esTeh.replace("#f5d63d", "#e98cab") },
  { nama: "m-teh-susu.webp", svg: minuman },
  { nama: "m-thai.webp", svg: minuman.replace("#efe3cf", "#d97832") },
  { nama: "m-teh-lemon-jumbo.webp", svg: esTeh.replace("M250 110 L390", "M210 90 L430").replace("L370 430 L270", "L400 440 L240") },
  { nama: "m-jasuke-ori.webp", svg: jasuke },
  { nama: "m-jasuke-keju.webp", svg: jasuke.replaceAll("r=\"18\"", "r=\"26\"") },
  { nama: "m-jasuke-coklat.webp", svg: jasuke.replace("#e8e2d0", "#6b3b24") },
  { nama: "m-jasuke-balado.webp", svg: jasuke.replace("#e8e2d0", "#d94b2b") },
  { nama: "m-paket.webp", svg: svg(`${teh.match(/<path d=\"M220[\s\S]*?<\/path>/)?.[0] ?? ""}${jasuke.match(/<path d=\"M240[\s\S]*?<\/path>/)?.[0] ?? ""}`) },
]

await mkdir(OUT_DIR, { recursive: true })
for (const f of files) {
  const buf = await sharp(Buffer.from(f.svg)).webp({ quality: 80 }).toBuffer()
  const out = resolve(OUT_DIR, f.nama)
  await sharp(buf).toFile(out)
  const kb = Buffer.byteLength(buf) / 1024
  if (kb >= 60) {
    console.error(`GAGAL: ${f.nama} ${kb.toFixed(1)} KB >= 60 KB`)
    process.exit(1)
  }
  console.log(`${f.nama} ${kb.toFixed(1)} KB`)
}
console.log(`Selesai: ${files.length} foto di ${OUT_DIR}`)
