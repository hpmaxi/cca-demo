import { Button, Card, Text, VStack } from "@chakra-ui/react"
import { Wallet } from "lucide-react"
import { useConnect } from "wagmi"
import { injected } from "wagmi/connectors"

export function ConnectWalletPrompt() {
  const { connect } = useConnect()

  return (
    <Card.Root variant="outline">
      <Card.Body>
        <VStack gap="4" py="8">
          <Wallet size={40} />
          <Text fontWeight="medium" fontSize="lg">
            Connect your wallet to start bidding
          </Text>
          <Text color="fg.muted" fontSize="sm" textAlign="center">
            You'll need a crypto wallet (like MetaMask) to place bids and claim tokens.
          </Text>
          <Button
            colorPalette="brand"
            size="lg"
            onClick={() => connect({ connector: injected() })}
          >
            <Wallet size={16} />
            Connect Wallet
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}
