export const liquidityLauncherAbi = [
  {
    type: "function",
    name: "createToken",
    inputs: [
      { name: "factory", type: "address" },
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "decimals", type: "uint8" },
      { name: "initialSupply", type: "uint128" },
      { name: "recipient", type: "address" },
      { name: "tokenData", type: "bytes" },
    ],
    outputs: [{ name: "tokenAddress", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "distributeToken",
    inputs: [
      { name: "token", type: "address" },
      {
        name: "distribution",
        type: "tuple",
        components: [
          { name: "strategy", type: "address" },
          { name: "amount", type: "uint128" },
          { name: "configData", type: "bytes" },
        ],
      },
      { name: "payerIsUser", type: "bool" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [{ name: "distributionContract", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "multicall",
    inputs: [{ name: "data", type: "bytes[]" }],
    outputs: [{ name: "results", type: "bytes[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "TokenCreated",
    inputs: [{ name: "token", type: "address", indexed: true }],
  },
  {
    type: "event",
    name: "TokenDistributed",
    inputs: [
      { name: "token", type: "address", indexed: true },
      { name: "distributionContract", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const

export const LIQUIDITY_LAUNCHER = "0x00000008412db3394C91A5CbD01635c6d140637C" as const
export const UERC20_FACTORY = "0x0cde87c11b959e5eb0924c1abf5250ee3f9bd1b5" as const
