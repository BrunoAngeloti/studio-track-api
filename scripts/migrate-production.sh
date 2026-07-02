#!/usr/bin/env bash
set -euo pipefail

# Roda as migrations pendentes contra o banco de PRODUCAO (Neon), sem
# precisar de acesso ao Shell do Render.
#
# A connection string NUNCA e escrita em disco por este script - ela so
# vive na variavel de ambiente da sua sessao de terminal atual.
#
# Uso:
#   PROD_DATABASE_URL="postgresql://usuario:senha@host/db?sslmode=require" \
#     ./scripts/migrate-production.sh
#
# Onde encontrar a connection string: no seu .env local, na linha comentada
# "# Producao (Neon)" - copie o valor de dentro das aspas.

if [ -z "${PROD_DATABASE_URL:-}" ]; then
  echo "Erro: defina PROD_DATABASE_URL com a connection string de producao do Neon." >&2
  echo "Exemplo:" >&2
  echo '  PROD_DATABASE_URL="postgresql://usuario:senha@host/db?sslmode=require" ./scripts/migrate-production.sh' >&2
  exit 1
fi

if [[ "$PROD_DATABASE_URL" == *"localhost"* || "$PROD_DATABASE_URL" == *"127.0.0.1"* ]]; then
  echo "Erro: essa URL parece ser local (contem 'localhost'). Use a URL do Neon." >&2
  exit 1
fi

cd "$(dirname "$0")/.."

echo "== Status atual das migrations em producao =="
DATABASE_URL="$PROD_DATABASE_URL" npx sequelize-cli db:migrate:status

echo
echo "As migrations PENDENTES acima (marcadas 'down') serao aplicadas em PRODUCAO."
echo "Confirme que voce ja tirou um backup/branch no painel do Neon antes de continuar."
read -r -p "Digite 'sim' para confirmar e rodar as migrations: " CONFIRM

if [ "$CONFIRM" != "sim" ]; then
  echo "Cancelado. Nada foi alterado."
  exit 1
fi

echo
echo "== Rodando migrations em producao =="
DATABASE_URL="$PROD_DATABASE_URL" npx sequelize-cli db:migrate

echo
echo "== Status final =="
DATABASE_URL="$PROD_DATABASE_URL" npx sequelize-cli db:migrate:status

echo
echo "Concluido. Agora e seguro fazer o deploy do backend novo."
