import { Input, Text, VStack } from "@chakra-ui/react"
import { Field } from "../ui/field"
import {
  NativeSelectField,
  NativeSelectRoot,
} from "../ui/native-select"
import { blocksToTime } from "../../lib/format"

interface AuctionConfig {
  floorPrice: string
  currency: string
  startBlock: string
  endBlock: string
  tickSpacing: string
  requiredCurrencyRaised: string
  fundsRecipient: string
  tokensRecipient: string
}

interface Props {
  data: AuctionConfig
  onChange: (data: AuctionConfig) => void
}

export function AuctionConfigStep({ data, onChange }: Props) {
  const update = (field: keyof AuctionConfig, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const floorVal = parseFloat(data.floorPrice)
  const floorInvalid = data.floorPrice !== "" && (isNaN(floorVal) || floorVal <= 0)

  const startNum = parseInt(data.startBlock)
  const endNum = parseInt(data.endBlock)
  const durationBlocks = !isNaN(startNum) && !isNaN(endNum) && endNum > startNum
    ? endNum - startNum
    : null

  return (
    <VStack gap="5" align="stretch">
      <Text fontSize="sm" color="fg.muted">
        Set the pricing rules and timing for your auction.
      </Text>

      <Field
        label="Floor Price"
        required
        helperText="Minimum price per token. Bids below this price are rejected."
        invalid={floorInvalid}
        errorText="Floor price must be a positive number"
      >
        <Input
          placeholder="e.g. 0.001"
          value={data.floorPrice}
          onChange={(e) => update("floorPrice", e.target.value)}
        />
      </Field>

      <Field label="Currency">
        <NativeSelectRoot>
          <NativeSelectField
            value={data.currency}
            onChange={(e) => update("currency", e.target.value)}
            items={["ETH", "USDC", "Custom"]}
          />
        </NativeSelectRoot>
      </Field>

      <Field label="Start Block" required helperText="Each Ethereum block is ~12 seconds.">
        <Input
          placeholder="e.g. 19000000"
          value={data.startBlock}
          onChange={(e) => update("startBlock", e.target.value)}
        />
      </Field>

      <Field label="End Block" required helperText="Each Ethereum block is ~12 seconds.">
        <Input
          placeholder="e.g. 19050000"
          value={data.endBlock}
          onChange={(e) => update("endBlock", e.target.value)}
        />
      </Field>

      {durationBlocks !== null && (
        <Text fontSize="sm" color="fg.muted">
          Duration: {blocksToTime(durationBlocks)} ({durationBlocks.toLocaleString()} blocks)
        </Text>
      )}

      <Field label="Price Increment" required helperText="Minimum gap between price levels.">
        <Input
          placeholder="e.g. 0.0001"
          value={data.tickSpacing}
          onChange={(e) => update("tickSpacing", e.target.value)}
        />
      </Field>

      <Field label="Fundraising Goal" helperText="The auction succeeds when this amount is raised.">
        <Input
          placeholder="e.g. 500"
          value={data.requiredCurrencyRaised}
          onChange={(e) => update("requiredCurrencyRaised", e.target.value)}
        />
      </Field>

      <Field label="Funds Recipient" helperText="Wallet address that receives the raised funds.">
        <Input
          placeholder="0x..."
          fontFamily="mono"
          value={data.fundsRecipient}
          onChange={(e) => update("fundsRecipient", e.target.value)}
        />
      </Field>

      <Field label="Tokens Recipient" helperText="Wallet address that receives unsold tokens.">
        <Input
          placeholder="0x..."
          fontFamily="mono"
          value={data.tokensRecipient}
          onChange={(e) => update("tokensRecipient", e.target.value)}
        />
      </Field>
    </VStack>
  )
}
