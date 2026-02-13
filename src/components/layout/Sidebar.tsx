import { Box, Flex, Text, VStack, Button } from "@chakra-ui/react"
import { Link, useLocation } from "react-router"
import {
  LayoutDashboard,
  Rocket,
  Gavel,
  ListOrdered,
  LogOut,
} from "lucide-react"
import { useDisconnect, useBlockNumber } from "wagmi"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { id: "create", label: "Create Launch", icon: Rocket, to: "/create" },
  { id: "auctions", label: "Auctions", icon: Gavel, to: "/auctions" },
  { id: "bids", label: "My Bids", icon: ListOrdered, to: "/bids" },
]

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/"
  return pathname.startsWith(to)
}

export function Sidebar() {
  const location = useLocation()
  const { disconnect } = useDisconnect()
  const { data: blockNumber } = useBlockNumber({ watch: true })

  return (
    <Flex
      direction="column"
      h="100vh"
      w="64"
      borderRightWidth="1px"
      borderColor="border.muted"
      bg="bg"
      position="fixed"
      left="0"
      top="0"
      zIndex="30"
    >
      {/* Logo */}
      <Flex h="16" align="center" borderBottomWidth="1px" borderColor="border.muted" px="6">
        <Link to="/">
          <Flex align="center" gap="2" cursor="pointer">
            <Flex
              w="8"
              h="8"
              rounded="lg"
              bg="brand.600"
              align="center"
              justify="center"
              color="white"
              shadow="sm"
            >
              <Rocket size={20} />
            </Flex>
            <Text fontFamily="heading" fontWeight="bold" fontSize="lg" letterSpacing="tight">
              CCA Launchpad
            </Text>
          </Flex>
        </Link>
      </Flex>

      {/* Nav Items */}
      <Box flex="1" overflowY="auto" py="6" px="3">
        <VStack gap="1" align="stretch">
          {navItems.map((item) => {
            const active = isActive(location.pathname, item.to)
            return (
              <Button
                key={item.id}
                asChild
                variant={active ? "subtle" : "ghost"}
                size="sm"
                justifyContent="flex-start"
                w="full"
                colorPalette={active ? "gray" : undefined}
                css={{
                  ...(active && {
                    bg: "var(--chakra-colors-bg-muted)",
                    fontWeight: 500,
                  }),
                }}
              >
                <Link to={item.to}>
                  <item.icon
                    size={16}
                    color={active ? "#0d9488" : undefined}
                    style={{ opacity: active ? 1 : 0.6 }}
                  />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </VStack>
      </Box>

      {/* Bottom Section */}
      <Box borderTopWidth="1px" borderColor="border.muted" p="4">
        <Box rounded="lg" bg="bg.muted" p="4" mb="4">
          <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider" mb="2">
            Network
          </Text>
          <Flex align="center" gap="2" fontSize="xs" fontFamily="mono" color="fg">
            <Box w="2" h="2" rounded="full" bg="green.500" css={{ animation: "pulse 2s infinite" }} />
            Block #{blockNumber?.toString() ?? "..."}
          </Flex>
        </Box>

        <Button
          variant="ghost"
          size="sm"
          w="full"
          justifyContent="flex-start"
          color="fg.muted"
          onClick={() => disconnect()}
        >
          <LogOut size={16} />
          Disconnect
        </Button>
      </Box>
    </Flex>
  )
}
