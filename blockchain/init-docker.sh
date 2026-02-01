
set -e

echo "Starting Hardhat node in background..."
npx hardhat node --hostname 0.0.0.0 &
NODE_PID=$!

echo "Waiting for Hardhat node to be ready..."
sleep 5


until curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 > /dev/null 2>&1; do
  echo "Waiting for blockchain node..."
  sleep 2
done

echo "Blockchain node is ready!"

echo "Deploying smart contracts..."
npx hardhat run scripts/deploy.ts --network localhost > /tmp/deploy.log 2>&1


BADGE_ADDRESS=$(sed -n 's/.*DonationBadge deployed to: \(0x[a-fA-F0-9]\{40\}\).*/\1/p' /tmp/deploy.log)
MARKETPLACE_ADDRESS=$(sed -n 's/.*BadgeMarketplace deployed to: \(0x[a-fA-F0-9]\{40\}\).*/\1/p' /tmp/deploy.log)

if [ -z "$BADGE_ADDRESS" ] || [ -z "$MARKETPLACE_ADDRESS" ]; then
  echo "ERROR: Failed to extract contract addresses from deployment"
  cat /tmp/deploy.log
  exit 1
fi

echo "DonationBadge deployed at: $BADGE_ADDRESS"
echo "BadgeMarketplace deployed at: $MARKETPLACE_ADDRESS"


mkdir -p /app/shared
echo "{\"contractAddress\":\"$BADGE_ADDRESS\",\"marketplaceAddress\":\"$MARKETPLACE_ADDRESS\"}" > /app/shared/contract-config.json


cp /app/artifacts/contracts/DonationBadge.sol/DonationBadge.json /app/shared/DonationBadge.json
cp /app/artifacts/contracts/BadgeMarketplace.sol/BadgeMarketplace.json /app/shared/BadgeMarketplace.json

echo "Contract deployment completed successfully!"
echo "DonationBadge: $BADGE_ADDRESS"
echo "BadgeMarketplace: $MARKETPLACE_ADDRESS"
echo "Config saved to: /app/shared/contract-config.json"


wait $NODE_PID
