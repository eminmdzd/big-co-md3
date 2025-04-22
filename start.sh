#!/bin/bash

echo "Stopping any running Next.js processes..."
pkill -f "node.*next" || true

echo "Clearing Next.js cache..."
rm -rf .next/cache
rm -rf .next

echo "Starting development server in static mode (no HMR)..."
npm run dev:static