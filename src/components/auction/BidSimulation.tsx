import { useEffect, useRef, useState } from "react"
import { Badge, Box, Flex, Text } from "@chakra-ui/react"
import { InfoLabel } from "../shared/InfoLabel"

interface Props {
  maxPrice: string
  budget: string
  clearingPrice: string
  floorPrice: string
  currency: string
  tokenSymbol: string
}

function useSmoothNumber(target: number, duration = 500): number {
  const [display, setDisplay] = useState(target)
  const animRef = useRef<number>(0)
  const startRef = useRef(display)
  const startTimeRef = useRef(0)

  useEffect(() => {
    startRef.current = display
    startTimeRef.current = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const value = startRef.current + (target - startRef.current) * eased
      setDisplay(value)
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  return display
}

export function BidSimulation({
  maxPrice,
  budget,
  clearingPrice,
  floorPrice,
  currency,
  tokenSymbol,
}: Props) {
  const parsedMax = parseFloat(maxPrice) || 0
  const parsedBudget = parseFloat(budget) || 0
  const parsedClearing = parseFloat(clearingPrice) || 0
  const parsedFloor = parseFloat(floorPrice) || 0

  // Token estimate: budget / clearingPrice
  const rawTokenEstimate =
    parsedClearing > 0 ? parsedBudget / parsedClearing : 0
  const animatedTokens = useSmoothNumber(rawTokenEstimate)

  // Price bar positioning
  const barMax = Math.max(parsedMax, parsedClearing, parsedFloor) * 1.3 || 1
  const floorPct = (parsedFloor / barMax) * 100
  const clearingPct = (parsedClearing / barMax) * 100
  const userPct = (parsedMax / barMax) * 100

  // Price impact
  const impact: "above" | "at" | "below" =
    parsedMax > 0
      ? parsedMax > parsedClearing
        ? "above"
        : parsedMax === parsedClearing
          ? "at"
          : "below"
      : "at"

  const impactColor =
    impact === "above" ? "green" : impact === "at" ? "orange" : "red"
  const impactLabel =
    impact === "above"
      ? "Safe — above current price"
      : impact === "at"
        ? "On the edge — at current price"
        : "May not fill — below current price"
  const impactDescription =
    impact === "above"
      ? "Your bid will be filled at the current price."
      : impact === "at"
        ? "Your bid is right at the cutoff."
        : "The current price is above your max."

  return (
    <Flex direction="column" gap="5" h="full" justify="center">
      {/* Price position bar */}
      <Box>
        <InfoLabel label="Price Position" tip="Shows where your bid sits relative to the current price and minimum." />
        <Box
          position="relative"
          h="8"
          bg="bg.muted"
          borderRadius="md"
          overflow="hidden"
          mt="2"
        >
          {/* Floor marker */}
          <Box
            position="absolute"
            left={`${floorPct}%`}
            top="0"
            bottom="0"
            w="2px"
            bg="fg.muted"
            transition="left 0.3s"
          />
          {/* Clearing marker */}
          <Box
            position="absolute"
            left={`${clearingPct}%`}
            top="0"
            bottom="0"
            w="2px"
            bg="orange.500"
            transition="left 0.3s"
          />
          {/* User bid marker */}
          {parsedMax > 0 && (
            <Box
              position="absolute"
              left={`${userPct}%`}
              top="0"
              bottom="0"
              w="3px"
              bg="blue.500"
              borderRadius="sm"
              transition="left 0.3s"
            />
          )}
        </Box>
        <Flex justify="space-between" mt="1">
          <Text fontSize="2xs" color="fg.muted">
            Min ({parsedFloor} {currency})
          </Text>
          <Text fontSize="2xs" color="orange.500">
            Current Price ({parsedClearing} {currency})
          </Text>
          {parsedMax > 0 && (
            <Text fontSize="2xs" color="blue.500">
              Your Bid ({parsedMax} {currency})
            </Text>
          )}
        </Flex>
      </Box>

      {/* Animated token estimate */}
      <Box>
        <InfoLabel label="Estimated Tokens" tip="How many tokens you'd receive based on the current price." />
        <Text fontSize="3xl" fontWeight="bold" fontFamily="mono" mt="1">
          {animatedTokens > 0
            ? animatedTokens.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : "—"}
        </Text>
        <Text fontSize="sm" color="fg.muted">
          {tokenSymbol}
          {parsedBudget > 0 && parsedClearing > 0 && (
            <>
              {" "}
              ({parsedBudget} {currency} / {parsedClearing} {currency})
            </>
          )}
        </Text>
        <Text fontSize="xs" color="fg.muted" mt="1">
          Based on current price. Final amount may differ.
        </Text>
      </Box>

      {/* Price impact badge */}
      {parsedMax > 0 && (
        <Box>
          <InfoLabel label="Price Impact" tip="Whether your bid is likely to be filled based on the current price." />
          <Badge colorPalette={impactColor} size="lg" mt="1">
            {impactLabel}
          </Badge>
          <Text fontSize="xs" color="fg.muted" mt="1">
            {impactDescription}
          </Text>
        </Box>
      )}
    </Flex>
  )
}
