import { Box, Button, Flex, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react"
import { Link } from "react-router"
import { ArrowRight, CheckCircle, Zap, Shield, BarChart3, Rocket } from "lucide-react"

const features = [
  "Fair launch mechanism with transparent on-chain clearing",
  "Prevent sniper bot attacks with gradual price discovery",
  "One-click migration to initialized Uniswap v4 pools",
]

const steps = [
  { icon: Shield, label: "Configured" },
  { icon: BarChart3, label: "Auctioning" },
  { icon: Zap, label: "Migrated" },
]

const bars = [30, 45, 35, 60, 55, 75, 65, 80, 90, 85]

export function LandingPage() {
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.950" }}>
      {/* Nav */}
      <Flex
        as="header"
        px="6"
        h="20"
        align="center"
        justify="space-between"
        maxW="7xl"
        mx="auto"
        w="full"
      >
        <HStack gap="2">
          <Flex
            w="8"
            h="8"
            rounded="lg"
            bg="brand.600"
            align="center"
            justify="center"
            color="white"
          >
            <Zap size={20} />
          </Flex>
          <Text fontFamily="heading" fontWeight="bold" fontSize="xl" letterSpacing="tight">
            Uniswap CCA
          </Text>
        </HStack>
        <HStack gap="4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auctions">Explore Live Auctions</Link>
          </Button>
          <Button asChild size="sm" colorPalette="gray" variant="solid">
            <Link to="/">Launch App</Link>
          </Button>
        </HStack>
      </Flex>

      {/* Hero */}
      <Box as="main" flex="1">
        <SimpleGrid
          maxW="7xl"
          mx="auto"
          px="6"
          py={{ base: "16", lg: "32" }}
          columns={{ base: 1, lg: 2 }}
          gap="12"
          alignItems="center"
        >
          {/* Left: Copy */}
          <VStack align="start" gap="8">
            <Heading
              fontFamily="heading"
              fontSize={{ base: "4xl", lg: "6xl" }}
              fontWeight="bold"
              letterSpacing="tight"
              lineHeight="1.1"
            >
              Continuous price discovery.{" "}
              <br />
              <Text as="span" color="brand.600">
                Instant liquidity.
              </Text>
            </Heading>
            <Text fontSize="xl" color="fg.muted" maxW="lg" lineHeight="relaxed">
              Launch your token using Continuous Clearing Auctions. Migrate
              directly to Uniswap v4 pools with zero friction.
            </Text>

            <VStack align="start" gap="4" pt="4">
              {features.map((item, i) => (
                <HStack key={i} gap="3" align="start">
                  <CheckCircle size={24} color="#14b8a6" style={{ flexShrink: 0 }} />
                  <Text fontWeight="medium" color="fg">
                    {item}
                  </Text>
                </HStack>
              ))}
            </VStack>

            <HStack gap="4" pt="8">
              <Button asChild size="lg" colorPalette="brand" h="14" px="8" fontSize="lg">
                <Link to="/create">
                  Launch a Sale
                  <ArrowRight size={20} />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                h="14"
                px="8"
                fontSize="lg"
                onClick={() =>
                  window.open(
                    "https://docs.uniswap.org/contracts/liquidity-launchpad/Overview",
                    "_blank",
                  )
                }
              >
                Documentation
              </Button>
            </HStack>
          </VStack>

          {/* Right: Visual */}
          <Box position="relative">
            <Box
              position="absolute"
              inset="0"
              bgGradient="to-r"
              gradientFrom="brand.500/10"
              gradientTo="blue.500/10"
              rounded="3xl"
              transform="rotate(3deg) scale(1.05)"
              css={{ filter: "blur(40px)" }}
            />
            <Box
              position="relative"
              bg="bg"
              rounded="2xl"
              shadow="xl"
              borderWidth="1px"
              borderColor="border.muted"
              p="8"
              overflow="hidden"
            >
              {/* Fake header */}
              <Flex justify="space-between" align="center" borderBottomWidth="1px" borderColor="border.muted" pb="4" mb="8">
                <VStack gap="1" align="start">
                  <Box h="2" w="24" bg="gray.200" rounded="full" css={{ animation: "pulse 2s infinite", "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.5 } } }} />
                  <Box h="2" w="16" bg="gray.100" rounded="full" />
                </VStack>
                <Box h="8" w="8" bg="gray.100" rounded="full" />
              </Flex>

              {/* Abstract Chart Bars */}
              <Flex h="40" w="full" align="flex-end" gap="2" px="4">
                {bars.map((h, i) => (
                  <Box key={i} flex="1" bg="brand.100" roundedTop="sm" position="relative">
                    <Box
                      position="absolute"
                      bottom="0"
                      w="full"
                      bg="brand.500"
                      roundedTop="sm"
                      transition="all 1s"
                      style={{ height: `${h}%`, opacity: (i + 1) / 10 }}
                    />
                  </Box>
                ))}
              </Flex>

              {/* Three Steps */}
              <SimpleGrid columns={3} gap="4" mt="8">
                {steps.map((step, i) => (
                  <VStack
                    key={i}
                    p="3"
                    rounded="lg"
                    bg="bg.muted"
                    borderWidth="1px"
                    borderColor="border.muted"
                    gap="2"
                  >
                    <step.icon size={20} color="#94a3b8" />
                    <Text fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase">
                      {step.label}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </Box>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  )
}
