import {
  Badge,
  Box,
  Card,
  HStack,
  SimpleGrid,
  Text,
} from "@chakra-ui/react"
import { Tabs } from "@chakra-ui/react"
import { AuctionTimeline } from "./AuctionTimeline"
import { ClearingPriceChart } from "./ClearingPriceChart"
import { DemandChart } from "./DemandChart"
import type { Auction } from "../../mock/types"
import { InfoLabel } from "../shared/InfoLabel"
import { UsdEquivalent } from "../shared/UsdEquivalent"
import { blocksToTime } from "../../lib/format"
import { glossary } from "../../lib/glossary"

interface Props {
  auction: Auction
  currentBlock: number
}

export function AdvancedDetails({ auction, currentBlock }: Props) {
  const durationBlocks = auction.endBlock - auction.startBlock

  return (
    <Box display="flex" flexDirection="column" gap="6">
      {/* Price Discovery Chart */}
      <Card.Root variant="outline">
        <Card.Header>
          <Text fontWeight="bold">Price Discovery</Text>
          <Text fontSize="sm" color="fg.muted">
            How the clearing price has evolved over time.
          </Text>
        </Card.Header>
        <Card.Body>
          <ClearingPriceChart
            data={auction.priceHistory}
            currency={auction.currency}
            floorPrice={parseFloat(auction.floorPrice)}
          />
        </Card.Body>
      </Card.Root>

      {/* Tabbed Content */}
      <Card.Root variant="outline">
        <Card.Body>
          <Tabs.Root defaultValue="details">
            <Tabs.List>
              <Tabs.Trigger value="details">Token Details</Tabs.Trigger>
              <Tabs.Trigger value="demand">Demand Curve</Tabs.Trigger>
              <Tabs.Trigger value="schedule">Supply Schedule</Tabs.Trigger>
              <Tabs.Trigger value="timeline">Timeline</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="details">
              <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" pt="4">
                <Box>
                  <InfoLabel label="Min Price" glossaryKey="floorPrice" />
                  <Text fontFamily="mono" fontWeight="medium">
                    {auction.floorPrice} {auction.currency}
                  </Text>
                </Box>
                <Box>
                  <InfoLabel label="Price Increment" glossaryKey="tickSpacing" />
                  <Text fontFamily="mono" fontWeight="medium">
                    {auction.tickSpacing}
                  </Text>
                </Box>
                <Box>
                  <InfoLabel label="Total Supply" glossaryKey="totalSupply" />
                  <Text fontFamily="mono" fontWeight="medium">
                    {parseFloat(auction.token.totalSupply).toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <InfoLabel label="Duration" glossaryKey="duration" />
                  <Text fontFamily="mono" fontWeight="medium">
                    {blocksToTime(durationBlocks)}
                  </Text>
                  <Text fontSize="2xs" color="fg.muted" fontFamily="mono">
                    {durationBlocks.toLocaleString()} blocks
                  </Text>
                </Box>
                <Box>
                  <InfoLabel label="Access" glossaryKey="gatekeeping" />
                  <Badge size="sm" variant="outline">
                    {auction.gatekeeping.mode === "none" ? "Open" : auction.gatekeeping.mode}
                  </Badge>
                  <Text fontSize="2xs" color="fg.muted" mt="0.5">
                    {glossary[`gate.${auction.gatekeeping.mode}`]}
                  </Text>
                </Box>
                <Box>
                  <InfoLabel label="Fundraising Goal" glossaryKey="graduationThreshold" />
                  <HStack gap="1">
                    <Text fontFamily="mono" fontWeight="medium">
                      {auction.requiredCurrencyRaised} {auction.currency}
                    </Text>
                  </HStack>
                  <UsdEquivalent amount={auction.requiredCurrencyRaised} currency={auction.currency} fontSize="xs" />
                </Box>
                <Box>
                  <InfoLabel label="Raised So Far" glossaryKey="currencyRaised" />
                  <HStack gap="1">
                    <Text fontFamily="mono" fontWeight="medium">
                      {auction.currencyRaised} {auction.currency}
                    </Text>
                  </HStack>
                  <UsdEquivalent amount={auction.currencyRaised} currency={auction.currency} fontSize="xs" />
                </Box>
                <Box>
                  <InfoLabel label="Participants" glossaryKey="participants" />
                  <Text fontWeight="medium">
                    {auction.participants.toLocaleString()}
                  </Text>
                </Box>
              </SimpleGrid>
            </Tabs.Content>

            <Tabs.Content value="demand">
              <Box pt="4">
                <DemandChart
                  data={auction.demandByTick}
                  currency={auction.currency}
                />
              </Box>
            </Tabs.Content>

            <Tabs.Content value="schedule">
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4" pt="4">
                {auction.steps.map((step, i) => (
                  <Box key={i} p="3" rounded="lg" borderWidth="1px" borderColor="border.muted">
                    <Text fontSize="sm" fontWeight="medium">
                      Segment {i + 1}
                    </Text>
                    <HStack gap="4" mt="1" fontSize="sm" color="fg.muted">
                      <Text fontFamily="mono">{step.percentage}%</Text>
                      <Text fontFamily="mono">
                        {blocksToTime(step.blockDelta)} ({step.blockDelta.toLocaleString()} blocks)
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Tabs.Content>

            <Tabs.Content value="timeline">
              <Box pt="4">
                <AuctionTimeline
                  startBlock={auction.startBlock}
                  endBlock={auction.endBlock}
                  currentBlock={currentBlock}
                />
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
