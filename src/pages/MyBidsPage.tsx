import { useState, useEffect, useCallback } from "react"
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useNavigate } from "react-router"
import { ExternalLink, RefreshCw } from "lucide-react"
import { useAccount, usePublicClient } from "wagmi"
import { type Address } from "viem"
import { ccaAbi } from "../abi/cca"
import { erc20Abi } from "../abi/erc20"
import { ccaFactoryAbi, CCA_FACTORY_ADDRESS } from "../abi/ccaFactory"
import { q96ToPrice, formatWei } from "../lib/q96"
import { toaster } from "../components/ui/toaster"
import { useExitBid, useClaimTokens } from "../hooks/useCCA"

interface UserBid {
  bidId: bigint
  auctionAddress: Address
  tokenSymbol: string
  priceHuman: number
  amountHuman: number
  isAboveClearing: boolean
  clearingPriceHuman: number
  isAuctionLive: boolean
  isAuctionEnded: boolean
}

export function MyBidsPage() {
  const { address: userAddress, isConnected } = useAccount()
  const client = usePublicClient()
  const [bids, setBids] = useState<UserBid[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAuction, setSelectedAuction] = useState<Address | undefined>()
  const navigate = useNavigate()

  const fetchBids = useCallback(async () => {
    if (!client || !userAddress) return
    setLoading(true)
    try {
      // Get all auctions from factory
      const auctionLogs = await client.getContractEvents({
        address: CCA_FACTORY_ADDRESS,
        abi: ccaFactoryAbi,
        eventName: "AuctionCreated",
        fromBlock: 0n,
      })

      const currentBlock = await client.getBlockNumber()
      const allBids: UserBid[] = []

      for (const log of auctionLogs) {
        const args = log.args as { auction: Address; token: Address }
        const auctionAddr = args.auction
        const tokenAddr = args.token

        // Get user's bids for this auction
        const bidLogs = await client.getContractEvents({
          address: auctionAddr,
          abi: ccaAbi,
          eventName: "BidSubmitted",
          fromBlock: 0n,
          args: { owner: userAddress },
        })

        if (bidLogs.length === 0) continue

        // Get auction state
        const [clearingPrice, startBlock, endBlock, tokenSymbol] = await Promise.all([
          client.readContract({ address: auctionAddr, abi: ccaAbi, functionName: "clearingPrice" }).catch(() => 0n),
          client.readContract({ address: auctionAddr, abi: ccaAbi, functionName: "startBlock" }).catch(() => 0n),
          client.readContract({ address: auctionAddr, abi: ccaAbi, functionName: "endBlock" }).catch(() => 0n),
          client.readContract({ address: tokenAddr, abi: erc20Abi, functionName: "symbol" }).catch(() => "???"),
        ])

        const cp = q96ToPrice(clearingPrice as bigint)
        const start = startBlock as bigint
        const end = endBlock as bigint

        // Check exited bids
        const exitLogs = await client.getContractEvents({
          address: auctionAddr,
          abi: ccaAbi,
          eventName: "BidExited",
          fromBlock: 0n,
          args: { owner: userAddress },
        })
        const exitedIds = new Set(exitLogs.map((l) => (l.args as { bidId: bigint }).bidId.toString()))

        for (const bidLog of bidLogs) {
          const bidArgs = bidLog.args as { id: bigint; price: bigint; amount: bigint }
          if (exitedIds.has(bidArgs.id.toString())) continue

          allBids.push({
            bidId: bidArgs.id,
            auctionAddress: auctionAddr,
            tokenSymbol: tokenSymbol as string,
            priceHuman: q96ToPrice(bidArgs.price),
            amountHuman: Number(bidArgs.amount) / 1e18,
            isAboveClearing: q96ToPrice(bidArgs.price) >= cp,
            clearingPriceHuman: cp,
            isAuctionLive: currentBlock >= start && currentBlock < end,
            isAuctionEnded: currentBlock >= end,
          })
        }
      }

      setBids(allBids)
    } catch (e) {
      console.error("Failed to fetch bids:", e)
    } finally {
      setLoading(false)
    }
  }, [client, userAddress])

  useEffect(() => {
    fetchBids()
  }, [fetchBids])

  const { exitBid, isPending: exitPending } = useExitBid(selectedAuction)
  const { claimTokens, isPending: claimPending } = useClaimTokens(selectedAuction)

  const handleExit = async (bid: UserBid) => {
    setSelectedAuction(bid.auctionAddress)
    try {
      await exitBid(bid.bidId)
      toaster.create({ title: "Bid exited", type: "success" })
      fetchBids()
    } catch (e: unknown) {
      toaster.create({ title: "Exit failed", description: (e as Error).message, type: "error" })
    }
  }

  const handleClaim = async (bid: UserBid) => {
    setSelectedAuction(bid.auctionAddress)
    try {
      await claimTokens(bid.bidId)
      toaster.create({ title: "Tokens claimed!", type: "success" })
      fetchBids()
    } catch (e: unknown) {
      toaster.create({ title: "Claim failed", description: (e as Error).message, type: "error" })
    }
  }

  return (
    <VStack gap="8" align="stretch">
      <Flex justify="space-between" align="center">
        <Box>
          <Heading fontFamily="heading" size="3xl" fontWeight="bold">
            My Bids
          </Heading>
          <Text color="fg.muted" mt="1">
            {isConnected
              ? "Your active bids across all CCA auctions."
              : "Connect your wallet to see your bids."}
          </Text>
        </Box>
        <Button variant="outline" size="sm" onClick={fetchBids} disabled={!isConnected}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </Flex>

      {!isConnected ? (
        <Card.Root variant="outline">
          <Card.Body p="8" textAlign="center">
            <Text color="fg.muted">Connect your wallet to see your bids.</Text>
          </Card.Body>
        </Card.Root>
      ) : loading ? (
        <Card.Root variant="outline">
          <Card.Body p="8" textAlign="center">
            <Text color="fg.muted">Scanning auctions for your bids...</Text>
          </Card.Body>
        </Card.Root>
      ) : bids.length === 0 ? (
        <Card.Root variant="outline">
          <Card.Body p="8" textAlign="center">
            <Text fontWeight="medium" mb="1">No bids found</Text>
            <Text fontSize="sm" color="fg.muted">
              Place a bid on an auction to see it here.
            </Text>
          </Card.Body>
        </Card.Root>
      ) : (
        <Card.Root variant="outline">
          <Card.Header>
            <Text fontWeight="medium" color="fg.muted" fontSize="sm">
              {bids.length} bid{bids.length !== 1 ? "s" : ""} found
            </Text>
          </Card.Header>
          <Card.Body pt="0">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Token</Table.ColumnHeader>
                  <Table.ColumnHeader>Max Price</Table.ColumnHeader>
                  <Table.ColumnHeader>Budget</Table.ColumnHeader>
                  <Table.ColumnHeader>Clearing Price</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Action</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {bids.map((bid) => (
                  <Table.Row
                    key={`${bid.auctionAddress}-${bid.bidId.toString()}`}
                    _hover={{ bg: "bg.muted" }}
                  >
                    <Table.Cell>
                      <HStack gap="2">
                        <Text fontWeight="medium" fontSize="sm">{bid.tokenSymbol}</Text>
                      </HStack>
                    </Table.Cell>
                    <Table.Cell fontFamily="mono" fontSize="sm">
                      {bid.priceHuman.toFixed(6)} ETH
                    </Table.Cell>
                    <Table.Cell fontFamily="mono" fontSize="sm">
                      {bid.amountHuman.toFixed(4)} ETH
                    </Table.Cell>
                    <Table.Cell fontFamily="mono" fontSize="sm">
                      {bid.clearingPriceHuman.toFixed(6)} ETH
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        colorPalette={bid.isAboveClearing ? "green" : "red"}
                        size="sm"
                      >
                        {bid.isAboveClearing ? "Filling" : "Below clearing"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      <HStack gap="2" justify="end">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => navigate(`/auction/${bid.auctionAddress}`)}
                        >
                          <ExternalLink size={12} />
                          View
                        </Button>
                        {bid.isAuctionLive && (
                          <Button
                            size="xs"
                            variant="outline"
                            colorPalette="red"
                            onClick={() => handleExit(bid)}
                          >
                            Exit
                          </Button>
                        )}
                        {bid.isAuctionEnded && (
                          <Button
                            size="xs"
                            variant="outline"
                            colorPalette="brand"
                            onClick={() => handleClaim(bid)}
                          >
                            Claim
                          </Button>
                        )}
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  )
}
