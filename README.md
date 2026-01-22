# 5Bloc Donation Hub

A decentralized application (DApp) for community donations with NFT badges.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or higher)
-   [MetaMask](https://metamask.io/) browser extension

## Project Structure

-   `blockchain/`: Smart Contract (Hardhat)
-   `Donation hub/`: Frontend Application (React/Vite)

## Step 1: Start the Blockchain (Localhost)

1.  Open a terminal and navigate to the `blockchain` folder:
    ```bash
    cd blockchain
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the local Hardhat node:
    ```bash
    npx hardhat node
    ```
    *Keep this terminal window open.* This starts a local blockchain on `http://127.0.0.1:8545`.

## Step 2: Deploy the Smart Contract

1.  Open a **new** terminal window.
2.  Navigate to the `blockchain` folder:
    ```bash
    cd blockchain
    ```
3.  Deploy the contract to your local network:
    ```bash
    npx hardhat run scripts/deploy.ts --network localhost
    ```
4.  Copy the compiled artifact (ABI) to the frontend:
    *   Ensure the `DonationBadge.json` in `blockchain/artifacts/contracts/DonationBadge.sol/` is copied or accessible to the frontend if not automated. *Note: Current setup might require manual ABI update if changed.*
    *   **Crucial**: Update the `CONTRACT_ADDRESS` in `Donation hub/src/hooks/useWallet.ts` with the address printed in the terminal (e.g., `0x45874hju58k66j.........`).

## Step 3: Configure MetaMask

1.  Open MetaMask in your browser.
2.  Add a network (if not already added):
    *   **Network Name**: Localhost 8545
    *   **RPC URL**: `http://127.0.0.1:8545`
    *   **Chain ID**: `31337`
    *   **Currency Symbol**: ETH
3.  Import a Test Account:
    *   Copy one of the private keys from the `npx hardhat node` terminal output (e.g., Account #0).
    *   In MetaMask, click the account icon -> **Import Account** -> Paste the private key.

## Step 4: Start the Frontend

1.  Open a **new** terminal window.
2.  Navigate to the frontend folder:
    ```bash
    cd "Donation hub"
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

-   **Donation Modal**: Donate ETH to projects. Metadata is simulated and stored locally.
-   **Badge Gallery**: View your earned badges with dynamic metadata.
-   **Transaction History**: Track your donations with real-time on-chain data.
-   **Dashboard Stats**: View your real wallet balance and donation impact.
