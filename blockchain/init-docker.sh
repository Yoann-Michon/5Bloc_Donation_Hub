#!/bin/sh
set -e

echo "Starting Hardhat node in background..."
npx hardhat node --hostname 0.0.0.0 &
NODE_PID=$!

echo "Waiting for Hardhat node to be ready..."
sleep 5

# Wait for the node to be fully ready
until curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 > /dev/null 2>&1; do
  echo "Waiting for blockchain node..."
  sleep 2
done

echo "Blockchain node is ready!"

echo "Deploying smart contract..."
npx hardhat run scripts/deploy.ts --network localhost > /tmp/deploy.log 2>&1

# Extract contract address from deploy logs using sed (BusyBox compatible)
CONTRACT_ADDRESS=$(sed -n 's/.*DonationBadge deployed to: \(0x[a-fA-F0-9]\{40\}\).*/\1/p' /tmp/deploy.log)

if [ -z "$CONTRACT_ADDRESS" ]; then
  echo "ERROR: Failed to extract contract address from deployment"
  cat /tmp/deploy.log
  exit 1
fi

echo "Contract deployed at: $CONTRACT_ADDRESS"

# Create a config file with the contract address
mkdir -p /app/shared
echo "{\"contractAddress\":\"$CONTRACT_ADDRESS\"}" > /app/shared/contract-config.json

# Copy ABI to shared folder
cp /app/artifacts/contracts/DonationBadge.sol/DonationBadge.json /app/shared/DonationBadge.json

echo "Contract deployment completed successfully!"
echo "Address: $CONTRACT_ADDRESS"
echo "Config saved to: /app/shared/contract-config.json"

# Keep the node running
wait $NODE_PID
