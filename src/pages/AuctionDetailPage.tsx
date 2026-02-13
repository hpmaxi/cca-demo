import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router"
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { type Address } from "viem"
import { useAccount, usePublicClient } from "wagmi"
import { ArrowLeft, Clock, RefreshCw, TrendingUp, Users } from "lucide-react"
import { useCCAAuction, useCCABids, useCCACheckpoints, useExitBid, useClaimTokens } from "../hooks/useCCA"
import type { CCACheckpoint } from "../hooks/useCCA"
import { ccaAbi } from "../abi/cca"
import { q96ToPrice, formatWei } from "../lib/q96"
import { BidRow } from "../components/clearing/BidRow"
import { ClearingTimeline } from "../components/clearing/ClearingTimeline"
import { toaster } from "../components/ui/toaster"

function blocksToTime(blocks: number): string {
  const seconds = blocks * 12
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`
  return `${Math.round(seconds / 86400)}d`
}

export function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { address: userAddress } = useAccount()
  const auctionAddress = id as Address | undefined

  const { auction, isLoading, currentBlock } = useCCAAuction(auctionAddress)
  const { bids: allBids, refetch: refetchBids } = useCCABids(
    auctionAddress,
    auction?.startBlock,
  )
  const { checkpoints, loading: checkpointsLoading, refetch: refetchCheckpoints } = useCCACheckpoints(
    auctionAddress,
    auction?.startBlock,
  )

  const client = usePublicClient()

  // Watch for new events in real-time
  const [liveCheckpoints, setLiveCheckpoints] = useState<CCACheckpoint[]>([])
  const [liveBids, setLiveBids] = useState<CCABid[]>([])

  useEffect(() => {
    if (!client || !auctionAddress) return
    const unwatch = client.watchContractEvent({
      address: auctionAddress,
      abi: ccaAbi,
      eventName: "CheckpointUpdated",
      onLogs: (logs) => {
        const newCps = logs.map((log) => {
          const args = log.args as { blockNumber: bigint; clearingPrice: bigint; cumulativeMps: number }
          return {
            blockNumber: args.blockNumber,
            clearingPrice: args.clearingPrice,
            clearingPriceHuman: q96ToPrice(args.clearingPrice),
            cumulativeMps: Number(args.cumulativeMps),
          }
        })
        setLiveCheckpoints((prev) => [...newCps, ...prev])
      },
    })
    return () => unwatch()
  }, [client, auctionAddress])

  useEffect(() => {
    if (!client || !auctionAddress) return
    const unwatch = client.watchContractEvent({
      address: auctionAddress,
      abi: ccaAbi,
      eventName: "BidSubmitted",
      onLogs: (logs) => {
        const newBids = logs.map((log) => {
          const args = log.args as { id: bigint; owner: Address; price: bigint; amount: bigint }
          return {
            id: args.id,
            owner: args.owner,
            price: args.price,
            amount: args.amount,
            priceHuman: q96ToPrice(args.price),
            amountHuman: Number(args.amount) / 1e18,
          }
        })
        setLiveBids((prev) => [...prev, ...newBids])
      },
    })
    return () => unwatch()
  }, [client, auctionAddress])

  // Merge historical + live data, deduplicate
  const mergedCheckpoints = (() => {
    const seen = new Set<string>()
    const all = [...liveCheckpoints, ...checkpoints]
    return all
      .filter((cp) => {
        const key = cp.blockNumber.toString()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => Number(b.blockNumber - a.blockNumber))
  })()

  const mergedBids = (() => {
    const seen = new Set<string>()
    const all = [...allBids, ...liveBids]
    return all.filter((b) => {
      const key = b.id.toString()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  })()

  // User's bids
  const userBids = mergedBids.filter(
    (b) => userAddress && b.owner.toLowerCase() === userAddress.toLowerCase(),
  )

  const handleRefresh = useCallback(() => {
    refetchBids()
    refetchCheckpoints()
  }, [refetchBids, refetchCheckpoints])

  // Exit / Claim handlers
  const { exitBid, isPending: exitPending } = useExitBid(auctionAddress)
  const { claimTokens, isPending: claimPending } = useClaimTokens(auctionAddress)

  const handleExit = async (bidId: bigint) => {
    try {
      await exitBid(bidId)
      toaster.create({ title: "Bid exited", type: "success" })
      handleRefresh()
    } catch (e: unknown) {
      toaster.create({ title: "Exit failed", description: (e as Error).message, type: "error" })
    }
  }

  const handleClaim = async (bidId: bigint) => {
    try {
      await claimTokens(bidId)
      toaster.create({ title: "Tokens claimed!", type: "success" })
      handleRefresh()
    } catch (e: unknown) {
      toaster.create({ title: "Claim failed", description: (e as Error).message, type: "error" })
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Box py="20" textAlign="center">
        <Text color="fg.muted">Loading auction {auctionAddress?.slice(0, 10)}...</Text>
      </Box>
    )
  }

  if (!auction) {
    return (
      <Box py="20" textAlign="center">
        <Heading size="xl">Auction not found</Heading>
        <Text color="fg.muted" mt="2">
          Could not read auction at address: {id}
        </Text>
        <Text fontSize="sm" color="fg.muted" mt="1">
          Make sure you&apos;re connected to the right network and the address is a CCA contract.
        </Text>
      </Box>
    )
  }

  const blocksRemaining = Number(auction.endBlock - currentBlock)
  const blocksSinceStart = Number(currentBlock - auction.startBlock)
  const totalBlocks = Number(auction.endBlock - auction.startBlock)
  const progress = totalBlocks > 0 ? Math.min(100, Math.max(0, (blocksSinceStart / totalBlocks) * 100)) : 0

  return (
    <VStack gap="6" align="stretch">
      {/* Back link */}
      <Button asChild variant="ghost" size="sm" alignSelf="start" pl="0">
        <Link to="/auctions">
          <ArrowLeft size={16} />
          Back to Auctions
        </Link>
      </Button>

      {/* Header */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
        <Flex gap="3" align="center">
          <Flex
            w="10"
            h="10"
            rounded="full"
            bg="brand.100"
            _dark={{ bg: "brand.900" }}
            align="center"
            justify="center"
            fontWeight="bold"
            fontFamily="mono"
            fontSize="sm"
            color="brand.700"
            _darkColor="brand.300"
          >
            {auction.tokenSymbol.substring(0, 2)}
          </Flex>
          <Box>
            <HStack gap="2">
              <Heading fontFamily="heading" size="xl" fontWeight="bold">
                {auction.tokenName}
              </Heading>
              <Badge
                colorPalette={auction.isLive ? "green" : auction.isUpcoming ? "gray" : auction.isGraduated ? "purple" : "blue"}
                size="sm"
              >
                {auction.isLive ? "Live" : auction.isUpcoming ? "Upcoming" : auction.isGraduated ? "Graduated" : "Ended"}
              </Badge>
            </HStack>
            <Text fontSize="sm" fontFamily="mono" color="fg.muted">
              ${auction.tokenSymbol}
            </Text>
          </Box>
        </Flex>

        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </Flex>

      {/* Stats Row */}
      <Flex gap="4" flexWrap="wrap">
        <Card.Root variant="outline" flex="1" minW="180px">
          <Card.Body py="3" px="4">
            <Text fontSize="xs" color="fg.muted">Current Clearing Price</Text>
            <Text fontSize="xl" fontWeight="bold" fontFamily="mono" color="brand.600" _dark={{ color: "brand.400" }}>
              {auction.clearingPriceHuman.toFixed(6)} ETH
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline" flex="1" minW="140px">
          <Card.Body py="3" px="4">
            <HStack gap="1" color="fg.muted" mb="0.5">
              <TrendingUp size={12} />
              <Text fontSize="xs">Raised</Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" fontFamily="mono">
              {formatWei(auction.currencyRaised)} ETH
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline" flex="1" minW="140px">
          <Card.Body py="3" px="4">
            <HStack gap="1" color="fg.muted" mb="0.5">
              <Users size={12} />
              <Text fontSize="xs">Bids</Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" fontFamily="mono">
              {mergedBids.length}
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline" flex="1" minW="140px">
          <Card.Body py="3" px="4">
            <HStack gap="1" color="fg.muted" mb="0.5">
              <Clock size={12} />
              <Text fontSize="xs">
                {auction.isLive ? "Time Left" : auction.isUpcoming ? "Starts In" : "Ended"}
              </Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" fontFamily="mono">
              {auction.isLive
                ? `~${blocksToTime(blocksRemaining)}`
                : auction.isUpcoming
                  ? `~${blocksToTime(Number(auction.startBlock - currentBlock))}`
                  : "—"}
            </Text>
          </Card.Body>
        </Card.Root>
      </Flex>

      {/* Progress Bar */}
      {auction.isLive && (
        <Box>
          <Flex justify="space-between" fontSize="xs" color="fg.muted" mb="1">
            <Text>Block #{auction.startBlock.toString()}</Text>
            <Text>{progress.toFixed(0)}% complete</Text>
            <Text>Block #{auction.endBlock.toString()}</Text>
          </Flex>
          <Box h="2" bg="gray.100" _dark={{ bg: "gray.800" }} rounded="full" overflow="hidden">
            <Box h="full" w={`${progress}%`} bg="brand.500" rounded="full" transition="width 1s ease" />
          </Box>
        </Box>
      )}

      {/* Bid Form */}
      <Card.Root variant="outline" borderColor="brand.200" _dark={{ borderColor: "brand.800" }}>
        <Card.Header pb="2">
          <Text fontWeight="bold">Place Your Bid</Text>
          <Text fontSize="xs" color="fg.muted">
            Set the max price you&apos;re willing to pay per token and your total budget.
            Everyone pays the same final clearing price — never more than your max.
          </Text>
        </Card.Header>
        <Card.Body>
          <BidRow
            auctionAddress={auction.address}
            clearingPrice={auction.clearingPriceHuman}
            isLive={auction.isLive}
          />
        </Card.Body>
      </Card.Root>

      {/* Clearing Timeline */}
      <ClearingTimeline
        checkpoints={mergedCheckpoints}
        bids={mergedBids}
        userAddress={userAddress}
        loading={checkpointsLoading}
      />

      {/* Your Bids */}
      {userBids.length > 0 && (
        <Card.Root variant="outline">
          <Card.Header>
            <Text fontWeight="bold">Your Bids ({userBids.length})</Text>
          </Card.Header>
          <Card.Body pt="0">
            <VStack gap="2" align="stretch">
              {userBids.map((bid) => {
                const isAboveClearing = bid.priceHuman >= auction.clearingPriceHuman
                return (
                  <Flex
                    key={bid.id.toString()}
                    p="3"
                    rounded="lg"
                    borderWidth="1px"
                    borderColor="border.muted"
                    justify="space-between"
                    align="center"
                    gap="4"
                    flexWrap="wrap"
                  >
                    <HStack gap="4">
                      <Box>
                        <Text fontSize="xs" color="fg.muted">Max Price</Text>
                        <Text fontFamily="mono" fontWeight="bold" fontSize="sm">
                          {bid.priceHuman.toFixed(6)} ETH
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="fg.muted">Budget</Text>
                        <Text fontFamily="mono" fontSize="sm">
                          {bid.amountHuman.toFixed(4)} ETH
                        </Text>
                      </Box>
                      <Badge colorPalette={isAboveClearing ? "green" : "red"} size="sm">
                        {isAboveClearing ? "Filling" : "Below clearing"}
                      </Badge>
                    </HStack>
                    <HStack gap="2">
                      {auction.isEnded && (
                        <Button
                          size="xs"
                          variant="outline"
                          colorPalette="brand"
                          onClick={() => handleClaim(bid.id)}
                          loading={claimPending}
                        >
                          Claim Tokens
                        </Button>
                      )}
                      {auction.isLive && (
                        <Button
                          size="xs"
                          variant="outline"
                          colorPalette="red"
                          onClick={() => handleExit(bid.id)}
                          loading={exitPending}
                        >
                          Exit Bid
                        </Button>
                      )}
                    </HStack>
                  </Flex>
                )
              })}
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* How It Works */}
      <Card.Root variant="outline" bg="bg.muted">
        <Card.Body>
          <Text fontWeight="medium" fontSize="sm" mb="2">How Continuous Clearing Works</Text>
          <VStack align="stretch" gap="2" fontSize="xs" color="fg.muted" lineHeight="tall">
            <Text>
              <strong>1. You set a max price</strong> — the most you&apos;re willing to pay per token.
            </Text>
            <Text>
              <strong>2. Each block, tokens are distributed</strong> — a fixed amount of tokens is released per the schedule.
            </Text>
            <Text>
              <strong>3. The clearing price is found</strong> — it&apos;s the price where total demand matches supply.
              All bids above this price get filled.
            </Text>
            <Text>
              <strong>4. Everyone pays the same price</strong> — the clearing price, never more than your max.
              If your max is below the clearing price, you don&apos;t get tokens for that block (but keep your funds).
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  )
}
