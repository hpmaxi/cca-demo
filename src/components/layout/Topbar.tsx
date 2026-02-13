import { useState } from "react"
import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { ChevronDown, Copy, Check, Wallet } from "lucide-react"
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi"
import { injected } from "wagmi/connectors"
import { mainnet, sepolia, base } from "wagmi/chains"
import { truncateAddress } from "../../lib/format"
import { ColorModeButton } from "../ui/color-mode"
import { anvilFork } from "../../wagmi"
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "../ui/menu"

const chains = [anvilFork, sepolia, mainnet, base]

const TESTNET_IDS: Set<number> = new Set([sepolia.id, anvilFork.id])

function getChainInfo(chainId: number) {
  const chain = chains.find((c) => c.id === chainId)
  const name = chain?.name ?? `Chain ${chainId}`
  const isTestnet = TESTNET_IDS.has(chainId)
  return { name, isTestnet }
}

export function Topbar() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [copied, setCopied] = useState(false)

  const { name: chainName, isTestnet } = getChainInfo(chainId)

  const copyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Flex
      h="16"
      align="center"
      justify="space-between"
      borderBottomWidth="1px"
      borderColor="border.muted"
      bg="bg/80"
      css={{ backdropFilter: "blur(8px)" }}
      px="6"
      position="sticky"
      top="0"
      zIndex="20"
    >
      {/* Breadcrumb placeholder */}
      <Flex align="center" gap="2">
        <Text color="fg.muted" fontSize="sm">/</Text>
        <Text fontSize="sm" fontWeight="medium">Dashboard</Text>
      </Flex>

      <Flex align="center" gap="3">
        {/* Chain indicator */}
        <Flex
          align="center"
          gap="2"
          display={{ base: "none", md: "flex" }}
          fontFamily="mono"
          fontSize="xs"
          px="3"
          py="1.5"
          rounded="full"
          borderWidth="1px"
          borderColor={isTestnet ? "orange.300" : "border.muted"}
          bg={isTestnet ? "orange.50" : "bg.muted/30"}
          _dark={{
            borderColor: isTestnet ? "orange.700" : "border.muted",
            bg: isTestnet ? "orange.950" : "bg.muted/30",
          }}
        >
          <Box
            w="2"
            h="2"
            rounded="full"
            bg={isConnected ? "green.500" : "fg.subtle"}
          />
          <Text fontWeight="medium">
            {chainName}
          </Text>
          {isTestnet && (
            <Text
              fontSize="9px"
              fontWeight="bold"
              color="orange.600"
              _dark={{ color: "orange.400" }}
              textTransform="uppercase"
            >
              Testnet
            </Text>
          )}
        </Flex>

        <ColorModeButton />

        {/* Wallet */}
        {isConnected && address ? (
          <MenuRoot>
            <MenuTrigger asChild>
              <Flex
                align="center"
                gap="2"
                rounded="full"
                borderWidth="1px"
                borderColor="border.muted"
                bg="bg.muted/30"
                pl="1"
                pr="3"
                py="1"
                cursor="pointer"
                _hover={{ bg: "bg.muted" }}
                transition="backgrounds"
              >
                <Flex rounded="full" bg="bg" p="1.5" shadow="sm">
                  <Wallet size={14} />
                </Flex>
                <Text fontSize="xs" fontWeight="bold" fontFamily="mono">
                  {truncateAddress(address)}
                </Text>
                <ChevronDown size={12} style={{ opacity: 0.5 }} />
              </Flex>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="copy" onClick={copyAddress}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy Address"}
              </MenuItem>
              <MenuItem value="disconnect" onClick={() => disconnect()}>
                Disconnect
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        ) : (
          <Button
            size="sm"
            colorPalette="brand"
            rounded="full"
            px="6"
            onClick={() => connect({ connector: injected() })}
          >
            <Wallet size={14} />
            Connect Wallet
          </Button>
        )}
      </Flex>
    </Flex>
  )
}
