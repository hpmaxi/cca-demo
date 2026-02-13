import { Text } from "@chakra-ui/react"
import { formatCompact, MOCK_ETH_PRICE_USD } from "../../lib/format"

interface Props {
  amount: number | string
  currency: string
  fontSize?: string
}

export function UsdEquivalent({ amount, currency, fontSize = "sm" }: Props) {
  if (currency !== "ETH") return null

  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num) || num === 0) return null

  const usd = num * MOCK_ETH_PRICE_USD

  return (
    <Text fontSize={fontSize} color="fg.muted">
      ~${formatCompact(usd)}
    </Text>
  )
}
