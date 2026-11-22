#!/usr/bin/env bash
# Pasang penjaga Git di repo tim Mr. Tea & Jasuke. Jalankan SEKALI dari root repo tim.
# Windows: jalankan lewat Git Bash.
#
#   bash ~/mrtea-tools/pasang-penjaga-git.sh "Muhammad Sultan Baqa" "email-github-kamu@contoh.com"
#
# Yang dipasang (semuanya lokal, tidak ikut ter-commit ke repo tim):
#   1. Identitas Git khusus repo ini, agar semua commit tercatat atas namamu.
#   2. Hook commit-msg: menghapus otomatis baris atribusi AI (Co-Authored-By Claude,
#      "Generated with ...", tautan sesi) dari setiap pesan commit.
#   3. Hook pre-commit: menolak commit bila identitas penulis bukan emailmu atau email AI.
#   4. Hook pre-push: menolak push bila ada commit baru yang masih membawa atribusi AI.
#   5. .git/info/exclude: folder dan file agen (.claude/, .opencode/, CLAUDE.md, .qa/)
#      tidak akan pernah ikut ter-commit.
#   6. Remote "pribadi" ke repo frontend pribadimu.
set -euo pipefail

NAMA="${1:-}"
EMAIL="${2:-}"
REPO_PRIBADI="${3:-https://github.com/baqa27/frontend-Mr.-Tea-Jasuke.git}"

if [ -z "$NAMA" ] || [ -z "$EMAIL" ]; then
  echo "Pakai: bash pasang-penjaga-git.sh \"Nama Lengkap\" \"email-github@contoh.com\" [url-repo-pribadi]" >&2
  exit 1
fi

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
HOOKS="$(git rev-parse --git-path hooks)"
mkdir -p "$HOOKS"

git config user.name "$NAMA"
git config user.email "$EMAIL"
git config mrtea.emailsaya "$EMAIL"

# Pola atribusi AI yang dibuang dari pesan commit.
POLA='^(co-authored-by|generated-by|assisted-by|claude-session):.*(claude|anthropic|opencode|openai|chatgpt|copilot|gemini|cursor|codeium|windsurf|devin|noreply@anthropic)|generated with \[?(claude|opencode|chatgpt|copilot|cursor)|claude\.ai/code|claude\.com/claude-code|^🤖'

cat > "$HOOKS/commit-msg" <<EOF
#!/bin/sh
# Dipasang oleh pasang-penjaga-git.sh: membuang baris atribusi AI dari pesan commit.
f="\$1"
tmp="\$f.penjaga"
grep -viE '$POLA' "\$f" > "\$tmp" || true
# Rapikan baris kosong berlebih di akhir pesan.
awk 'NF{for(i=0;i<kosong;i++)print "";kosong=0;print;next}{kosong++}' "\$tmp" > "\$f"
rm -f "\$tmp"
if [ ! -s "\$f" ]; then
  echo "Pesan commit kosong setelah atribusi AI dibuang. Tulis pesan commit yang jelas." >&2
  exit 1
fi
EOF

cat > "$HOOKS/pre-commit" <<'EOF'
#!/bin/sh
# Dipasang oleh pasang-penjaga-git.sh: memastikan commit tercatat atas namamu.
saya="$(git config mrtea.emailsaya)"
penulis="$(git var GIT_AUTHOR_IDENT | sed -E 's/.*<([^>]*)>.*/\1/')"
case "$penulis" in
  *anthropic*|*openai*|*opencode*|*noreply@github.com*copilot*|*claude*)
    echo "Ditolak: identitas penulis commit adalah $penulis. Commit harus atas namamu ($saya)." >&2
    exit 1 ;;
esac
if [ -n "$saya" ] && [ "$penulis" != "$saya" ]; then
  echo "Ditolak: email penulis commit $penulis, seharusnya $saya." >&2
  echo "Perbaiki dengan: git config user.email \"$saya\"" >&2
  exit 1
fi
# File agen tidak boleh ikut.
if git diff --cached --name-only | grep -qE '(^|/)(\.claude|\.opencode|\.qa)/|(^|/)CLAUDE\.md$'; then
  echo "Ditolak: ada file agen (.claude, .opencode, .qa, CLAUDE.md) di commit. Keluarkan dengan git restore --staged." >&2
  exit 1
fi
EOF

cat > "$HOOKS/pre-push" <<EOF
#!/bin/sh
# Dipasang oleh pasang-penjaga-git.sh: menolak push yang membawa atribusi AI.
remote="\$1"
nol=0000000000000000000000000000000000000000
gagal=0
while read lokal_ref lokal_sha remote_ref remote_sha; do
  [ "\$lokal_sha" = "\$nol" ] && continue
  if [ "\$remote_sha" = "\$nol" ]; then
    rentang="\$lokal_sha --not --remotes=\$remote"
  else
    rentang="\$remote_sha..\$lokal_sha"
  fi
  for c in \$(git rev-list \$rentang); do
    if git log -1 --format='%an <%ae>%n%cn <%ce>%n%B' "\$c" | grep -qiE '$POLA|<[^>]*(anthropic|openai)[^>]*>'; then
      echo "Ditolak: commit \$(git log -1 --format='%h %s' "\$c") membawa atribusi AI." >&2
      gagal=1
    fi
  done
done
if [ \$gagal -ne 0 ]; then
  echo "Bersihkan dulu, misalnya dengan git commit --amend untuk commit terakhir," >&2
  echo "atau git rebase -i lalu reword untuk commit lama. Push dibatalkan." >&2
  exit 1
fi
EOF

chmod +x "$HOOKS/commit-msg" "$HOOKS/pre-commit" "$HOOKS/pre-push"

EXCLUDE="$(git rev-parse --git-path info/exclude)"
mkdir -p "$(dirname "$EXCLUDE")"
touch "$EXCLUDE"
for p in ".claude/" ".opencode/" "CLAUDE.md" ".qa/" "contoh ui/" ".env" ".env.local"; do
  grep -qxF "$p" "$EXCLUDE" || echo "$p" >> "$EXCLUDE"
done

if git remote get-url pribadi >/dev/null 2>&1; then
  git remote set-url pribadi "$REPO_PRIBADI"
else
  git remote add pribadi "$REPO_PRIBADI"
fi

echo "Penjaga terpasang di $ROOT"
echo "  identitas : $NAMA <$EMAIL>"
echo "  remote    : origin = $(git remote get-url origin)"
echo "              pribadi = $REPO_PRIBADI"
echo "  hook      : commit-msg, pre-commit, pre-push"
echo "Pastikan $EMAIL sudah terdaftar dan terverifikasi di GitHub (Settings, Emails)."
