import { Box, Flex, Text, VStack } from "@chakra-ui/react"
import { ClearingBlock } from "./ClearingBlock"
import type { CCABid, CCACheckpoint } from "../../hooks/useCCA"
import type { Address } from "viem"

interface Props {
  checkpoints: CCACheckpoint[]
  bids: CCABid[]
  userAddress: Address | undefined
  loading: boolean
}

/**
 * The clearing timeline: a scrollable list of block-by-block clearing snapshots.
 * Newest blocks at the top. Each block shows how bids were cleared.
 */
export function ClearingTimeline({ checkpoints, bids, userAddress, loading }: Props) {
  if (loading && checkpoints.length === 0) {
    return (
      <Box p="8" textAlign="center" color="fg.muted">
        <Text fontSize="sm">Loading clearing history...</Text>
      </Box>
    )
  }

  if (checkpoints.length === 0) {
    return (
      <Box p="8" textAlign="center" color="fg.muted" borderWidth="1px" borderColor="border.muted" borderStyle="dashed" rounded="lg">
        <Text fontWeight="medium" mb="1">No clearing data yet</Text>
        <Text fontSize="sm">
          Clearing snapshots appear here as bids come in and blocks are mined.
          Each block shows how the price is discovered.
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="3">
        <Text fontWeight="bold" fontSize="lg">
          Clearing History
        </Text>
        <Text fontSize="xs" color="fg.muted" fontFamily="mono">
          {checkpoints.length} block{checkpoints.length !== 1 ? "s" : ""} with activity
        </Text>
      </Flex>

      <Text fontSize="sm" color="fg.muted" mb="4">
        Each row = one block. Bars show bids sorted by price (highest → lowest).
        Green bars are above the clearing price (filled). Gray bars are below (not filled).
        Everyone pays the same clearing price.
      </Text>

      <VStack gap="3" align="stretch" maxH="600px" overflowY="auto" pr="1">
        {checkpoints.map((cp, i) => (
          <ClearingBlock
            key={cp.blockNumber.toString()}
            checkpoint={cp}
            bids={bids}
            userAddress={userAddress}
            isLatest={i === 0}
          />
        ))}
      </VStack>
    </Box>
  )
}
