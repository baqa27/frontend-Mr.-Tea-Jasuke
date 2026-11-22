#!/usr/bin/env bash
# Kirim frontend ke dua repo: repo tim (origin) dan repo frontend pribadi (pribadi).
# Jalankan dari root repo tim. Windows: lewat Git Bash.
#
#   bash ~/mrtea-tools/push-dua-repo.sh branch        # push branch kerja saat ini ke repo tim (untuk PR)
#   bash ~/mrtea-tools/push-dua-repo.sh sinkron       # setelah PR digabung: salin frontend dari main tim ke repo pribadi
#
# Repo pribadi HANYA menerima folder frontend. Kode backend, AI, dan data milik anggota
# lain tidak pernah dikirim ke sana, karena repo pribadi publik sedangkan repo tim privat.
set -euo pipefail

MODE="${1:-}"
cd "$(git rev-parse --show-toplevel)"

# Folder frontend: isi FE_DIR bila deteksi otomatis keliru, misalnya FE_DIR=apps/web.
deteksi_fe() {
  if [ -n "${FE_DIR:-}" ]; then echo "$FE_DIR"; return; fi
  for d in apps/web frontend client web fe; do
    if [ -f "$d/package.json" ] && grep -q '"vite"' "$d/package.json"; then echo "$d"; return; fi
  done
  if [ -f package.json ] && grep -q '"vite"' package.json && [ ! -d backend ] && [ ! -d apps/api ]; then
    echo "."; return
  fi
  echo ""
}

git remote get-url pribadi >/dev/null 2>&1 || { echo "Remote 'pribadi' belum ada. Jalankan pasang-penjaga-git.sh dulu." >&2; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "Masih ada perubahan yang belum di-commit. Commit atau stash dulu." >&2; exit 1; }

case "$MODE" in
  branch)
    CABANG="$(git rev-parse --abbrev-ref HEAD)"
    if [ "$CABANG" = "main" ] || [ "$CABANG" = "master" ]; then
      echo "Kamu sedang di $CABANG. Push langsung ke main dilarang; buat branch fe/... dulu." >&2
      exit 1
    fi
    git push -u origin "$CABANG"
    echo
    echo "Branch $CABANG terkirim ke repo tim. Buat pull request di GitHub atau dengan: gh pr create --fill"
    ;;

  sinkron)
    FE="$(deteksi_fe)"
    [ -n "$FE" ] || { echo "Folder frontend tidak ditemukan. Jalankan ulang dengan FE_DIR=<folder> bash push-dua-repo.sh sinkron" >&2; exit 1; }
    git fetch origin main
    git fetch pribadi
    if [ "$FE" = "." ]; then
      # Repo tim isinya hanya frontend: kirim main tim apa adanya.
      if git push pribadi origin/main:refs/heads/main; then
        echo "Repo pribadi main = main tim."
      else
        git push pribadi origin/main:refs/heads/sinkron-tim
        echo "Riwayat berbeda, jadi dikirim ke branch sinkron-tim di repo pribadi. Gabungkan lewat PR di repo pribadi." >&2
      fi
    else
      echo "Memisahkan riwayat folder $FE dari main tim (bisa makan waktu pertama kali) ..."
      SPLIT="$(git subtree split --prefix="$FE" origin/main)"
      if git push pribadi "$SPLIT:refs/heads/main"; then
        echo "Repo pribadi main diperbarui dari folder $FE di main tim."
      else
        git push pribadi "$SPLIT:refs/heads/sinkron-tim" || { echo "Branch sinkron-tim di repo pribadi juga sudah berbeda. Hapus branch itu di GitHub lalu ulangi." >&2; exit 1; }
        echo
        echo "Riwayat repo pribadi berbeda dengan riwayat folder $FE di repo tim, jadi main pribadi" >&2
        echo "tidak ditimpa. Hasil sinkron ada di branch sinkron-tim di repo pribadi." >&2
        echo "Pilih salah satu: gabungkan lewat PR di repo pribadi, atau jadikan sinkron-tim sebagai" >&2
        echo "branch utama (Settings, Branches) bila kamu yakin." >&2
      fi
    fi
    ;;

  *)
    echo "Pakai: bash push-dua-repo.sh branch | sinkron" >&2
    exit 1
    ;;
esac
