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
  computeBlockDeltas,
} from "../components/create/ReleaseScheduleStep"
import { GatekeepingStep } from "../components/create/GatekeepingStep"
import { RecipientsStep } from "../components/create/RecipientsStep"
import { ReviewStep } from "../components/create/ReviewStep"
import type { GatekeepMode } from "../mock/types"
import { useNavigate } from "react-router"
import { Check, ChevronLeft, ChevronRight, Loader2, Rocket } from "lucide-react"
import { useAccount, usePublicClient, useWriteContract } from "wagmi"
import { type Address, parseEther, parseUnits, zeroAddress, encodeAbiParameters, keccak256, toHex } from "viem"
import { liquidityLauncherAbi, LIQUIDITY_LAUNCHER, UERC20_FACTORY } from "../abi/liquidityLauncher"
import { CCA_FACTORY_ADDRESS } from "../abi/ccaFactory"
import { priceToQ96 } from "../lib/q96"

const steps = [
  { label: "Token Setup", description: "Name and supply" },
  { label: "Auction Params", description: "Pricing and timing" },
  { label: "Supply Schedule", description: "Token distribution" },
  { label: "Validation", description: "Who can participate" },
  { label: "Recipients", description: "Fund destinations" },
  { label: "Review", description: "Confirm and deploy" },
]

/**
 * Encode release schedule segments into packed 8-byte entries for CCA.
 *
 * Each entry: upper 24 bits = mps (per-block rate in milli-bips),
 *             lower 40 bits = blockDelta (duration in blocks).
 *
 * Constraint: sum(mps_i * blockDelta_i) must equal 1e7 (MPS constant = 100%).
 */
function encodeAuctionSteps(
  segments: { percentage: number; blockDelta: number }[],
): `0x${string}` {
  const MPS_TOTAL = 10_000_000n

  // Calculate raw mps values
  const steps: { mps: bigint; blockDelta: bigint }[] = segments.map((seg) => {
    const blockDelta = BigInt(seg.blockDelta)
    // mps = percentage * 1e5 / blockDelta (since percentage/100 * 1e7 / blockDelta)
    const mps = (BigInt(Math.round(seg.percentage * 1e5))) / blockDelta
    return { mps, blockDelta }
  })

  // Fix rounding: adjust last step so sum(mps * blockDelta) = MPS_TOTAL
  const currentSum = steps.reduce((sum, s) => sum + s.mps * s.blockDelta, 0n)
  if (currentSum !== MPS_TOTAL && steps.length > 0) {
    const last = steps[steps.length - 1]
    const diff = MPS_TOTAL - currentSum
    const adjustedMps = last.mps + diff / last.blockDelta
    if (adjustedMps > 0n) {
      steps[steps.length - 1] = { mps: adjustedMps, blockDelta: last.blockDelta }
    }
  }

  // Pack into bytes
  let hex = "0x"
  for (const s of steps) {
    // Pack: upper 24 bits = mps, lower 40 bits = blockDelta
    const packed = (s.mps << 40n) | s.blockDelta
    hex += packed.toString(16).padStart(16, "0")
  }

  return hex as `0x${string}`
}

/**
 * Encode AuctionParameters struct as bytes for the CCA Factory.
 */
function encodeAuctionParams(args: {
  currency: Address
  tokensRecipient: Address
  fundsRecipient: Address
  startBlock: bigint
  endBlock: bigint
  claimBlock: bigint
  tickSpacing: bigint
  validationHook: Address
  floorPrice: bigint
  requiredCurrencyRaised: bigint
  auctionStepsData: `0x${string}`
}): `0x${string}` {
  return encodeAbiParameters(
    [
      { type: "address" },
      { type: "address" },
      { type: "address" },
      { type: "uint64" },
      { type: "uint64" },
      { type: "uint64" },
      { type: "uint256" },
      { type: "address" },
      { type: "uint256" },
      { type: "uint128" },
      { type: "bytes" },
    ],
    [
      args.currency,
      args.tokensRecipient,
      args.fundsRecipient,
      args.startBlock,
      args.endBlock,
      args.claimBlock,
      args.tickSpacing,
      args.validationHook,
      args.floorPrice,
      args.requiredCurrencyRaised,
      args.auctionStepsData,
    ],
  )
}

