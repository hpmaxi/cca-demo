import { Box, Flex, Text } from "@chakra-ui/react"
import { blockToRelativeTime, blocksToTime } from "../../lib/format"

interface Props {
  startBlock: number
  endBlock: number
  currentBlock: number
}

export function AuctionTimeline({ startBlock, endBlock, currentBlock }: Props) {
  const total = endBlock - startBlock
  const elapsed = Math.min(Math.max(currentBlock - startBlock, 0), total)
  const progress = total > 0 ? (elapsed / total) * 100 : 0

  const startLabel = currentBlock >= startBlock
    ? `Started ${blockToRelativeTime(startBlock, currentBlock)}`
    : `Starts ${blockToRelativeTime(startBlock, currentBlock)}`
  const endLabel = currentBlock >= endBlock
    ? `Ended ${blockToRelativeTime(endBlock, currentBlock)}`
    : `Ends ${blockToRelativeTime(endBlock, currentBlock)}`

  return (
    <Box>
      <Flex justify="space-between" mb="2">
        <Box>
          <Text fontSize="xs" color="fg.muted">
            {startLabel}
          </Text>
          <Text fontSize="2xs" color="fg.muted" fontFamily="mono">
            Block {startBlock.toLocaleString()}
          </Text>
        </Box>
        <Text fontSize="xs" fontWeight="medium">
          {blocksToTime(total)} total
        </Text>
        <Box textAlign="right">
          <Text fontSize="xs" color="fg.muted">
            {endLabel}
          </Text>
          <Text fontSize="2xs" color="fg.muted" fontFamily="mono">
            Block {endBlock.toLocaleString()}
          </Text>
        </Box>
      </Flex>
      <Box position="relative" h="4" bg="bg.muted" rounded="full" overflow="hidden">
        <Box
          h="full"
          bg="brand.solid"
          rounded="full"
          w={`${progress}%`}
          transition="width 1s"
        />
        <Box
          position="absolute"
          top="50%"
          left={`${progress}%`}
          transform="translate(-50%, -50%)"
          w="3"
          h="3"
          bg="brand.solid"
          rounded="full"
          borderWidth="2px"
          borderColor="bg"
          shadow="sm"
        />
      </Box>
      <Flex justify="center" mt="1">
        <Text fontSize="xs" color="fg.muted">
          {Math.round(progress)}% complete
        </Text>
      </Flex>
    </Box>
  )
}
