#!/bin/sh
set -e

cd /app/apps/web/idam2-demo-finance

# The named node_modules volume can lag behind package-lock.json after deps
# are added on the host. Sync before starting the dev server.
npm ci

exec npm run dev -- --webpack -p 3000 -H 0.0.0.0
