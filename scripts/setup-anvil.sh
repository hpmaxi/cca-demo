#!/bin/bash
#
# CCA Launchpad — Anvil Fork Setup
#
# This script starts an Anvil fork of Sepolia where the CCA factory is deployed.
# After starting, run the deploy script to create a test auction.
#
# Prerequisites:
#   - Foundry installed (https://getfoundry.sh)
#   - Or: curl -L https://foundry.paradigm.xyz | bash && foundryup
#
# Usage:
#   chmod +x scripts/setup-anvil.sh
#   ./scripts/setup-anvil.sh
#

set -e

SEPOLIA_RPC="${SEPOLIA_RPC:-https://ethereum-sepolia-rpc.publicnode.com}"
CHAIN_ID=31337
BLOCK_TIME=12

echo "================================================="
echo "  CCA Launchpad — Anvil Fork (Sepolia)"
echo "================================================="
echo ""
echo "  RPC:        $SEPOLIA_RPC"
echo "  Chain ID:   $CHAIN_ID"
echo "  Block Time: ${BLOCK_TIME}s"
echo ""
echo "  CCA Factory: 0xCCccCcCAE7503Cac057829BF2811De42E16e0bD5"
echo "  Liquidity Launcher: 0x00000008412db3394C91A5CbD01635c6d140637C"
echo ""
echo "  Default accounts funded with 10000 ETH each."
echo "  Account 0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "  Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
echo ""
echo "  Connect MetaMask to: http://127.0.0.1:8545"
echo "  Chain ID: $CHAIN_ID"
echo ""
echo "  After Anvil is running, in another terminal run:"
echo "    node scripts/deploy-test-auction.mjs"
echo ""
echo "================================================="
echo ""

anvil \
  --fork-url "$SEPOLIA_RPC" \
  --chain-id "$CHAIN_ID" \
  --block-time "$BLOCK_TIME" \
  --host 0.0.0.0 \
  --accounts 10 \
  --balance 10000
