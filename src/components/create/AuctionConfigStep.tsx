import { Box, Flex, Input, Text, VStack } from "@chakra-ui/react"
import { Field } from "../ui/field"
import {
  NativeSelectField,
  NativeSelectRoot,
} from "../ui/native-select"
import { blocksToTime } from "../../lib/format"
import { useBlockNumber } from "wagmi"
import { AlertTriangle } from "lucide-react"

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
  const { data: currentBlock } = useBlockNumber({ watch: true })

  const update = (field: keyof AuctionConfig, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const floorVal = parseFloat(data.floorPrice)
  const floorInvalid = data.floorPrice !== "" && (isNaN(floorVal) || floorVal <= 0)

  const startNum = parseInt(data.startBlock)
  const endNum = parseInt(data.endBlock)
  const currentBlockNum = currentBlock ? Number(currentBlock) : 0

  const startInvalid = data.startBlock !== "" && !isNaN(startNum) && currentBlockNum > 0 && startNum < currentBlockNum
  const endInvalid = data.endBlock !== "" && !isNaN(endNum) && !isNaN(startNum) && endNum <= startNum

  const tickVal = parseInt(data.tickSpacing)
  const tickInvalid = data.tickSpacing !== "" && (!isNaN(tickVal) && tickVal < 2)

  const durationBlocks = !isNaN(startNum) && !isNaN(endNum) && endNum > startNum
    ? endNum - startNum
    : null

  return (
    <VStack gap="5" align="stretch">
      <Text fontSize="sm" color="fg.muted">
        Set the pricing rules and timing for your auction.
      </Text>

      {currentBlockNum > 0 && (
        <Flex
          align="center"
          gap="2"
          px="3"
          py="2"
          rounded="md"
          bg="blue.subtle"
          fontSize="xs"
          color="blue.fg"
          fontFamily="mono"
        >
          Current block: #{currentBlockNum.toLocaleString()}
        </Flex>
      )}

      <Field
        label="Floor Price (ETH)"
        required
        helperText="Minimum price per token in ETH. Bids below this price are rejected."
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
            items={["ETH"]}
          />
        </NativeSelectRoot>
      </Field>

      <Field
        label="Start Block"
        required
        helperText={`Must be >= current block (${currentBlockNum.toLocaleString()}). Each block is ~12 seconds.`}
        invalid={startInvalid}
        errorText={`Start block must be >= current block (${currentBlockNum.toLocaleString()})`}
      >
        <Input
          placeholder={currentBlockNum > 0 ? `e.g. ${currentBlockNum + 100}` : "e.g. 19000000"}
          value={data.startBlock}
          onChange={(e) => update("startBlock", e.target.value)}
        />
      </Field>

      <Field
        label="End Block"
        required
        helperText="Must be greater than start block. Each block is ~12 seconds."
        invalid={endInvalid}
        errorText="End block must be greater than start block"
      >
        <Input
          placeholder={!isNaN(startNum) ? `e.g. ${startNum + 50000}` : "e.g. 19050000"}
          value={data.endBlock}
          onChange={(e) => update("endBlock", e.target.value)}
        />
      </Field>

      {durationBlocks !== null && (
        <Box px="3" py="2" rounded="md" bg="bg.muted" fontSize="sm">
          <Text color="fg.muted">
            Duration: <Text as="span" fontWeight="bold" color="fg">{blocksToTime(durationBlocks)}</Text>{" "}
            ({durationBlocks.toLocaleString()} blocks)
          </Text>
        </Box>
      )}

      <Field
        label="Tick Spacing"
        required
        helperText="Minimum gap between price levels. Minimum value is 2."
        invalid={tickInvalid}
        errorText="Tick spacing must be at least 2"
      >
        <Input
          placeholder="e.g. 10"
          value={data.tickSpacing}
          onChange={(e) => update("tickSpacing", e.target.value)}
        />
      </Field>

      <Field
        label="Fundraising Goal (ETH)"
        helperText="The auction succeeds (graduates) when this ETH amount is raised."
      >
        <Input
          placeholder="e.g. 10"
          value={data.requiredCurrencyRaised}
          onChange={(e) => update("requiredCurrencyRaised", e.target.value)}
        />
      </Field>

      {startInvalid && (
        <Flex align="center" gap="2" color="red.500" fontSize="xs">
          <AlertTriangle size={14} />
          <Text>Start block is in the past. It must be &gt;= current block.</Text>
        </Flex>
      )}
    </VStack>
  )
}
