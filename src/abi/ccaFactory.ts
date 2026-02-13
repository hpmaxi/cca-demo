export const ccaFactoryAbi = [
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
  {
    type: "function",
    name: "getAuctionAddress",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "configData", type: "bytes" },
      { name: "salt", type: "bytes32" },
      { name: "sender", type: "address" },
    ],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
] as const

export const CCA_FACTORY_ADDRESS = "0xCCccCcCAE7503Cac057829BF2811De42E16e0bD5" as const

/**
 * Earliest block to scan for AuctionCreated events per chain.
 * Querying from block 0 exceeds RPC range limits on most providers.
 * These are set slightly before the first known deployment on each chain.
 */
export const CCA_FACTORY_DEPLOY_BLOCK: Record<number, bigint> = {
  1: 21_000_000n,       // mainnet — conservative estimate
  11155111: 10_200_000n, // sepolia — factory deployed around block ~10,240,000
  8453: 25_000_000n,     // base
  42161: 280_000_000n,   // arbitrum
  31337: 0n,             // anvil fork
}
