import { Box, Flex, HStack, Button, Text } from "@chakra-ui/react"
import { Link, useLocation } from "react-router"
import { Wallet, Zap } from "lucide-react"
import { ColorModeButton } from "../ui/color-mode"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { injected } from "wagmi/connectors"
import { truncateAddress } from "../../lib/format"

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Launch Token", to: "/create" },
  { label: "My Bids", to: "/bids" },
]

export function Navbar() {
  const location = useLocation()
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <Box
      as="nav"
      borderBottomWidth="1px"
      borderColor="border.muted"
      bg="bg"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Flex
        maxW="7xl"
        mx="auto"
        px="6"
        h="16"
        align="center"
        justify="space-between"
      >
        <HStack gap="8">
          <Link to="/">
            <HStack gap="2">
              <Zap size={24} />
              <Text fontWeight="bold" fontSize="lg">
                CCA Launchpad
              </Text>
            </HStack>
          </Link>

          <HStack gap="1" display={{ base: "none", md: "flex" }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                asChild
                variant={location.pathname === link.to ? "subtle" : "ghost"}
                size="sm"
              >
                <Link to={link.to}>{link.label}</Link>
              </Button>
            ))}
          </HStack>
        </HStack>

        <HStack gap="2">
          <ColorModeButton />
          {isConnected && address ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => disconnect()}
            >
              <Wallet size={16} />
              {truncateAddress(address)}
            </Button>
          ) : (
            <Button
              size="sm"
              colorPalette="brand"
              onClick={() => connect({ connector: injected() })}
            >
              <Wallet size={16} />
              Connect Wallet
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  )
}
