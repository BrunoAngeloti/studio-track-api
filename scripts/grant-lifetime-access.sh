#!/usr/bin/env bash
set -euo pipefail

# Marca uma conta especifica como tendo acesso vitalicio gratis (bypassa a
# checagem de assinatura ativa do Stripe), sem precisar de acesso ao Shell
# do Render.
#
# A connection string NUNCA e escrita em disco por este script - ela so
# vive na variavel de ambiente da sua sessao de terminal atual.
#
# Pre-requisito: a migration "add-lifetime-free-access-to-studios" precisa
# ja ter rodado em producao (via scripts/migrate-production.sh).
#
# Uso:
#   PROD_DATABASE_URL="postgresql://usuario:senha@host/db?sslmode=require" \
#     ./scripts/grant-lifetime-access.sh email@do-estudio.com

if [ -z "${PROD_DATABASE_URL:-}" ]; then
  echo "Erro: defina PROD_DATABASE_URL com a connection string de producao do Neon." >&2
  exit 1
fi

if [[ "$PROD_DATABASE_URL" == *"localhost"* || "$PROD_DATABASE_URL" == *"127.0.0.1"* ]]; then
  echo "Erro: essa URL parece ser local (contem 'localhost'). Use a URL do Neon." >&2
  exit 1
fi

EMAIL="${1:-}"
if [ -z "$EMAIL" ]; then
  echo "Erro: informe o email do estudio." >&2
  echo "Uso: $0 email@do-estudio.com" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

echo "Isso vai marcar o estudio \"$EMAIL\" como acesso vitalicio gratis EM PRODUCAO."
read -r -p "Digite 'sim' para confirmar: " CONFIRM

if [ "$CONFIRM" != "sim" ]; then
  echo "Cancelado. Nada foi alterado."
  exit 1
fi

DATABASE_URL="$PROD_DATABASE_URL" node scripts/grant-lifetime-access.js "$EMAIL"
