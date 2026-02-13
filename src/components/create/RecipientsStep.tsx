import { Box, Button, Input, Text, VStack } from "@chakra-ui/react"
import { Field } from "../ui/field"
import { Wallet } from "lucide-react"
import { useAccount } from "wagmi"

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

export function RecipientsStep({ data, onChange }: Props) {
  const { address } = useAccount()

  const update = (field: keyof AuctionConfig, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const setToMyWallet = (field: "fundsRecipient" | "tokensRecipient") => {
    if (address) {
      update(field, address)
    }
  }

  return (
    <VStack gap="5" align="stretch">
      <Text fontSize="sm" color="fg.muted">
        Specify where raised funds and unsold tokens should be sent.
      </Text>

      <Field label="Funds Recipient" required helperText="Wallet address that receives the raised funds after the auction.">
        <Input
          placeholder="0x..."
          fontFamily="mono"
          value={data.fundsRecipient}
          onChange={(e) => update("fundsRecipient", e.target.value)}
        />
      </Field>
      {address && (
        <Button
          variant="ghost"
          size="xs"
          alignSelf="start"
          onClick={() => setToMyWallet("fundsRecipient")}
        >
          <Wallet size={12} />
          Set to my wallet
        </Button>
      )}

      <Field label="Tokens Recipient" required helperText="Wallet address that receives any unsold tokens.">
        <Input
          placeholder="0x..."
          fontFamily="mono"
          value={data.tokensRecipient}
          onChange={(e) => update("tokensRecipient", e.target.value)}
        />
      </Field>
      {address && (
        <Button
          variant="ghost"
          size="xs"
          alignSelf="start"
          onClick={() => setToMyWallet("tokensRecipient")}
        >
          <Wallet size={12} />
          Set to my wallet
        </Button>
      )}
    </VStack>
  )
}
