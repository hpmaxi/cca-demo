import { useState } from "react"
import { Box, Button, Card, Input, Text, VStack } from "@chakra-ui/react"
import { Field } from "../ui/field"
import { toaster } from "../ui/toaster"
import { Send } from "lucide-react"

interface Props {
  currency: string
  floorPrice: string
  clearingPrice: string
  tokenSymbol: string
  onBidSubmit: (maxPrice: string, amount: string) => void
}

export function BidForm({
  currency,
  floorPrice,
  clearingPrice,
  tokenSymbol,
  onBidSubmit,
}: Props) {
  const [maxPrice, setMaxPrice] = useState("")
  const [amount, setAmount] = useState("")

  const parsedMax = parseFloat(maxPrice)
  const parsedFloor = parseFloat(floorPrice)
  const parsedClearing = parseFloat(clearingPrice)
  const parsedAmount = parseFloat(amount)
  const isBelowFloor = maxPrice !== "" && !isNaN(parsedMax) && parsedMax < parsedFloor

  const estimatedTokens =
    parsedClearing > 0 && parsedAmount > 0
      ? (parsedAmount / parsedClearing).toLocaleString(undefined, { maximumFractionDigits: 2 })
      : null

  const handleSubmit = () => {
    if (!maxPrice || !amount) {
      toaster.create({
        title: "Missing fields",
        description: "Please enter both max price and budget amount.",
        type: "error",
      })
      return
    }
    if (isBelowFloor) {
      toaster.create({
        title: "Price below minimum",
        description: `Max price must be at least ${floorPrice} ${currency} (the minimum price).`,
        type: "error",
      })
      return
    }
    onBidSubmit(maxPrice, amount)
    toaster.create({
      title: "Bid Placed",
      description: `Bid placed: ${amount} ${currency} at max price ${maxPrice}`,
      type: "success",
    })
    setMaxPrice("")
    setAmount("")
  }

  return (
    <Card.Root
      variant="outline"
      borderColor="brand.200"
      _dark={{ borderColor: "brand.800" }}
      css={{
        "&:focus-within": {
          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
        },
      }}
    >
      <Card.Header>
        <Text fontWeight="bold">Place Your Bid</Text>
        <Text fontSize="xs" color="fg.muted">
          Set your max price and how much you want to spend.
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack gap="4" align="stretch">
          <Field
            label="Max Price per Token"
            required
            helperText={`Min ${floorPrice} ${currency}. You'll never pay more.`}
            invalid={isBelowFloor}
            errorText={`Must be at least ${floorPrice} ${currency}`}
          >
            <Input
              placeholder={`e.g. ${clearingPrice}`}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              fontFamily="mono"
            />
          </Field>
          <Field
            label={`Budget (${currency})`}
            required
            helperText="Total amount you want to spend."
          >
            <Input
              placeholder={`Amount in ${currency}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fontFamily="mono"
            />
          </Field>

          {estimatedTokens && (
            <Box p="3" bg="brand.50" _dark={{ bg: "brand.950" }} rounded="md">
              <Text fontSize="xs" color="fg.muted">
                Estimated tokens
              </Text>
              <Text fontFamily="mono" fontWeight="bold" color="brand.600" _dark={{ color: "brand.400" }}>
                ~{estimatedTokens} {tokenSymbol}
              </Text>
            </Box>
          )}

          <Button
            colorPalette="brand"
            w="full"
            onClick={handleSubmit}
          >
            <Send size={16} />
            Place Bid
          </Button>
          <Text fontSize="xs" color="fg.muted" textAlign="center">
            You can exit your bid anytime before the auction ends.
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}
