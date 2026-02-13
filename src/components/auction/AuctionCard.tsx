import {
  Badge,
  Box,
  Card,
  Flex,
  HStack,
  Progress,
  Text,
} from "@chakra-ui/react"
import { Link } from "react-router"
import type { Auction } from "../../mock/types"
import { InfoLabel } from "../shared/InfoLabel"
import { UsdEquivalent } from "../shared/UsdEquivalent"
import { blocksToTime } from "../../lib/format"

const statusColorMap: Record<string, string> = {
  live: "orange",
  upcoming: "gray",
  completed: "blue",
  graduated: "green",
}

function getTimeRemaining(auction: Auction): string | null {
  if (auction.status !== "live") return null
  const currentBlock =
    auction.startBlock +
    Math.floor((auction.endBlock - auction.startBlock) * 0.65)
  const blocksLeft = auction.endBlock - currentBlock
  if (blocksLeft <= 0) return null
  return `${blocksToTime(blocksLeft)} left`
}

export function AuctionCard({ auction }: { auction: Auction }) {
  const raised = parseFloat(auction.currencyRaised)
  const required = parseFloat(auction.requiredCurrencyRaised)
  const progress = required > 0 ? (raised / required) * 100 : 0
  const timeRemaining = getTimeRemaining(auction)

  return (
    <Link to={`/auction/${auction.id}`} style={{ textDecoration: "none" }}>
      <Card.Root
        variant="outline"
        _hover={{ borderColor: "border.emphasized", shadow: "md", transform: "translateY(-2px)" }}
        transition="all 0.2s"
        cursor="pointer"
      >
        <Card.Body gap="4">
          <Flex justify="space-between" align="start">
            <Box>
              <Text fontWeight="bold" fontSize="lg">
                {auction.token.name}
              </Text>
              <Text color="fg.muted" fontSize="sm" fontFamily="mono">
                ${auction.token.symbol}
              </Text>
            </Box>
            <HStack gap="2">
              {timeRemaining && (
                <Text fontSize="xs" color="fg.muted">
                  {timeRemaining}
                </Text>
              )}
              <Badge colorPalette={statusColorMap[auction.status]} size="sm">
                {auction.status}
              </Badge>
            </HStack>
          </Flex>

          <Flex gap="6" wrap="wrap">
            <Box>
              <InfoLabel label="Min Price" glossaryKey="floorPrice" />
              <HStack gap="1">
                <Text fontFamily="mono" fontWeight="medium">
                  {auction.floorPrice} {auction.currency}
                </Text>
                <UsdEquivalent amount={auction.floorPrice} currency={auction.currency} fontSize="xs" />
              </HStack>
            </Box>
            <Box>
              <InfoLabel label="Current Price" glossaryKey="clearingPrice" />
              <HStack gap="1">
                <Text fontFamily="mono" fontWeight="medium">
                  {auction.currentClearingPrice} {auction.currency}
                </Text>
                <UsdEquivalent amount={auction.currentClearingPrice} currency={auction.currency} fontSize="xs" />
              </HStack>
            </Box>
            <Box>
              <InfoLabel label="Participants" glossaryKey="participants" />
              <Text fontWeight="medium">
                {auction.participants.toLocaleString()}
              </Text>
            </Box>
          </Flex>

          <Box>
            <HStack justify="space-between" mb="1">
              <HStack gap="1">
                <Text fontSize="xs" color="fg.muted">
                  {raised.toLocaleString()} / {required.toLocaleString()}{" "}
                  {auction.currency} raised
                </Text>
                <UsdEquivalent amount={raised} currency={auction.currency} fontSize="xs" />
              </HStack>
              <Text fontSize="xs" color="fg.muted">
                {Math.round(progress)}%
              </Text>
            </HStack>
            <Progress.Root
              value={progress}
              size="sm"
              colorPalette={auction.status === "graduated" ? "green" : "brand"}
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </Box>
        </Card.Body>
      </Card.Root>
    </Link>
  )
}
