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
