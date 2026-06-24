#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Step 1: Build ==="
cd "$ROOT_DIR"
npm run build

echo ""
echo "=== Step 2: Security Checks ==="
cd "$ROOT_DIR"
npm run test:security

echo ""
echo "=== Step 3: E2E Tests ==="
cd "$ROOT_DIR"
npm run test:e2e

echo ""
echo "=== Step 4: Lighthouse CI ==="
cd "$ROOT_DIR"
npm run test:lh

echo ""
echo "=== All checks passed ==="
