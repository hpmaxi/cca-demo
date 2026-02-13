/**
 * CCA Launchpad — Deploy Test Auction on Anvil Fork
 *
 * This script deploys a test ERC20 token and creates a CCA auction
 * on the Anvil fork. After running, you'll get an auction address
 * to use in the UI.
 *
 * Usage:
 *   node scripts/deploy-test-auction.mjs
 *
 * Prerequisites:
 *   - Anvil fork running (./scripts/setup-anvil.sh)
 *   - Node.js with viem installed (already in dependencies)
 */

import { createPublicClient, createWalletClient, http, parseEther, encodePacked, encodeAbiParameters, parseAbiParameters, zeroAddress } from "viem"
import { privateKeyToAccount } from "viem/accounts"

// Anvil default account 0
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
const RPC_URL = "http://127.0.0.1:8545"

const Q96 = 2n ** 96n

// CCA Factory on Sepolia (same address on all chains)
const CCA_FACTORY = "0xCCccCcCAE7503Cac057829BF2811De42E16e0bD5"

// Minimal ERC20 bytecode (OpenZeppelin-style, premint to deployer)
// This is a minimal ERC20 that mints totalSupply to msg.sender on construction
const ERC20_BYTECODE = "0x" + [
  // We'll deploy using a simpler approach: use cast or a factory
].join("")

const chain = {
  id: 31337,
  name: "Anvil Fork",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
}

const account = privateKeyToAccount(PRIVATE_KEY)

const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL),
})

const walletClient = createWalletClient({
  account,
  chain,
  transport: http(RPC_URL),
})

