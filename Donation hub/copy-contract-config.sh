
set -e

echo "Waiting for blockchain contract configuration..."


SHARED_CONFIG="/app/shared/contract-config.json"
SHARED_ABI="/app/shared/DonationBadge.json"
ENV_LOCAL_FILE="/app/.env.local"
CONTRACTS_DIR="/app/src/contracts"

MAX_WAIT=60
WAITED=0
while [ ! -f "$SHARED_CONFIG" ] && [ $WAITED -lt $MAX_WAIT ]; do
  echo "Waiting for contract deployment... ($WAITED/$MAX_WAIT seconds)"
  sleep 2
  WAITED=$((WAITED + 2))
done

if [ ! -f "$SHARED_CONFIG" ]; then
  echo "ERROR: Contract configuration not found after ${MAX_WAIT} seconds"
  echo "WARNING: Continuing with default or existing configuration"
else
  echo "Contract configuration found!"

  CONTRACT_ADDRESS=$(cat "$SHARED_CONFIG" | grep -o '"contractAddress":"[^"]*"' | cut -d'"' -f4)

  if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "ERROR: Failed to extract contract address"
    exit 1
  fi

  echo "Contract Address: $CONTRACT_ADDRESS"

  ENV_FILE="/app/.env"
  if [ -f "$ENV_FILE" ]; then
    sed -i "s|VITE_CONTRACT_ADDRESS=.*|VITE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS|g" "$ENV_FILE"
    echo ".env updated with contract address"
  else

    echo "VITE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" > "$ENV_FILE"
    echo ".env created with contract address"
  fi


  if [ -f "$SHARED_ABI" ]; then
    mkdir -p "$CONTRACTS_DIR"
    cp "$SHARED_ABI" "$CONTRACTS_DIR/"
    echo "ABI copied to $CONTRACTS_DIR/DonationBadge.json"
  fi

 
  mkdir -p "$CONTRACTS_DIR"
  cat > "$CONTRACTS_DIR/config.ts" << EOF
// Auto-generated contract configuration
// DO NOT EDIT MANUALLY - Generated during container startup

export const CONTRACT_ADDRESS = "${CONTRACT_ADDRESS}";
export const BLOCKCHAIN_RPC_URL = "${VITE_BLOCKCHAIN_RPC_URL:-http://localhost:8545}";
EOF
  echo "TypeScript config generated at $CONTRACTS_DIR/config.ts"
fi


echo "Contract configuration step completed!"
