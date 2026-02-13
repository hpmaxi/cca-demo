import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Link, useNavigate } from "react-router"
import { useState } from "react"
import {
  Activity,
  ArrowUpRight,
  Gavel,
  Rocket,
  Search,
  TrendingUp,
  Zap,
} from "lucide-react"
import { useAccount, useBlockNumber, useBalance } from "wagmi"
import { useAuctionList } from "../hooks/useAuctionList"
import { formatWei } from "../lib/q96"

export function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { data: balance } = useBalance({ address })
  const { auctions, loading } = useAuctionList()
  const [addressInput, setAddressInput] = useState("")
  const navigate = useNavigate()

  const liveAuctions = auctions.filter((a) => a.isLive)
  const upcomingAuctions = auctions.filter((a) => a.isUpcoming)

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
            Dashboard
          </Heading>
          <Text color="fg.muted" mt="1">
            {isConnected
              ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
              : "Connect your wallet to place bids"}
          </Text>
        </Box>
        <Button asChild colorPalette="brand" size="sm">
          <Link to="/create">
            <Rocket size={16} />
            Create Launch
          </Link>
        </Button>
      </Flex>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4">
        <Card.Root variant="outline">
          <Card.Header pb="2">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                Current Block
              </Text>
              <Activity size={16} color="#94a3b8" />
            </Flex>
          </Card.Header>
          <Card.Body pt="0">
            <Text fontSize="2xl" fontWeight="bold" fontFamily="mono">
              #{blockNumber?.toString() ?? "..."}
            </Text>
            <HStack fontSize="xs" color="fg.muted" mt="1">
              <Box w="2" h="2" rounded="full" bg="green.500" css={{ animation: "pulse 2s infinite" }} />
              <Text>Live — ~12s per block</Text>
            </HStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Header pb="2">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                Your Balance
              </Text>
              <TrendingUp size={16} color="#94a3b8" />
            </Flex>
          </Card.Header>
          <Card.Body pt="0">
            <Text fontSize="2xl" fontWeight="bold" fontFamily="mono">
              {balance ? `${(Number(balance.value) / 10 ** balance.decimals).toFixed(4)} ETH` : "—"}
            </Text>
            <Text fontSize="xs" color="fg.muted" mt="1">
              {isConnected ? "Available for bidding" : "Connect wallet to see balance"}
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Header pb="2">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                Live Auctions
              </Text>
              <Gavel size={16} color="#94a3b8" />
            </Flex>
          </Card.Header>
          <Card.Body pt="0">
            <Text fontSize="2xl" fontWeight="bold" fontFamily="mono">
              {loading ? "..." : liveAuctions.length}
            </Text>
            <HStack fontSize="xs" color="brand.600" mt="1">
              <ArrowUpRight size={12} />
              <Text>{upcomingAuctions.length} upcoming</Text>
            </HStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Header pb="2">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                Network
              </Text>
              <Zap size={16} color="#94a3b8" />
            </Flex>
          </Card.Header>
          <Card.Body pt="0">
            <Text fontSize="2xl" fontWeight="bold" fontFamily="mono">
              {balance?.symbol ?? "ETH"}
            </Text>
            <Text fontSize="xs" color="fg.muted" mt="1">
              CCA Factory deployed
            </Text>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Go to Auction */}
      <Card.Root variant="outline" borderColor="brand.200" _dark={{ borderColor: "brand.800" }}>
        <Card.Header>
          <Text fontWeight="bold">Go to Auction</Text>
          <Text fontSize="xs" color="fg.muted">
            Enter a CCA auction contract address to view its clearing data and place bids.
          </Text>
        </Card.Header>
        <Card.Body>
          <Flex gap="2">
            <Input
              placeholder="0x... auction contract address"
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
              View Auction
            </Button>
          </Flex>
        </Card.Body>
      </Card.Root>

      {/* Live Auctions List */}
      {liveAuctions.length > 0 && (
        <Card.Root variant="outline">
          <Card.Header>
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold">Live Auctions</Text>
              <Badge colorPalette="green" size="sm">{liveAuctions.length}</Badge>
            </Flex>
          </Card.Header>
          <Card.Body pt="0">
            <VStack gap="2" align="stretch">
              {liveAuctions.map((a) => (
                <Flex
                  key={a.address}
                  p="3"
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="border.muted"
                  _hover={{ bg: "bg.muted" }}
                  cursor="pointer"
                  onClick={() => navigate(`/auction/${a.address}`)}
                  justify="space-between"
                  align="center"
                >
                  <HStack gap="3">
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
                      {a.tokenSymbol.substring(0, 2)}
                    </Flex>
                    <Box>
                      <Text fontWeight="medium" fontSize="sm">{a.tokenName}</Text>
                      <Text fontSize="xs" color="fg.muted" fontFamily="mono">${a.tokenSymbol}</Text>
                    </Box>
                  </HStack>
                  <HStack gap="4">
                    <Box textAlign="right">
                      <Text fontSize="xs" color="fg.muted">Price</Text>
                      <Text fontSize="sm" fontFamily="mono" fontWeight="medium">
                        {a.clearingPrice > 0 ? `${a.clearingPrice.toFixed(6)} ETH` : "—"}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="xs" color="fg.muted">Raised</Text>
                      <Text fontSize="sm" fontFamily="mono">
                        {formatWei(a.currencyRaised)} ETH
                      </Text>
                    </Box>
                  </HStack>
                </Flex>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* How CCA Works */}
      <Card.Root variant="outline" bg="bg.muted">
        <Card.Body>
          <Text fontWeight="medium" fontSize="sm" mb="3">How Continuous Clearing Auctions Work</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
            <Box>
              <Text fontWeight="bold" fontSize="sm" mb="1">1. Set your max price</Text>
              <Text fontSize="xs" color="fg.muted">
                Choose the most you&apos;re willing to pay per token, and how much you want to spend.
              </Text>
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="sm" mb="1">2. Tokens distribute each block</Text>
              <Text fontSize="xs" color="fg.muted">
                A fixed amount of tokens releases per block. The clearing price adjusts automatically.
              </Text>
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="sm" mb="1">3. Everyone pays the same price</Text>
              <Text fontSize="xs" color="fg.muted">
                The final clearing price — never more than your max. Fair for everyone.
              </Text>
            </Box>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>
    </VStack>
  )
}
