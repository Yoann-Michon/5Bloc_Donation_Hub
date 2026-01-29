#!/bin/sh
set -e

echo "🔄 Starting Donation Hub Backend..."

# Attendre que la base de données soit prête
echo "⏳ Waiting for database to be ready..."
until echo "SELECT 1" | npx prisma db execute --stdin > /dev/null 2>&1; do
  echo "   Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Générer le client Prisma (au cas où)
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Synchroniser le schéma de la base de données
echo "📦 Syncing database schema..."
npx prisma db push --accept-data-loss

echo "✅ Database schema synced successfully!"

# Démarrer l'application
echo "🚀 Starting NestJS application..."
exec node dist/src/main
