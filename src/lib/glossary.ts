export const glossary: Record<string, string> = {
  // Auction concepts
  clearingPrice:
    "The price everyone pays. Updates as new bids come in.",
  floorPrice:
    "The lowest allowed price. Bids below this are rejected.",
  maxPrice:
    "The most you're willing to pay per token.",
  budget:
    "Total amount you want to spend.",
  tickSpacing:
    "Minimum gap between price levels.",
  gatekeeping:
    "Who can participate in this auction.",
  graduationThreshold:
    "Fundraising goal. The auction succeeds when this is reached.",
  participants:
    "Number of unique wallets that placed bids.",
  totalSupply:
    "How many tokens will exist in total.",
  currencyRaised:
    "Total funds contributed by all bidders so far.",
  duration:
    "How long the auction runs. Each Ethereum block is ~12 seconds.",

  // Bid statuses
  "status.active":
    "Your bid is live and in the running.",
  "status.outbid":
    "The price has moved above your max. You can exit or increase.",
  "status.filled":
    "Your bid was successful. You can claim your tokens.",
  "status.exited":
    "You cancelled this bid and got your funds back.",

  // Auction statuses
  "auction.live":
    "This auction is accepting bids right now.",
  "auction.upcoming":
    "This auction hasn't started yet.",
  "auction.completed":
    "Bidding has ended.",
  "auction.graduated":
    "This auction reached its fundraising goal.",

  // Gatekeep modes
  "gate.none":
    "Open to everyone. No requirements to participate.",
  "gate.eas":
    "Requires an on-chain attestation (EAS) to participate.",
  "gate.erc1155":
    "Requires holding a specific NFT (ERC-1155) to participate.",
  "gate.zk-passport":
    "Requires identity verification via ZK Passport.",
}
