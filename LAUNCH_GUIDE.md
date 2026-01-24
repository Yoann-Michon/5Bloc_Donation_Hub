# 🚀 Donation Hub - Launch Guide

This guide describes how to set up and launch the Donation Hub project from A to Z, including Blockchain, Backend, and Frontend.

## 📋 Prerequisites

- **Node.js** (v18 or v20 recommended)
- **Docker** and **Docker Compose**
- **MetaMask** (or another Web3 wallet) installed in your browser.

## 🛠️ Step 1: Blockchain Deployment

Before running the app, you need to deploy the smart contract.

1.  **Navigate to blockchain folder**:
    ```bash
    cd blockchain
    npm install
    ```
2.  **Compile & Deploy**:
    You can deploy to a local node (Hardhat Network) or a testnet (Sepolia, etc.).
    *   *Local*:
        ```bash
        npx hardhat node
        # In a new terminal
        npx hardhat run scripts/deploy.ts --network localhost
        ```
    *   *Note*: Copy the deployed contract address. You will need it for the Frontend.

## 🐳 Step 2: Run with Docker (Recommended)

The easiest way to run the full stack (Database, Backend, Frontend).

1.  **Navigate to root**:
    ```bash
    cd ..
    ```
2.  **Start Docker Compose**:
    ```bash
    docker-compose up --build
    ```
    - This starts:
        - **PostgreSQL** on port `5432`
        - **Backend** on `http://localhost:3000`
        - **Frontend** on `http://localhost:5173`

## 💻 Step 3: Manual Setup (Development)

If you prefer running services individually without Docker.

### 1. Database
You need a PostgreSQL instance running.
- Update `.env` in `backend` with your DB credentials.
- Or use the docker one: `docker-compose up postgres -d`

### 2. Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push  # Create tables
npm run start:dev
```
Server runs on: `http://localhost:3000`

### 3. Frontend
```bash
cd "Donation hub"
npm install
npm run dev
```
App runs on: `http://localhost:5173`

## 🔗 Step 4: Connecting the Dots

1.  **Frontend Configuration**:
    - Update `Donation hub/src/config.ts` (or similar) with the **Smart Contract Address** from Step 1.
    - Ensure Backend URL is set to `http://localhost:3000`.

2.  **Usage**:
    - Open Frontend.
    - Connect Wallet.
    - Create a Project (saves to DB and Blockchain if configured).
    - Donate (updates Blockchain and syncs to DB).

## ⚠️ Troubleshooting

- **Backend Connection Error**: Ensure backend is running on port 3000 and CORS is enabled (default in NestJS).
- **Database Error**: Check if Postgres is running and `DATABASE_URL` in `.env` is correct.
