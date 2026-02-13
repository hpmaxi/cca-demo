import { Box, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react"
import { Search, HandCoins, Coins } from "lucide-react"

const steps = [
  {
    icon: <Search size={28} />,
    title: "Browse",
    description: "Find a token auction you want to participate in.",
  },
  {
    icon: <HandCoins size={28} />,
    title: "Bid",
    description:
      "Set your max price and budget. You'll never pay more than your max.",
  },
  {
    icon: <Coins size={28} />,
    title: "Get Tokens",
    description:
      "Everyone pays the same final price. Claim your tokens when it ends.",
  },
]

export function HowItWorks() {
  return (
    <Box>
      <Heading size="lg" mb="6" textAlign="center">
        How it works
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
        {steps.map((step) => (
          <VStack
            key={step.title}
            gap="3"
            p="6"
            borderWidth="1px"
            borderColor="border.muted"
            rounded="lg"
            textAlign="center"
          >
            <Box color="fg.muted">{step.icon}</Box>
            <Text fontWeight="bold" fontSize="md">
              {step.title}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              {step.description}
            </Text>
          </VStack>
        ))}
      </SimpleGrid>
    </Box>
  )
}
