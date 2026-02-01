FROM node:20-alpine


RUN apk add --no-cache curl bash

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx hardhat compile


RUN sed -i 's/\r$//' init-docker.sh && chmod +x init-docker.sh

EXPOSE 8545

CMD ["sh", "init-docker.sh"]
