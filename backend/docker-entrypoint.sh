#!/bin/sh
set -e

echo "🔄 Starting Donation Hub Backend..."


echo "⏳ Waiting for database to be ready..."
until echo "SELECT 1" | npx prisma db execute --stdin > /dev/null 2>&1; do
  echo "   Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"


SHARED_CONFIG="/app/shared/contract-config.json"
echo "⏳ Waiting for blockchain contract configuration..."

MAX_WAIT=60
WAITED=0
while [ ! -f "$SHARED_CONFIG" ] && [ $WAITED -lt $MAX_WAIT ]; do
  echo "   Waiting for contract deployment... ($WAITED/$MAX_WAIT seconds)"
  sleep 2
  WAITED=$((WAITED + 2))
done

if [ ! -f "$SHARED_CONFIG" ]; then
  echo "⚠️  WARNING: Contract configuration not found after ${MAX_WAIT} seconds"
  echo "   Application will use CONTRACT_ADDRESS from .env if available"
else
  echo "✅ Contract configuration found!"
  echo "   Contract address will be loaded by the application at startup"
fi


echo "🔧 Generating Prisma Client..."
npx prisma generate


echo "📦 Syncing database schema..."
npx prisma db push --accept-data-loss

echo "✅ Database schema synced successfully!"


echo "🌱 Seeding database with initial data..."
npx ts-node src/prisma/seed.ts || echo "⚠️  Seed already executed or failed (ignoring)"

echo "✅ Database seeding completed!"


echo "🚀 Starting NestJS application..."
exec node dist/src/main
