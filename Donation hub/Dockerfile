FROM node:20-alpine

# Install bash for scripts
RUN apk add --no-cache bash

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Ensure the script is executable and has Linux line endings
RUN sed -i 's/\r$//' copy-contract-config.sh && chmod +x copy-contract-config.sh

# Vite dev server port
EXPOSE 5173

# At runtime:
# 1. Wait for contract and generate config
# 2. Start Vite dev server
# Using --host 0.0.0.0 to allow access from outside the container
CMD ["sh", "-c", "./copy-contract-config.sh && npm run dev -- --host 0.0.0.0"]
