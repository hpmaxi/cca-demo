import { Badge, Box, Card, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import type { ScheduleSegment } from "./ReleaseScheduleStep"
import type { GatekeepMode } from "../../mock/types"
import { blocksToTime } from "../../lib/format"
import { glossary } from "../../lib/glossary"

interface ReviewData {
  tokenDetails: {
    name: string
    symbol: string
    totalSupply: string
    decimals: string
  }
  auctionConfig: {
    floorPrice: string
    currency: string
    startBlock: string
    endBlock: string
    tickSpacing: string
    requiredCurrencyRaised: string
    fundsRecipient: string
    tokensRecipient: string
  }
  releaseSchedule: ScheduleSegment[]
  gatekeeping: {
    mode: GatekeepMode
    config: Record<string, string>
  }
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="space-between" py="2" borderBottomWidth="1px">
      <Text color="fg.muted" fontSize="sm">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="medium" textAlign="right" maxW="60%">
        {value || "—"}
      </Text>
    </Flex>
  )
}

export function ReviewStep({ data }: { data: ReviewData }) {
  const startNum = parseInt(data.auctionConfig.startBlock)
  const endNum = parseInt(data.auctionConfig.endBlock)
  const durationBlocks = !isNaN(startNum) && !isNaN(endNum) && endNum > startNum
    ? endNum - startNum
    : null

  return (
    <VStack gap="6" align="stretch">
      <Box p="4" bg="orange.subtle" rounded="md">
        <Text fontSize="sm" color="orange.fg">
          Review carefully — this can't be changed after deployment.
        </Text>
      </Box>

      <Card.Root variant="outline">
        <Card.Header>
          <Text fontWeight="bold">Token Details</Text>
        </Card.Header>
        <Card.Body pt="0">
          <ReviewRow label="Name" value={data.tokenDetails.name} />
          <ReviewRow label="Symbol" value={data.tokenDetails.symbol} />
          <ReviewRow label="Total Supply" value={data.tokenDetails.totalSupply} />
          <ReviewRow label="Decimals" value={data.tokenDetails.decimals} />
        </Card.Body>
      </Card.Root>

      <Card.Root variant="outline">
        <Card.Header>
          <Text fontWeight="bold">Auction Configuration</Text>
        </Card.Header>
        <Card.Body pt="0">
          <ReviewRow
            label="Floor Price"
            value={`${data.auctionConfig.floorPrice} ${data.auctionConfig.currency}`}
          />
          <ReviewRow label="Start Block" value={data.auctionConfig.startBlock} />
          <ReviewRow label="End Block" value={data.auctionConfig.endBlock} />
          {durationBlocks !== null && (
            <ReviewRow
              label="Duration"
              value={`${blocksToTime(durationBlocks)} (${durationBlocks.toLocaleString()} blocks)`}
            />
          )}
          <ReviewRow label="Price Increment" value={data.auctionConfig.tickSpacing} />
          <ReviewRow
            label="Fundraising Goal"
            value={`${data.auctionConfig.requiredCurrencyRaised} ${data.auctionConfig.currency}`}
          />
          <ReviewRow
            label="Funds Recipient"
            value={data.auctionConfig.fundsRecipient}
          />
          <ReviewRow
            label="Tokens Recipient"
            value={data.auctionConfig.tokensRecipient}
          />
        </Card.Body>
      </Card.Root>

      <Card.Root variant="outline">
        <Card.Header>
          <Text fontWeight="bold">Release Schedule</Text>
        </Card.Header>
        <Card.Body pt="0">
          {data.releaseSchedule.map((seg, i) => {
            const blockDeltaNum = parseInt(seg.blockDelta)
            const humanTime = !isNaN(blockDeltaNum) && blockDeltaNum > 0
              ? blocksToTime(blockDeltaNum)
              : null
            return (
              <Flex key={i} justify="space-between" py="2" borderBottomWidth="1px">
                <Text color="fg.muted" fontSize="sm">
                  Segment {i + 1}
                </Text>
                <HStack gap="4">
                  <Badge variant="outline">{seg.percentage}%</Badge>
                  <Text fontSize="sm" fontFamily="mono">
                    {humanTime ?? seg.blockDelta}{humanTime ? ` (${seg.blockDelta} blocks)` : " blocks"}
                  </Text>
                </HStack>
              </Flex>
            )
          })}
          <Flex justify="space-between" py="2">
            <Text color="fg.muted" fontSize="sm" fontWeight="medium">
              Total
            </Text>
            <Text fontSize="sm" fontWeight="bold">
              {data.releaseSchedule
                .reduce((s, seg) => s + (parseFloat(seg.percentage) || 0), 0)
                .toFixed(1)}
              %
            </Text>
          </Flex>
        </Card.Body>
      </Card.Root>

      <Card.Root variant="outline">
        <Card.Header>
          <Text fontWeight="bold">Access</Text>
        </Card.Header>
        <Card.Body pt="0">
          <ReviewRow label="Mode" value={data.gatekeeping.mode === "none" ? "Open" : data.gatekeeping.mode} />
          <Flex py="2" borderBottomWidth="1px">
            <Text fontSize="xs" color="fg.muted">
              {glossary[`gate.${data.gatekeeping.mode}`]}
            </Text>
          </Flex>
          {data.gatekeeping.mode === "zk-passport" && (
            <>
              <ReviewRow
                label="Country Filter"
                value={
                  (data.gatekeeping.config.countryMode ?? "whitelist") ===
                  "whitelist"
                    ? "Allow list"
                    : "Block list"
                }
              />
              <ReviewRow
                label="Countries"
                value={data.gatekeeping.config.countries || "None specified"}
              />
              <ReviewRow
                label="Minimum Age"
                value={data.gatekeeping.config.minimumAge || "None"}
              />
            </>
          )}
          {data.gatekeeping.mode !== "zk-passport" &&
            data.gatekeeping.mode !== "none" &&
            Object.entries(data.gatekeeping.config).map(([key, val]) => (
              <ReviewRow key={key} label={key} value={val} />
            ))}
        </Card.Body>
      </Card.Root>
    </VStack>
  )
}
