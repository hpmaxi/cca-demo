import { Box, Text } from "@chakra-ui/react"
import type { AuctionStatus } from "../../mock/types"

const messages: Record<AuctionStatus, string> = {
  live: "This auction is accepting bids. Set your max price and budget below. Everyone pays the same final price when it ends.",
  upcoming: "This auction hasn't started yet. Check back when bidding opens.",
  completed: "Bidding has ended. If your bid was filled, you can claim your tokens.",
  graduated: "This auction reached its fundraising goal. Tokens are ready to claim.",
}

const colors: Record<AuctionStatus, { bg: string; fg: string }> = {
  live: { bg: "orange.subtle", fg: "orange.fg" },
  upcoming: { bg: "gray.subtle", fg: "fg.muted" },
  completed: { bg: "blue.subtle", fg: "blue.fg" },
  graduated: { bg: "green.subtle", fg: "green.fg" },
}

export function AuctionExplainer({ status }: { status: AuctionStatus }) {
  return (
    <Box p="4" bg={colors[status].bg} rounded="md">
      <Text fontSize="sm" color={colors[status].fg}>
        {messages[status]}
      </Text>
    </Box>
  )
}