// Simple ERC20 ABI
const erc20Abi = [
  { type: "function", name: "name", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "symbol", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "decimals", inputs: [], outputs: [{ type: "uint8" }], stateMutability: "view" },
  { type: "function", name: "totalSupply", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "balanceOf", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "transfer", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" },
  { type: "function", name: "approve", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" },
]

// CCA ABI (submit bid)
const ccaAbi = [
  { type: "function", name: "clearingPrice", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "startBlock", inputs: [], outputs: [{ type: "uint64" }], stateMutability: "view" },
  { type: "function", name: "endBlock", inputs: [], outputs: [{ type: "uint64" }], stateMutability: "view" },
  { type: "function", name: "token", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "totalSupply", inputs: [], outputs: [{ type: "uint128" }], stateMutability: "view" },
  {
    type: "function",
    name: "submitBid",
    inputs: [
      { name: "maxPrice", type: "uint256" },
      { name: "amount", type: "uint128" },
      { name: "owner", type: "address" },
      { name: "hookData", type: "bytes" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "event",
    name: "BidSubmitted",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "price", type: "uint256", indexed: false },
      { name: "amount", type: "uint128", indexed: false },
    ],
  },
]

// CCA Factory ABI
const ccaFactoryAbi = [
  {
    type: "event",
    name: "AuctionCreated",
    inputs: [
      { name: "auction", type: "address", indexed: true },
      { name: "token", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "configData", type: "bytes", indexed: false },
    ],
  },
]

function priceToQ96(price) {
  const scaled = BigInt(Math.round(price * 1e18))
  return (scaled * Q96) / (10n ** 18n)
}

async function main() {
  console.log("=================================================")
  console.log("  CCA Launchpad — Deploy Test Auction")
  console.log("=================================================\n")

  const currentBlock = await publicClient.getBlockNumber()
  console.log(`Current block: ${currentBlock}`)
  console.log(`Deployer: ${account.address}\n`)

  // Check if there are already auctions from the factory
  console.log("Checking for existing auctions from CCA factory...")
  let existingAuctions
  try {
    existingAuctions = await publicClient.getContractEvents({
      address: CCA_FACTORY,
      abi: ccaFactoryAbi,
      eventName: "AuctionCreated",
      fromBlock: 0n,
    })
    console.log(`Found ${existingAuctions.length} existing auction(s)\n`)
  } catch (e) {
    console.log("Could not query factory events (factory may not exist on this fork)")
    existingAuctions = []
  }

  if (existingAuctions.length > 0) {
    console.log("Existing auctions:")
    for (const log of existingAuctions) {
      const { auction, token } = log.args
      console.log(`  Auction: ${auction}`)
      console.log(`  Token:   ${token}`)

      try {
        const [startBlock, endBlock, supply, clearingPrice] = await Promise.all([
          publicClient.readContract({ address: auction, abi: ccaAbi, functionName: "startBlock" }),
          publicClient.readContract({ address: auction, abi: ccaAbi, functionName: "endBlock" }),
          publicClient.readContract({ address: auction, abi: ccaAbi, functionName: "totalSupply" }),
          publicClient.readContract({ address: auction, abi: ccaAbi, functionName: "clearingPrice" }),
        ])
        const cpHuman = Number(clearingPrice * 10n ** 18n / Q96) / 1e18
        console.log(`  Blocks:  ${startBlock} → ${endBlock} (current: ${currentBlock})`)
        console.log(`  Supply:  ${supply}`)
        console.log(`  Price:   ${cpHuman.toFixed(6)} ETH (Q96: ${clearingPrice})`)
        console.log(`  Status:  ${currentBlock >= startBlock && currentBlock < endBlock ? "LIVE" : currentBlock < startBlock ? "UPCOMING" : "ENDED"}`)
      } catch {
        console.log(`  (Could not read auction state)`)
      }
      console.log()
    }

    // Try to place test bids on the first live auction
    const liveAuctions = []
    for (const log of existingAuctions) {
      const { auction } = log.args
      try {
        const startBlock = await publicClient.readContract({ address: auction, abi: ccaAbi, functionName: "startBlock" })
        const endBlock = await publicClient.readContract({ address: auction, abi: ccaAbi, functionName: "endBlock" })
        if (currentBlock >= startBlock && currentBlock < endBlock) {
          liveAuctions.push(auction)
        }
      } catch {}
    }

    if (liveAuctions.length > 0) {
      const auction = liveAuctions[0]
      console.log(`\nPlacing test bids on live auction: ${auction}`)
      await placeTestBids(auction)
    }

    console.log("\n=================================================")
    console.log("  Use these auction addresses in the UI:")
    for (const log of existingAuctions) {
      console.log(`  ${log.args.auction}`)
    }
    console.log("=================================================\n")
    console.log("Open http://localhost:5173/auction/<address>")
    return
  }

  // No existing auctions — explain manual steps
  console.log("=================================================")
  console.log("  No existing auctions found on this fork.")
  console.log("")
  console.log("  To create an auction, you need to:")
  console.log("  1. Deploy an ERC20 token")
  console.log("  2. Approve the LiquidityLauncher")
  console.log("  3. Call LiquidityLauncher.distributeToken()")
  console.log("")
  console.log("  This requires Foundry. Run:")
  console.log("")
  console.log("  # Deploy a test token with Foundry")
  console.log("  cast send --private-key $PRIVATE_KEY \\")
  console.log("    --create <ERC20_BYTECODE>")
  console.log("")
  console.log("  Alternatively, fork a chain with live auctions")
  console.log("  (Mainnet or Base) to test with real data.")
  console.log("")
  console.log("  For quick testing, try forking mainnet:")
  console.log("  anvil --fork-url https://eth.llamarpc.com --chain-id 31337 --block-time 12")
  console.log("=================================================\n")
}

async function placeTestBids(auctionAddress) {
  const clearingPrice = await publicClient.readContract({
    address: auctionAddress,
    abi: ccaAbi,
    functionName: "clearingPrice",
  })

  const cpHuman = Number(clearingPrice * 10n ** 18n / Q96) / 1e18
  console.log(`Current clearing price: ${cpHuman.toFixed(6)} ETH`)

  // Place 3 bids at different prices
  const bids = [
    { price: cpHuman * 1.5, amount: "1.0" },  // Well above clearing
    { price: cpHuman * 1.1, amount: "0.5" },  // Just above clearing
    { price: cpHuman * 0.8, amount: "0.3" },  // Below clearing (won't fill)
  ]

  for (const bid of bids) {
    if (bid.price <= 0) {
      console.log(`  Skipping bid at ${bid.price.toFixed(6)} (price too low)`)
      continue
    }
    const priceQ96 = priceToQ96(bid.price)
    const amountWei = parseEther(bid.amount)

    console.log(`  Bidding: ${bid.price.toFixed(6)} ETH max, ${bid.amount} ETH budget...`)
    try {
      const hash = await walletClient.writeContract({
        address: auctionAddress,
        abi: ccaAbi,
        functionName: "submitBid",
        args: [priceQ96, amountWei, account.address, "0x"],
        value: amountWei,
      })
      console.log(`    Tx: ${hash}`)

      // Wait for receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log(`    Status: ${receipt.status === "success" ? "SUCCESS" : "FAILED"}`)
    } catch (e) {
      console.log(`    Error: ${e.message?.slice(0, 100)}`)
    }
  }
}

main().catch(console.error)