export function CreateAuctionPage() {
  const navigate = useNavigate()
  const { address: userAddress } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const [step, setStep] = useState(0)
  const [deploying, setDeploying] = useState(false)
  const [deployStatus, setDeployStatus] = useState("")

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
    { percentage: "25" },
    { percentage: "25" },
    { percentage: "25" },
    { percentage: "25" },
  ])

  // Auction duration derived from config
  const startNum = parseInt(auctionConfig.startBlock)
  const endNum = parseInt(auctionConfig.endBlock)
  const auctionDuration = !isNaN(startNum) && !isNaN(endNum) && endNum > startNum
    ? endNum - startNum
    : null

  const [gatekeeping, setGatekeeping] = useState<{
    mode: GatekeepMode
    config: Record<string, string>
  }>({
    mode: "none",
    config: {},
  })

  const validate = (): string | null => {
    if (!userAddress) return "Connect your wallet first"
    if (!publicClient) return "No RPC connection"
    if (!tokenDetails.name.trim()) return "Token name is required"
    if (!tokenDetails.symbol.trim()) return "Token symbol is required"
    if (!tokenDetails.totalSupply || parseFloat(tokenDetails.totalSupply) <= 0) return "Total supply must be > 0"
    if (!auctionConfig.floorPrice || parseFloat(auctionConfig.floorPrice) <= 0) return "Floor price must be > 0"
    if (!auctionConfig.startBlock || parseInt(auctionConfig.startBlock) <= 0) return "Start block is required"
    if (!auctionConfig.endBlock || parseInt(auctionConfig.endBlock) <= 0) return "End block is required"
    if (parseInt(auctionConfig.endBlock) <= parseInt(auctionConfig.startBlock)) return "End block must be > start block"
    if (!auctionConfig.tickSpacing || parseInt(auctionConfig.tickSpacing) < 2) return "Tick spacing must be at least 2"
    if (!auctionConfig.fundsRecipient || !auctionConfig.fundsRecipient.startsWith("0x")) return "Funds recipient address is required"
    if (!auctionConfig.tokensRecipient || !auctionConfig.tokensRecipient.startsWith("0x")) return "Tokens recipient address is required"

    const totalPct = releaseSchedule.reduce((s, seg) => s + (parseFloat(seg.percentage) || 0), 0)
    if (Math.abs(totalPct - 100) > 0.1) return `Release schedule must total 100% (currently ${totalPct.toFixed(1)}%)`

    return null
  }

  const handleDeploy = async () => {
    const error = validate()
    if (error) {
      toaster.create({ title: "Validation Error", description: error, type: "error" })
      return
    }

    if (!userAddress || !publicClient) return

    setDeploying(true)
    try {
      const decimals = parseInt(tokenDetails.decimals) || 18
      const totalSupplyWei = parseUnits(tokenDetails.totalSupply, decimals)

      // ─── Step 1: Create Token ──────────────────────────────
      setDeployStatus("Deploying token...")
      toaster.create({ title: "Step 1/2", description: "Deploying your token. Confirm in wallet...", type: "info" })

      const createTokenHash = await writeContractAsync({
        address: LIQUIDITY_LAUNCHER,
        abi: liquidityLauncherAbi,
        functionName: "createToken",
        args: [
          UERC20_FACTORY,
          tokenDetails.name,
          tokenDetails.symbol,
          decimals,
          totalSupplyWei,
          LIQUIDITY_LAUNCHER, // Mint to launcher for atomic flow
          "0x" as `0x${string}`,
        ],
      })

      setDeployStatus("Waiting for token deployment confirmation...")
      const createReceipt = await publicClient.waitForTransactionReceipt({
        hash: createTokenHash,
      })

      // Parse TokenCreated event to get token address
      // TokenCreated(address indexed token) — topic[0] = sig, topic[1] = address
      const tokenCreatedSig = keccak256(toHex("TokenCreated(address)"))
      const tokenLog = createReceipt.logs.find(
        (log) => log.topics[0] === tokenCreatedSig,
      )
      let tokenAddress: Address
      if (tokenLog?.topics[1]) {
        tokenAddress = `0x${tokenLog.topics[1].slice(26)}` as Address
      } else {
        // Fallback: look at all logs for the first Transfer(0x0, ...) which indicates minting
        throw new Error("Could not find TokenCreated event in receipt. Token deployment may have failed.")
      }

      toaster.create({
        title: "Token deployed!",
        description: `${tokenDetails.symbol} at ${tokenAddress.slice(0, 10)}...`,
        type: "success",
      })

      // ─── Step 2: Create Auction via distributeToken ────────
      setDeployStatus("Creating auction...")
      toaster.create({ title: "Step 2/2", description: "Creating the CCA auction. Confirm in wallet...", type: "info" })

      const startBlock = BigInt(auctionConfig.startBlock)
      const endBlock = BigInt(auctionConfig.endBlock)
      const claimBlock = endBlock // Tokens claimable immediately after auction ends

      const floorPriceQ96 = priceToQ96(parseFloat(auctionConfig.floorPrice))
      const tickSpacing = BigInt(auctionConfig.tickSpacing)
      const requiredCurrencyRaised = auctionConfig.requiredCurrencyRaised
        ? parseEther(auctionConfig.requiredCurrencyRaised)
        : 0n

      // Compute blockDeltas from percentages and auction duration
      const duration = Number(endBlock - startBlock)
      const blockDeltas = computeBlockDeltas(releaseSchedule, duration)

      // Encode release schedule as packed bytes
      const auctionStepsData = encodeAuctionSteps(
        releaseSchedule.map((seg, i) => ({
          percentage: parseFloat(seg.percentage),
          blockDelta: blockDeltas[i],
        })),
      )

      // Encode the full AuctionParameters struct
      const configData = encodeAuctionParams({
        currency: zeroAddress, // ETH = address(0)
        tokensRecipient: auctionConfig.tokensRecipient as Address,
        fundsRecipient: auctionConfig.fundsRecipient as Address,
        startBlock,
        endBlock,
        claimBlock,
        tickSpacing,
        validationHook: zeroAddress, // No hook
        floorPrice: floorPriceQ96,
        requiredCurrencyRaised: requiredCurrencyRaised > 0n ? requiredCurrencyRaised : 0n,
        auctionStepsData,
      })

      // Generate a unique salt from the user address and timestamp
      const salt = keccak256(
        encodeAbiParameters(
          [{ type: "address" }, { type: "uint256" }],
          [userAddress, BigInt(Date.now())],
        ),
      )

      const distributeTxHash = await writeContractAsync({
        address: LIQUIDITY_LAUNCHER,
        abi: liquidityLauncherAbi,
        functionName: "distributeToken",
        args: [
          tokenAddress,
          {
            strategy: CCA_FACTORY_ADDRESS,
            amount: totalSupplyWei,
            configData,
          },
          false, // payerIsUser = false (tokens already in launcher)
          salt,
        ],
      })

      setDeployStatus("Waiting for auction creation confirmation...")
      const distributeReceipt = await publicClient.waitForTransactionReceipt({
        hash: distributeTxHash,
      })

      // Parse logs to find the auction address
      // TokenDistributed(address indexed token, address indexed distributionContract, uint256 amount)
      const tokenDistributedSig = keccak256(toHex("TokenDistributed(address,address,uint256)"))
      const distributeLog = distributeReceipt.logs.find(
        (log) => log.topics[0] === tokenDistributedSig,
      )
      let auctionAddress: string | null = null
      if (distributeLog?.topics[2]) {
        auctionAddress = `0x${distributeLog.topics[2].slice(26)}`
      }

      toaster.create({
        title: "Auction Created!",
        description: auctionAddress
          ? `${tokenDetails.name} auction deployed at ${auctionAddress.slice(0, 10)}...`
          : `${tokenDetails.name} auction created successfully.`,
        type: "success",
      })

      // Navigate to the new auction
      if (auctionAddress) {
        setTimeout(() => navigate(`/auction/${auctionAddress}`), 1000)
      } else {
        setTimeout(() => navigate("/auctions"), 1000)
      }
    } catch (e: unknown) {
      const msg = (e as Error).message || "Unknown error"
      // Shorten common wallet rejection messages
      const displayMsg = msg.includes("User rejected")
        ? "Transaction rejected by user"
        : msg.length > 200
          ? msg.slice(0, 200) + "..."
          : msg
      toaster.create({
        title: "Deployment Failed",
        description: displayMsg,
        type: "error",
      })
    } finally {
      setDeploying(false)
      setDeployStatus("")
    }
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
                cursor={deploying ? "not-allowed" : "pointer"}
                onClick={() => !deploying && setStep(i)}
                bg={isActive ? "brand.50" : "transparent"}
                _hover={{ bg: isActive ? "brand.50" : deploying ? "transparent" : "bg.muted" }}
                transition="backgrounds"
                _dark={{
                  bg: isActive ? "brand.950" : "transparent",
                  _hover: { bg: isActive ? "brand.950" : deploying ? "transparent" : "bg.muted" },
                }}
                opacity={deploying ? 0.5 : 1}
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
                  auctionDuration={auctionDuration}
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
              <VStack w="full" gap="3">
                {/* Deploy status indicator */}
                {deploying && deployStatus && (
                  <Flex
                    w="full"
                    align="center"
                    gap="2"
                    px="4"
                    py="3"
                    rounded="md"
                    bg="brand.50"
                    _dark={{ bg: "brand.950" }}
                  >
                    <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                    <Text fontSize="sm" fontWeight="medium" color="brand.700" _dark={{ color: "brand.300" }}>
                      {deployStatus}
                    </Text>
                  </Flex>
                )}

                <HStack justify="space-between" w="full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep(step - 1)}
                    disabled={!canPrev || deploying}
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
                        disabled={deploying}
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
                        loading={deploying}
                        disabled={!userAddress}
                      >
                        <Rocket size={16} />
                        {deploying ? "Deploying..." : "Deploy Auction"}
                      </Button>
                    )}
                  </HStack>
                </HStack>

                {step === steps.length - 1 && !userAddress && (
                  <Text fontSize="xs" color="red.500">
                    Connect your wallet to deploy.
                  </Text>
                )}
              </VStack>
            </Card.Footer>
          </Card.Root>
        </Box>
      </Flex>
    </Box>
  )
}
