import { useState } from "react"
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { toaster } from "../components/ui/toaster"
import { TokenDetailsStep } from "../components/create/TokenDetailsStep"
import { AuctionConfigStep } from "../components/create/AuctionConfigStep"
import {
  ReleaseScheduleStep,
  type ScheduleSegment,
} from "../components/create/ReleaseScheduleStep"
import { GatekeepingStep } from "../components/create/GatekeepingStep"
import { RecipientsStep } from "../components/create/RecipientsStep"
import { ReviewStep } from "../components/create/ReviewStep"
import type { GatekeepMode } from "../mock/types"
import { useNavigate } from "react-router"
import { Check, ChevronLeft, ChevronRight, Rocket } from "lucide-react"

const steps = [
  { label: "Token Setup", description: "Name and supply" },
  { label: "Auction Params", description: "Pricing and timing" },
  { label: "Supply Schedule", description: "Token distribution" },
  { label: "Validation", description: "Who can participate" },
  { label: "Recipients", description: "Fund destinations" },
  { label: "Review", description: "Confirm and deploy" },
]

export function CreateAuctionPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const [tokenDetails, setTokenDetails] = useState({
    name: "",
    symbol: "",
    totalSupply: "",
    decimals: "18",
  })

  const [auctionConfig, setAuctionConfig] = useState({
    floorPrice: "",
    currency: "ETH",
    startBlock: "",
    endBlock: "",
    tickSpacing: "",
    requiredCurrencyRaised: "",
    fundsRecipient: "",
    tokensRecipient: "",
  })

  const [releaseSchedule, setReleaseSchedule] = useState<ScheduleSegment[]>([
    { percentage: "25", blockDelta: "12500" },
    { percentage: "25", blockDelta: "12500" },
    { percentage: "25", blockDelta: "12500" },
    { percentage: "25", blockDelta: "12500" },
  ])

  const [gatekeeping, setGatekeeping] = useState<{
    mode: GatekeepMode
    config: Record<string, string>
  }>({
    mode: "none",
    config: {},
  })

  const handleDeploy = () => {
    toaster.create({
      title: "Auction Deployed!",
      description: `${tokenDetails.name} ($${tokenDetails.symbol}) auction created successfully.`,
      type: "success",
    })
    setTimeout(() => navigate("/auctions"), 1500)
  }

  const canNext = step < steps.length - 1
  const canPrev = step > 0

  return (
    <Box>
      <VStack align="start" gap="1" mb="8">
        <Heading fontFamily="heading" size="3xl" fontWeight="bold">
          Create Launch
        </Heading>
        <Text color="fg.muted" fontSize="sm">
          Set up a token auction in {steps.length} steps.
        </Text>
      </VStack>

      <Flex gap="8">
        {/* Sidebar Stepper */}
        <VStack
          w="56"
          flexShrink={0}
          align="stretch"
          gap="1"
          display={{ base: "none", lg: "flex" }}
        >
          {steps.map((s, i) => {
            const isActive = i === step
            const isComplete = i < step
            return (
              <Flex
                key={i}
                align="center"
                gap="3"
                p="3"
                rounded="lg"
                cursor="pointer"
                onClick={() => setStep(i)}
                bg={isActive ? "brand.50" : "transparent"}
                _hover={{ bg: isActive ? "brand.50" : "bg.muted" }}
                transition="backgrounds"
                _dark={{
                  bg: isActive ? "brand.950" : "transparent",
                  _hover: { bg: isActive ? "brand.950" : "bg.muted" },
                }}
              >
                <Flex
                  w="7"
                  h="7"
                  rounded="full"
                  align="center"
                  justify="center"
                  fontSize="xs"
                  fontWeight="bold"
                  flexShrink={0}
                  bg={isComplete ? "brand.600" : isActive ? "brand.600" : "bg.muted"}
                  color={isComplete || isActive ? "white" : "fg.muted"}
                >
                  {isComplete ? <Check size={14} /> : i + 1}
                </Flex>
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight={isActive ? "semibold" : "medium"}
                    color={isActive ? "brand.700" : "fg"}
                    _dark={{ color: isActive ? "brand.300" : "fg" }}
                  >
                    {s.label}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    {s.description}
                  </Text>
                </Box>
              </Flex>
            )
          })}
        </VStack>

        {/* Content */}
        <Box flex="1" minW="0">
          <Card.Root variant="outline">
            <Card.Header>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    {steps[step].label}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    Step {step + 1} of {steps.length}
                  </Text>
                </Box>
                {/* Mobile step indicator */}
                <Text
                  fontSize="sm"
                  color="fg.muted"
                  display={{ base: "block", lg: "none" }}
                >
                  {step + 1}/{steps.length}
                </Text>
              </Flex>
            </Card.Header>
            <Card.Body>
              {step === 0 && (
                <TokenDetailsStep data={tokenDetails} onChange={setTokenDetails} />
              )}
              {step === 1 && (
                <AuctionConfigStep data={auctionConfig} onChange={setAuctionConfig} />
              )}
              {step === 2 && (
                <ReleaseScheduleStep
                  segments={releaseSchedule}
                  onChange={setReleaseSchedule}
                />
              )}
              {step === 3 && (
                <GatekeepingStep data={gatekeeping} onChange={setGatekeeping} />
              )}
              {step === 4 && (
                <RecipientsStep data={auctionConfig} onChange={setAuctionConfig} />
              )}
              {step === 5 && (
                <ReviewStep
                  data={{
                    tokenDetails,
                    auctionConfig,
                    releaseSchedule,
                    gatekeeping,
                  }}
                />
              )}
            </Card.Body>
            <Card.Footer>
              <HStack justify="space-between" w="full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(step - 1)}
                  disabled={!canPrev}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                <HStack gap="3">
                  {canNext && (
                    <Button
                      size="sm"
                      colorPalette="brand"
                      onClick={() => setStep(step + 1)}
                    >
                      Next
                      <ChevronRight size={16} />
                    </Button>
                  )}
                  {step === steps.length - 1 && (
                    <Button
                      size="sm"
                      colorPalette="brand"
                      onClick={handleDeploy}
                    >
                      <Rocket size={16} />
                      Deploy Auction
                    </Button>
                  )}
                </HStack>
              </HStack>
            </Card.Footer>
          </Card.Root>
        </Box>
      </Flex>
    </Box>
  )
}
