import { useState } from "react"
import { Box, Button, Flex, Input, Text, HStack } from "@chakra-ui/react"
import { Send } from "lucide-react"
import { toaster } from "../ui/toaster"
import { useSubmitBid } from "../../hooks/useCCA"
import type { Address } from "viem"

interface Props {
  auctionAddress: Address
  clearingPrice: number
  isLive: boolean
}

/**
 * Simple single-row bid form.
 * Max price + Budget + Submit — all in one line.
 */
export function BidRow({ auctionAddress, clearingPrice, isLive }: Props) {
  const [maxPrice, setMaxPrice] = useState("")
  const [amount, setAmount] = useState("")
  const { submitBid, isPending } = useSubmitBid(auctionAddress)

  const parsedMax = parseFloat(maxPrice)
  const parsedAmount = parseFloat(amount)
  const estimatedTokens =
    clearingPrice > 0 && parsedAmount > 0
      ? (parsedAmount / clearingPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })
      : null

  const handleSubmit = async () => {
    if (!maxPrice || !amount || isNaN(parsedMax) || isNaN(parsedAmount)) {
      toaster.create({ title: "Enter max price and budget", type: "error" })
      return
    }
    if (parsedMax <= 0 || parsedAmount <= 0) {
      toaster.create({ title: "Values must be greater than 0", type: "error" })
      return
    }

    try {
      const hash = await submitBid(parsedMax, amount)
      toaster.create({
        title: "Bid placed!",
        description: `Tx: ${hash.slice(0, 10)}...`,
        type: "success",
      })
      setMaxPrice("")
      setAmount("")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      toaster.create({
        title: "Bid failed",
        description: msg.length > 120 ? msg.slice(0, 120) + "..." : msg,
        type: "error",
      })
    }
  }

  return (
    <Box>
      <Flex
        gap="3"
        align="end"
        direction={{ base: "column", md: "row" }}
      >
        {/* Max Price */}
        <Box flex="1" w={{ base: "full", md: "auto" }}>
          <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb="1">
            Max Price (ETH per token)
          </Text>
          <Input
            placeholder={clearingPrice > 0 ? clearingPrice.toFixed(6) : "0.005"}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            fontFamily="mono"
            size="sm"
          />
        </Box>

        {/* Budget */}
        <Box flex="1" w={{ base: "full", md: "auto" }}>
          <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb="1">
            Budget (ETH)
          </Text>
          <Input
            placeholder="1.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fontFamily="mono"
            size="sm"
          />
        </Box>

        {/* Submit */}
        <Button
          colorPalette="brand"
          size="sm"
          onClick={handleSubmit}
          loading={isPending}
          disabled={!isLive || isPending}
          flexShrink={0}
          w={{ base: "full", md: "auto" }}
        >
          <Send size={14} />
          Place Bid
        </Button>
      </Flex>

      {/* Helpers */}
      <HStack mt="2" gap="4" fontSize="xs" color="fg.muted" flexWrap="wrap">
        {estimatedTokens && (
          <Text>
            ~{estimatedTokens} tokens at current price
          </Text>
        )}
        {!isLive && (
          <Text color="orange.500" fontWeight="medium">
            Auction is not live — bidding disabled
          </Text>
        )}
        <Text>
          The most you&apos;ll pay per token. The actual price may be lower.
        </Text>
      </HStack>
    </Box>
  )
}
