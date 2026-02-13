import { Input, Text, VStack } from "@chakra-ui/react"
import { Field } from "../ui/field"

interface TokenDetails {
  name: string
  symbol: string
  totalSupply: string
  decimals: string
}

interface Props {
  data: TokenDetails
  onChange: (data: TokenDetails) => void
}

export function TokenDetailsStep({ data, onChange }: Props) {
  const update = (field: keyof TokenDetails, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <VStack gap="5" align="stretch">
      <Text fontSize="sm" color="fg.muted">
        Define your token's identity. This is what bidders will see.
      </Text>

      <Field label="Token Name" required helperText="The full name of your token.">
        <Input
          placeholder="e.g. Nexus Protocol"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </Field>

      <Field label="Token Symbol" required helperText="A short ticker, usually 3-5 characters.">
        <Input
          placeholder="e.g. NXP"
          value={data.symbol}
          onChange={(e) => update("symbol", e.target.value)}
        />
      </Field>

      <Field label="Total Supply" required helperText="How many tokens will exist.">
        <Input
          placeholder="e.g. 1000000000"
          value={data.totalSupply}
          onChange={(e) => update("totalSupply", e.target.value)}
        />
      </Field>

      <Field label="Decimals" helperText="Precision level. Use 18 for standard tokens.">
        <Input
          placeholder="18"
          value={data.decimals}
          onChange={(e) => update("decimals", e.target.value)}
        />
      </Field>
    </VStack>
  )
}
