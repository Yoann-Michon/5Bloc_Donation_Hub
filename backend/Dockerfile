# Dockerfile pour le backend NestJS
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Build l'application
RUN npm run build

# Stage de production
FROM node:20-alpine AS production

WORKDIR /app

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
