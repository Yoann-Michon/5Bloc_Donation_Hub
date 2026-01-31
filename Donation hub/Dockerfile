FROM node:20-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN sed -i 's/\r$//' copy-contract-config.sh && chmod +x copy-contract-config.sh

EXPOSE 5173

CMD ["sh", "-c", "./copy-contract-config.sh && npm run dev -- --host 0.0.0.0"]