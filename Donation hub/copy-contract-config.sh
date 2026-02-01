
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


  BADGE_ADDRESS=$(sed -n 's/.*"contractAddress":"\([^"]*\)".*/\1/p' "$SHARED_CONFIG")
  MARKETPLACE_ADDRESS=$(sed -n 's/.*"marketplaceAddress":"\([^"]*\)".*/\1/p' "$SHARED_CONFIG")

  if [ -z "$BADGE_ADDRESS" ] || [ -z "$MARKETPLACE_ADDRESS" ]; then
    echo "ERROR: Failed to extract contract addresses from $SHARED_CONFIG"
    cat "$SHARED_CONFIG"
    exit 1
  fi

  echo "Badge Address: $BADGE_ADDRESS"
  echo "Marketplace Address: $MARKETPLACE_ADDRESS"

  ENV_FILE="/app/.env"
  if [ -f "$ENV_FILE" ]; then
    sed -i "s|VITE_CONTRACT_ADDRESS=.*|VITE_CONTRACT_ADDRESS=$BADGE_ADDRESS|g" "$ENV_FILE"
    sed -i "s|VITE_MARKETPLACE_ADDRESS=.*|VITE_MARKETPLACE_ADDRESS=$MARKETPLACE_ADDRESS|g" "$ENV_FILE"
    echo ".env updated"
  else
    echo "VITE_CONTRACT_ADDRESS=$BADGE_ADDRESS" > "$ENV_FILE"
    echo "VITE_MARKETPLACE_ADDRESS=$MARKETPLACE_ADDRESS" >> "$ENV_FILE"
    echo ".env created"
  fi


  if [ -f "$SHARED_ABI" ]; then
    mkdir -p "$CONTRACTS_DIR"
    cp "$SHARED_ABI" "$CONTRACTS_DIR/"
    echo "Badge ABI copied to $CONTRACTS_DIR/DonationBadge.json"
  fi

  SHARED_MARKET_ABI="/app/shared/BadgeMarketplace.json"
  if [ -f "$SHARED_MARKET_ABI" ]; then
    mkdir -p "$CONTRACTS_DIR"
    cp "$SHARED_MARKET_ABI" "$CONTRACTS_DIR/"
    echo "Marketplace ABI copied to $CONTRACTS_DIR/BadgeMarketplace.json"
  fi

 
  mkdir -p "$CONTRACTS_DIR"
  cat > "$CONTRACTS_DIR/config.ts" << EOF
// Auto-generated contract configuration
// DO NOT EDIT MANUALLY - Generated during container startup

export const CONTRACT_ADDRESS = "${BADGE_ADDRESS}";
export const MARKETPLACE_ADDRESS = "${MARKETPLACE_ADDRESS}";
export const BLOCKCHAIN_RPC_URL = "${VITE_BLOCKCHAIN_RPC_URL:-http://localhost:8545}";
EOF
  echo "TypeScript config generated at $CONTRACTS_DIR/config.ts"
fi


echo "Contract configuration step completed!"
