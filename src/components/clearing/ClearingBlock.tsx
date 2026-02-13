import { Box, Flex, Text, HStack } from "@chakra-ui/react"
import type { CCABid, CCACheckpoint } from "../../hooks/useCCA"
import type { Address } from "viem"

interface Props {
  checkpoint: CCACheckpoint
  bids: CCABid[]
  userAddress: Address | undefined
  isLatest?: boolean
}

/**
 * Renders a single block's clearing visualization.
 *
 * Shows an order-book style bar chart:
 * - Each bar = demand at a price level (tick)
 * - Bars sorted by price from highest (left) to lowest (right)
 * - Green = above clearing price (filled)
 * - Amber = at clearing price (partially filled)
 * - Gray = below clearing price (not filled)
 * - Teal highlight = user's bid
 */
export function ClearingBlock({ checkpoint, bids, userAddress, isLatest }: Props) {
  const clearingPrice = checkpoint.clearingPriceHuman

  // Aggregate bids by price level (group close prices)
  const tickMap = new Map<number, { total: number; userAmount: number }>()
  for (const bid of bids) {
    const price = bid.priceHuman
    // Round to 6 decimals to group similar prices
    const key = Math.round(price * 1e6) / 1e6
    const existing = tickMap.get(key) ?? { total: 0, userAmount: 0 }
    existing.total += bid.amountHuman
    if (userAddress && bid.owner.toLowerCase() === userAddress.toLowerCase()) {
      existing.userAmount += bid.amountHuman
    }
    tickMap.set(key, existing)
  }

  // Sort ticks by price descending (highest first = left)
  const ticks = Array.from(tickMap.entries())
    .map(([price, { total, userAmount }]) => ({ price, total, userAmount }))
    .sort((a, b) => b.price - a.price)

  if (ticks.length === 0) {
    return (
      <Box
        p="4"
        rounded="lg"
        borderWidth="1px"
        borderColor="border.muted"
        bg={isLatest ? "brand.50" : "bg"}
        _dark={{ bg: isLatest ? "brand.950" : "bg" }}
      >
        <Flex justify="space-between" align="center" mb="2">
          <Text fontSize="sm" fontWeight="medium" fontFamily="mono">
            Block #{checkpoint.blockNumber.toString()}
          </Text>
          <Text fontSize="sm" fontFamily="mono" color="brand.600" _dark={{ color: "brand.400" }}>
            {clearingPrice.toFixed(6)} ETH
          </Text>
        </Flex>
        <Text fontSize="xs" color="fg.muted">No bids at this block</Text>
      </Box>
    )
  }

  const maxTotal = Math.max(...ticks.map((t) => t.total), 0.001)

  return (
    <Box
      p="4"
      rounded="lg"
      borderWidth="1px"
      borderColor={isLatest ? "brand.300" : "border.muted"}
      _dark={{ borderColor: isLatest ? "brand.700" : "border.muted" }}
      bg={isLatest ? "brand.50" : "bg"}
      _darkBg={isLatest ? "brand.950" : "bg"}
      css={isLatest ? {
        animation: "slideIn 0.4s ease-out",
        "@keyframes slideIn": {
          from: { opacity: 0, transform: "translateY(-8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      } : undefined}
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb="3">
        <HStack gap="3">
          <Text fontSize="sm" fontWeight="medium" fontFamily="mono">
            Block #{checkpoint.blockNumber.toString()}
          </Text>
          {isLatest && (
            <Box px="2" py="0.5" rounded="full" bg="brand.600" color="white" fontSize="10px" fontWeight="bold">
              LATEST
            </Box>
          )}
        </HStack>
        <HStack gap="4">
          <Text fontSize="xs" color="fg.muted">
            Clearing Price
          </Text>
          <Text fontSize="sm" fontWeight="bold" fontFamily="mono" color="brand.600" _dark={{ color: "brand.400" }}>
            {clearingPrice.toFixed(6)} ETH
          </Text>
        </HStack>
      </Flex>

      {/* Bar Chart — horizontal bars, one per price level */}
      <Flex direction="column" gap="1">
        {ticks.map((tick) => {
          const isFilled = tick.price > clearingPrice
          const isAtClearing = Math.abs(tick.price - clearingPrice) < 1e-8
          const hasUserBid = tick.userAmount > 0
          const barWidth = Math.max(4, (tick.total / maxTotal) * 100)

          let barColor = "gray.200"
          let barDarkColor = "gray.700"
          if (isFilled) {
            barColor = "green.400"
            barDarkColor = "green.600"
          }
          if (isAtClearing) {
            barColor = "orange.400"
            barDarkColor = "orange.500"
          }

          return (
            <Flex key={tick.price} align="center" gap="2" h="7">
              {/* Price label */}
              <Text
                fontSize="10px"
                fontFamily="mono"
                color={hasUserBid ? "brand.600" : "fg.muted"}
                _dark={{ color: hasUserBid ? "brand.400" : "fg.muted" }}
                fontWeight={hasUserBid ? "bold" : "normal"}
                w="70px"
                textAlign="right"
                flexShrink={0}
              >
                {tick.price.toFixed(6)}
              </Text>

              {/* Bar */}
              <Box flex="1" position="relative" h="full">
                <Box
                  h="full"
                  w={`${barWidth}%`}
                  bg={barColor}
                  _dark={{ bg: barDarkColor }}
                  rounded="sm"
                  position="relative"
                  transition="width 0.3s ease"
                >
                  {/* User portion overlay */}
                  {hasUserBid && (
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      h="full"
                      w={`${Math.max(4, (tick.userAmount / tick.total) * 100)}%`}
                      bg="brand.500"
                      rounded="sm"
                      borderWidth="1px"
                      borderColor="brand.700"
                    />
                  )}
                </Box>

                {/* Clearing price indicator line */}
                {isAtClearing && (
                  <Box
                    position="absolute"
                    top="-2px"
                    left="0"
                    right="0"
                    h="calc(100% + 4px)"
                    borderLeftWidth="2px"
                    borderColor="orange.500"
                    borderStyle="dashed"
                    pointerEvents="none"
                  />
                )}
              </Box>

              {/* Amount label */}
              <Text fontSize="10px" fontFamily="mono" color="fg.muted" w="65px" flexShrink={0}>
                {tick.total.toFixed(2)} ETH
              </Text>

              {/* User indicator */}
              {hasUserBid && (
                <Text fontSize="9px" color="brand.600" _dark={{ color: "brand.400" }} fontWeight="bold" flexShrink={0}>
                  YOU
                </Text>
              )}
            </Flex>
          )
        })}
      </Flex>

      {/* Legend */}
      <Flex mt="3" gap="4" fontSize="10px" color="fg.muted" flexWrap="wrap">
        <HStack gap="1">
          <Box w="3" h="3" rounded="sm" bg="green.400" _dark={{ bg: "green.600" }} />
          <Text>Filled (above clearing)</Text>
        </HStack>
        <HStack gap="1">
          <Box w="3" h="3" rounded="sm" bg="orange.400" />
          <Text>At clearing price</Text>
        </HStack>
        <HStack gap="1">
          <Box w="3" h="3" rounded="sm" bg="gray.200" _dark={{ bg: "gray.700" }} />
          <Text>Not filled (below)</Text>
        </HStack>
        {userAddress && (
          <HStack gap="1">
            <Box w="3" h="3" rounded="sm" bg="brand.500" borderWidth="1px" borderColor="brand.700" />
            <Text>Your bid</Text>
          </HStack>
        )}
      </Flex>
    </Box>
  )
}
