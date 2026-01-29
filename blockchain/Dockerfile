FROM node:20-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl bash

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx hardhat compile

# Make init script executable
RUN chmod +x init-docker.sh

EXPOSE 8545

CMD ["sh", "init-docker.sh"]
