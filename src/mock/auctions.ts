import type { Auction } from "./types"

function generatePriceHistory(
  startBlock: number,
  endBlock: number,
  floorPrice: number,
  status: string,
) {
  const points: { block: number; price: number }[] = []
  const blocks = status === "upcoming" ? 0 : Math.min(endBlock - startBlock, 50)
  for (let i = 0; i <= blocks; i++) {
    const block = startBlock + Math.floor((i / blocks) * (endBlock - startBlock))
    const noise = (Math.random() - 0.3) * floorPrice * 0.5
    const trend = floorPrice + (i / blocks) * floorPrice * 0.8
    points.push({ block, price: Math.max(floorPrice, trend + noise) })
  }
  return points
}

function generateDemandByTick(floorPrice: number, tickSpacing: number) {
  const ticks: { price: number; demand: number }[] = []
  for (let i = 0; i < 10; i++) {
    const price = floorPrice + i * tickSpacing
    const demand = Math.max(0, 1000 - i * 80 + Math.random() * 200)
    ticks.push({ price: Math.round(price * 1000) / 1000, demand: Math.round(demand) })
  }
  return ticks
}

export const mockAuctions: Auction[] = [
  {
    id: "1",
    token: {
      name: "Nexus Protocol",
      symbol: "NXP",
      totalSupply: "1000000000",
      decimals: 18,
    },
    currency: "ETH",
    floorPrice: "0.001",
    currentClearingPrice: "0.0018",
    startBlock: 19000000,
    endBlock: 19050000,
    claimBlock: 19060000,
    tickSpacing: "0.0001",
    requiredCurrencyRaised: "500",
    currencyRaised: "342.5",
    totalCleared: "190277778",
    status: "live",
    steps: [
      { percentage: 10, blockDelta: 5000, mps: 200 },
      { percentage: 20, blockDelta: 10000, mps: 200 },
      { percentage: 30, blockDelta: 15000, mps: 200 },
      { percentage: 40, blockDelta: 20000, mps: 200 },
    ],
    gatekeeping: { mode: "none", config: {} },
    fundsRecipient: "0x1234567890abcdef1234567890abcdef12345678",
    tokensRecipient: "0x1234567890abcdef1234567890abcdef12345678",
    participants: 847,
    priceHistory: generatePriceHistory(19000000, 19050000, 0.001, "live"),
    demandByTick: generateDemandByTick(0.001, 0.0001),
  },
  {
    id: "2",
    token: {
      name: "Aether Finance",
      symbol: "AETH",
      totalSupply: "500000000",
      decimals: 18,
    },
    currency: "USDC",
    floorPrice: "0.05",
    currentClearingPrice: "0.12",
    startBlock: 18900000,
    endBlock: 18950000,
    claimBlock: 18960000,
    tickSpacing: "0.01",
    requiredCurrencyRaised: "100000",
    currencyRaised: "125000",
    totalCleared: "500000000",
    status: "graduated",
    steps: [
      { percentage: 5, blockDelta: 2500, mps: 100 },
      { percentage: 15, blockDelta: 7500, mps: 100 },
      { percentage: 30, blockDelta: 15000, mps: 100 },
      { percentage: 50, blockDelta: 25000, mps: 100 },
    ],
    gatekeeping: {
      mode: "eas",
      config: {
        schemaUID: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        attester: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      },
    },
    fundsRecipient: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    tokensRecipient: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    participants: 2341,
    priceHistory: generatePriceHistory(18900000, 18950000, 0.05, "completed"),
    demandByTick: generateDemandByTick(0.05, 0.01),
  },
  {
    id: "3",
    token: {
      name: "Quantum Swap",
      symbol: "QSWP",
      totalSupply: "2000000000",
      decimals: 18,
    },
    currency: "ETH",
    floorPrice: "0.0005",
    currentClearingPrice: "0.0005",
    startBlock: 19100000,
    endBlock: 19200000,
    claimBlock: 19210000,
    tickSpacing: "0.00005",
    requiredCurrencyRaised: "1000",
    currencyRaised: "0",
    totalCleared: "0",
    status: "upcoming",
    steps: [
      { percentage: 25, blockDelta: 25000, mps: 200 },
      { percentage: 25, blockDelta: 25000, mps: 200 },
      { percentage: 25, blockDelta: 25000, mps: 200 },
      { percentage: 25, blockDelta: 25000, mps: 200 },
    ],
    gatekeeping: {
      mode: "erc1155",
      config: {
        tokenAddress: "0x9876543210fedcba9876543210fedcba98765432",
        tokenId: "1",
      },
    },
    fundsRecipient: "0x9876543210fedcba9876543210fedcba98765432",
    tokensRecipient: "0x9876543210fedcba9876543210fedcba98765432",
    participants: 0,
    priceHistory: [],
    demandByTick: generateDemandByTick(0.0005, 0.00005),
  },
  {
    id: "4",
    token: {
      name: "Stellar DAO",
      symbol: "STLR",
      totalSupply: "750000000",
      decimals: 18,
    },
    currency: "ETH",
    floorPrice: "0.002",
    currentClearingPrice: "0.0035",
    startBlock: 19010000,
    endBlock: 19070000,
    claimBlock: 19080000,
    tickSpacing: "0.0002",
    requiredCurrencyRaised: "800",
    currencyRaised: "456.2",
    totalCleared: "130342857",
    status: "live",
    steps: [
      { percentage: 10, blockDelta: 6000, mps: 125 },
      { percentage: 20, blockDelta: 12000, mps: 125 },
      { percentage: 30, blockDelta: 18000, mps: 125 },
      { percentage: 40, blockDelta: 24000, mps: 125 },
    ],
    gatekeeping: {
      mode: "zk-passport",
      config: {},
    },
    fundsRecipient: "0xfedcba9876543210fedcba9876543210fedcba98",
    tokensRecipient: "0xfedcba9876543210fedcba9876543210fedcba98",
    participants: 523,
    priceHistory: generatePriceHistory(19010000, 19070000, 0.002, "live"),
    demandByTick: generateDemandByTick(0.002, 0.0002),
  },
]
