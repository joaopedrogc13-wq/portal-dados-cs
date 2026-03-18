#!/bin/bash
# ─────────────────────────────────────────────
#  Portal C&S — Publicar no GitHub Pages
#  Uso: ./publicar.sh "mensagem opcional"
# ─────────────────────────────────────────────

cd "$(dirname "$0")"

# Token lido do arquivo .gh-token (não vai para o GitHub)
TOKEN_FILE="$(dirname "$0")/.gh-token"
if [ ! -f "$TOKEN_FILE" ]; then
  echo "  ❌ Arquivo .gh-token não encontrado."
  echo "  Crie o arquivo: echo 'SEU_TOKEN' > .gh-token"
  exit 1
fi
GH_TOKEN=$(cat "$TOKEN_FILE" | tr -d '[:space:]')

MSG="${1:-atualização do portal $(date '+%d/%m/%Y %H:%M')}"

echo ""
echo "  📦 Publicando portal no GitHub Pages..."
echo ""

git add -A

# Verifica se há algo para commitar
if git diff --cached --quiet; then
  echo "  ✓ Nenhuma alteração detectada. Portal já está atualizado."
  echo ""
  echo "  🌐 https://joaopedrogc13-wq.github.io/portal-dados-cs/"
  exit 0
fi

git commit -m "$MSG"

# Push com token (só na URL de push, nunca salvo no histórico)
git push "https://joaopedrogc13-wq:${GH_TOKEN}@github.com/joaopedrogc13-wq/portal-dados-cs.git" main

echo ""
echo "  ✅ Publicado com sucesso!"
echo ""
echo "  🌐 https://joaopedrogc13-wq.github.io/portal-dados-cs/"
echo "  ⏱  GitHub Pages leva ~30s para atualizar"
echo ""
