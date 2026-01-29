#!/bin/sh
set -e

echo "🔄 Starting Donation Hub Backend..."

# Attendre que la base de données soit prête
echo "⏳ Waiting for database to be ready..."
until npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; do
  echo "   Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Générer le client Prisma (au cas où)
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Appliquer les migrations
echo "📦 Applying database migrations..."
npx prisma migrate deploy

echo "✅ Migrations applied successfully!"

# Démarrer l'application
echo "🚀 Starting NestJS application..."
exec node dist/src/main
