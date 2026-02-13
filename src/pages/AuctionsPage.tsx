import { useState } from "react"
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Input,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Link, useNavigate } from "react-router"
import { ExternalLink, Search } from "lucide-react"
import { useAuctionList } from "../hooks/useAuctionList"
import { formatWei } from "../lib/q96"
import { useBlockNumber } from "wagmi"

function blocksToTime(blocks: number): string {
  const seconds = Math.abs(blocks) * 12
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`
  return `${Math.round(seconds / 86400)}d`
}

export function AuctionsPage() {
  const { auctions, loading, refetch } = useAuctionList()
  const { data: currentBlock } = useBlockNumber()
  const [addressInput, setAddressInput] = useState("")
  const navigate = useNavigate()

  const handleGoToAuction = () => {
    const addr = addressInput.trim()
    if (addr.startsWith("0x") && addr.length === 42) {
      navigate(`/auction/${addr}`)
    }
  }

  return (
    <VStack gap="8" align="stretch">
      {/* Header */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
        <Box>
          <Heading fontFamily="heading" size="3xl" fontWeight="bold">
            Auctions
          </Heading>
          <Text color="fg.muted" mt="1">
            Browse active CCA auctions or enter an auction address directly.
          </Text>
        </Box>
      </Flex>

      {/* Direct Address Input */}
      <Card.Root variant="outline">
        <Card.Body>
          <Text fontSize="sm" fontWeight="medium" mb="2">Go to auction by address</Text>
          <Flex gap="2">
            <Input
              placeholder="0x... CCA auction contract address"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              fontFamily="mono"
              size="sm"
              flex="1"
              onKeyDown={(e) => e.key === "Enter" && handleGoToAuction()}
            />
            <Button
              size="sm"
              colorPalette="brand"
              onClick={handleGoToAuction}
              disabled={!addressInput.trim().startsWith("0x") || addressInput.trim().length !== 42}
            >
              <Search size={14} />
              View
            </Button>
          </Flex>
        </Card.Body>
      </Card.Root>

      {/* Auctions Table */}
      <Card.Root variant="outline">
        <Card.Header>
          <Flex justify="space-between" align="center">
            <Text fontWeight="medium" color="fg.muted" fontSize="sm">
              {loading
                ? "Loading auctions from factory..."
                : `${auctions.length} auction${auctions.length !== 1 ? "s" : ""} found`}
            </Text>
            <Button variant="outline" size="xs" onClick={refetch}>
              Refresh
            </Button>
          </Flex>
        </Card.Header>
        <Card.Body pt="0">
          {auctions.length === 0 && !loading ? (
            <Box p="8" textAlign="center" color="fg.muted" borderWidth="1px" borderStyle="dashed" borderColor="border.muted" rounded="lg">
              <Text fontWeight="medium" mb="1">No auctions found on this network</Text>
              <Text fontSize="sm">
                Enter a CCA auction address above, or switch to a network where auctions are deployed
                (Sepolia, Mainnet, Base).
              </Text>
            </Box>
          ) : (
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Token</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader>Clearing Price</Table.ColumnHeader>
                  <Table.ColumnHeader>Raised</Table.ColumnHeader>
                  <Table.ColumnHeader>Time</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Action</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {auctions.map((auction) => {
                  const block = currentBlock ?? 0n
                  const timeInfo = auction.isLive
                    ? `~${blocksToTime(Number(auction.endBlock - block))} left`
                    : auction.isUpcoming
                      ? `Starts ~${blocksToTime(Number(auction.startBlock - block))}`
                      : "Ended"

                  return (
                    <Table.Row
                      key={auction.address}
                      _hover={{ bg: "bg.muted" }}
                      cursor="pointer"
                      transition="backgrounds"
                      onClick={() => navigate(`/auction/${auction.address}`)}
                    >
                      <Table.Cell>
                        <Flex align="center" gap="3">
                          <Flex
                            w="8"
                            h="8"
                            rounded="full"
                            bg="bg.muted"
                            align="center"
                            justify="center"
                            fontWeight="bold"
                            fontSize="xs"
                          >
                            {auction.tokenSymbol.substring(0, 2)}
                          </Flex>
                          <Box>
                            <Text fontWeight="medium">{auction.tokenName}</Text>
                            <Text fontSize="xs" color="fg.muted" fontFamily="mono">
                              ${auction.tokenSymbol}
                            </Text>
                          </Box>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorPalette={auction.isLive ? "green" : auction.isUpcoming ? "gray" : "blue"}
                          size="sm"
                        >
                          {auction.isLive ? "Live" : auction.isUpcoming ? "Upcoming" : "Ended"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell fontFamily="mono" fontSize="sm">
                        {auction.clearingPrice > 0 ? `${auction.clearingPrice.toFixed(6)} ETH` : "—"}
                      </Table.Cell>
                      <Table.Cell fontFamily="mono" fontSize="sm">
                        {formatWei(auction.currencyRaised)} ETH
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" color="fg.muted">
                          {timeInfo}
                        </Text>
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        <Button asChild variant="outline" size="xs">
                          <Link to={`/auction/${auction.address}`}>
                            View
                            <ExternalLink size={12} />
                          </Link>
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          )}
        </Card.Body>
      </Card.Root>
    </VStack>
  )
}
