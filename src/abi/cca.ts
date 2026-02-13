export const ccaAbi = [
  // Read functions
  { type: "function", name: "clearingPrice", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "currency", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "token", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "startBlock", inputs: [], outputs: [{ type: "uint64" }], stateMutability: "view" },
  { type: "function", name: "endBlock", inputs: [], outputs: [{ type: "uint64" }], stateMutability: "view" },
  { type: "function", name: "claimBlock", inputs: [], outputs: [{ type: "uint64" }], stateMutability: "view" },
  { type: "function", name: "currencyRaised", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "totalCleared", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "totalSupply", inputs: [], outputs: [{ type: "uint128" }], stateMutability: "view" },
  { type: "function", name: "isGraduated", inputs: [], outputs: [{ type: "bool" }], stateMutability: "view" },
  { type: "function", name: "tokensRecipient", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "fundsRecipient", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "validationHook", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },

  // Write functions
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
    type: "function",
    name: "exitBid",
    inputs: [{ name: "bidId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimTokens",
    inputs: [{ name: "bidId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimTokensBatch",
    inputs: [
      { name: "owner", type: "address" },
      { name: "bidIds", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sweepCurrency",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sweepUnsoldTokens",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },

  // Events
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
  {
    type: "event",
    name: "CheckpointUpdated",
    inputs: [
      { name: "blockNumber", type: "uint256", indexed: false },
      { name: "clearingPrice", type: "uint256", indexed: false },
      { name: "cumulativeMps", type: "uint24", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ClearingPriceUpdated",
    inputs: [
      { name: "blockNumber", type: "uint256", indexed: false },
      { name: "clearingPrice", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BidExited",
    inputs: [
      { name: "bidId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "tokensFilled", type: "uint256", indexed: false },
      { name: "currencyRefunded", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TokensClaimed",
    inputs: [
      { name: "bidId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "tokensFilled", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TokensReceived",
    inputs: [
      { name: "totalSupply", type: "uint256", indexed: false },
    ],
  },
] as const
