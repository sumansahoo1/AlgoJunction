#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/server"

echo "==> AlgoJunction — Backend deployment"

# ── prerequisites ─────────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "ERROR: Docker is not installed or not in PATH."
  echo "       The backend requires Docker to run Java code in isolation."
  echo "       Install it from https://docs.docker.com/get-docker/"
  exit 1
fi

# ── env check ─────────────────────────────────────────────────────────────────
if [ ! -f "$SERVER_DIR/.env" ]; then
  echo "ERROR: server/.env not found."
  echo "       Copy server/.env.example to server/.env and fill in MONGODB_URI."
  exit 1
fi

# ── dependencies ──────────────────────────────────────────────────────────────
echo "==> Installing dependencies..."
cd "$SERVER_DIR"
yarn install --frozen-lockfile

# ── start ─────────────────────────────────────────────────────────────────────
if command -v pm2 &>/dev/null; then
  echo "==> Starting server with PM2..."
  pm2 delete algojunction-server 2>/dev/null || true
  pm2 start src/index.js --name algojunction-server --interpreter node
  pm2 save
  echo "==> Server running via PM2. Use 'pm2 logs algojunction-server' to tail logs."
else
  echo "==> Starting server with Node (foreground)..."
  echo "    Tip: install PM2 for background/auto-restart support:"
  echo "         npm i -g pm2"
  echo ""
  node src/index.js
fi
