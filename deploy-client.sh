#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="$SCRIPT_DIR/client"

echo "==> AlgoJunction — Frontend deployment"

# ── env check ────────────────────────────────────────────────────────────────
if [ ! -f "$CLIENT_DIR/.env" ]; then
  echo "ERROR: client/.env not found."
  echo "       Copy client/.env.example to client/.env and fill in the values."
  exit 1
fi

# ── dependencies ─────────────────────────────────────────────────────────────
echo "==> Installing dependencies..."
cd "$CLIENT_DIR"
yarn install --frozen-lockfile

# ── build ─────────────────────────────────────────────────────────────────────
echo "==> Building..."
yarn build

# ── deploy ────────────────────────────────────────────────────────────────────
if command -v vercel &>/dev/null; then
  echo "==> Deploying to Vercel..."
  vercel --prod
else
  echo ""
  echo "Build complete. dist/ is ready."
  echo "To deploy, install the Vercel CLI and re-run:"
  echo "  npm i -g vercel && vercel --prod"
fi
