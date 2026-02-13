import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { Bell, ChevronDown, Wallet } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { injected } from "wagmi/connectors"
import { truncateAddress } from "../../lib/format"
import { ColorModeButton } from "../ui/color-mode"
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "../ui/menu"

export function Topbar() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

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
        {/* Chain Selector */}
        <Button
          variant="outline"
          size="sm"
          display={{ base: "none", md: "flex" }}
          fontFamily="mono"
          fontSize="xs"
        >
          <Box
            w="2"
            h="2"
            rounded="full"
            bg={isConnected ? "green.500" : "fg.subtle"}
          />
          Base Mainnet
          <ChevronDown size={12} style={{ opacity: 0.5 }} />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" position="relative">
          <Bell size={18} />
          <Box
            position="absolute"
            top="1.5"
            right="1.5"
            w="2"
            h="2"
            rounded="full"
            bg="red.500"
            borderWidth="2px"
            borderColor="bg"
          />
        </Button>

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
