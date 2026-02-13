export type AuctionStatus = "upcoming" | "live" | "completed" | "graduated"
export type GatekeepMode = "none" | "eas" | "erc1155" | "zk-passport"

export interface AuctionStep {
  percentage: number
  blockDelta: number
  mps: number
}

export interface Auction {
  id: string
  token: {
    name: string
    symbol: string
    totalSupply: string
    decimals: number
  }
  currency: string
  floorPrice: string
  currentClearingPrice: string
  startBlock: number
  endBlock: number
  claimBlock: number
  tickSpacing: string
  requiredCurrencyRaised: string
  currencyRaised: string
  totalCleared: string
  status: AuctionStatus
  steps: AuctionStep[]
  gatekeeping: {
    mode: GatekeepMode
    config: Record<string, string>
  }
  fundsRecipient: string
  tokensRecipient: string
  participants: number
  priceHistory: { block: number; price: number }[]
  demandByTick: { price: number; demand: number }[]
}

export interface Bid {
  id: string
  auctionId: string
  maxPrice: string
  amount: string
  tokensFilled: string
  owner: string
  startBlock: number
  status: "active" | "outbid" | "filled" | "exited"
}
