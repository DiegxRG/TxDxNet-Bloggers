#!/bin/sh
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "[txdxnet] Ejecutando migraciones de Payload contra la base de datos..."
  ./node_modules/.bin/payload migrate
fi

exec "$@"
