import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Plus, Trash2 } from "lucide-react"
import { blocksToTime } from "../../lib/format"

export interface ScheduleSegment {
  percentage: string
}

interface Props {
  segments: ScheduleSegment[]
  onChange: (segments: ScheduleSegment[]) => void
  /** Auction duration in blocks (endBlock - startBlock). Used to auto-calculate blockDelta. */
  auctionDuration: number | null
}

const presets: { label: string; description: string; segments: ScheduleSegment[] }[] = [
  {
    label: "Linear",
    description: "Equal portions",
    segments: [
      { percentage: "25" },
      { percentage: "25" },
      { percentage: "25" },
      { percentage: "25" },
    ],
  },
  {
    label: "Back-loaded",
    description: "Most tokens later",
    segments: [
      { percentage: "5" },
      { percentage: "10" },
      { percentage: "25" },
      { percentage: "60" },
    ],
  },
  {
    label: "Front-loaded",
    description: "Most tokens early",
    segments: [
      { percentage: "50" },
      { percentage: "25" },
      { percentage: "15" },
      { percentage: "10" },
    ],
  },
  {
    label: "All at once",
    description: "Single release",
    segments: [
      { percentage: "100" },
    ],
  },
]

/**
 * Compute blockDelta for each segment proportionally from percentage.
 * Adjusts the last segment so the total exactly equals auctionDuration.
 */
export function computeBlockDeltas(
  segments: ScheduleSegment[],
  auctionDuration: number,
): number[] {
  const totalPct = segments.reduce((s, seg) => s + (parseFloat(seg.percentage) || 0), 0)
  if (totalPct === 0 || auctionDuration <= 0) return segments.map(() => 0)

  const deltas = segments.map((seg) => {
    const pct = parseFloat(seg.percentage) || 0
    return Math.round((pct / totalPct) * auctionDuration)
  })

  // Fix rounding so sum equals exactly auctionDuration
  const sum = deltas.reduce((a, b) => a + b, 0)
  if (sum !== auctionDuration && deltas.length > 0) {
    deltas[deltas.length - 1] += auctionDuration - sum
  }

  return deltas
}

export function ReleaseScheduleStep({ segments, onChange, auctionDuration }: Props) {
  const totalPct = segments.reduce(
    (sum, s) => sum + (parseFloat(s.percentage) || 0),
    0,
  )

  const blockDeltas = auctionDuration ? computeBlockDeltas(segments, auctionDuration) : null

  const addSegment = () => {
    onChange([...segments, { percentage: "" }])
  }

  const removeSegment = (index: number) => {
    onChange(segments.filter((_, i) => i !== index))
  }

  const updatePercentage = (index: number, value: string) => {
    const updated = segments.map((s, i) =>
      i === index ? { ...s, percentage: value } : s,
    )
    onChange(updated)
  }

  return (
    <VStack gap="6" align="stretch">
      <Text fontSize="sm" color="fg.muted">
        Choose how tokens are released during the auction. Block durations are calculated
        automatically from the auction length.
      </Text>

      {!auctionDuration && (
        <Box px="3" py="2" rounded="md" bg="orange.subtle" fontSize="xs" color="orange.fg">
          Set start and end blocks in Auction Params first to see time calculations.
        </Box>
      )}

      {auctionDuration && auctionDuration > 0 && (
        <Box px="3" py="2" rounded="md" bg="blue.subtle" fontSize="xs" color="blue.fg" fontFamily="mono">
          Auction duration: {auctionDuration.toLocaleString()} blocks ({blocksToTime(auctionDuration)})
        </Box>
      )}

      {/* Presets */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="2">
          Preset Templates
        </Text>
        <HStack gap="2" flexWrap="wrap">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              size="sm"
              variant="outline"
              onClick={() => onChange(preset.segments)}
            >
              {preset.label} — {preset.description}
            </Button>
          ))}
        </HStack>
      </Box>

      {/* Segments */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="3">
          Release Segments
        </Text>
        <VStack gap="3" align="stretch">
          {segments.map((seg, i) => {
            const delta = blockDeltas?.[i]
            const humanTime = delta && delta > 0 ? blocksToTime(delta) : null
            return (
              <Flex key={i} gap="3" align="center">
                <Text fontSize="sm" color="fg.muted" minW="6">
                  {i + 1}.
                </Text>
                <Box flex="1">
                  <Text fontSize="xs" color="fg.muted" mb="1">
                    % of Tokens
                  </Text>
                  <Input
                    size="sm"
                    placeholder="%"
                    value={seg.percentage}
                    onChange={(e) => updatePercentage(i, e.target.value)}
                  />
                </Box>
                <Box flex="1">
                  <Text fontSize="xs" color="fg.muted" mb="1">
                    Duration (auto)
                  </Text>
                  <Flex
                    align="center"
                    h="8"
                    px="3"
                    rounded="md"
                    bg="bg.muted"
                    fontSize="sm"
                    fontFamily="mono"
                    color="fg.muted"
                  >
                    {delta && delta > 0
                      ? `${delta.toLocaleString()} blocks${humanTime ? ` (${humanTime})` : ""}`
                      : "—"}
                  </Flex>
                </Box>
                <IconButton
                  aria-label="Remove segment"
                  size="sm"
                  variant="ghost"
                  colorPalette="red"
                  onClick={() => removeSegment(i)}
                  mt="4"
                >
                  <Trash2 size={16} />
                </IconButton>
              </Flex>
            )
          })}
        </VStack>
      </Box>

      <Button size="sm" variant="outline" onClick={addSegment}>
        <Plus size={16} />
        Add Segment
      </Button>

      {/* Bar preview */}
      <Box>
        <HStack justify="space-between" mb="2">
          <Text fontSize="sm" fontWeight="medium">
            Release Curve Preview
          </Text>
          <Text
            fontSize="sm"
            color={
              Math.abs(totalPct - 100) < 0.01 ? "green.fg" : "red.fg"
            }
            fontWeight="medium"
          >
            Total: {totalPct.toFixed(1)}%
          </Text>
        </HStack>
        <Flex h="8" rounded="md" overflow="hidden" borderWidth="1px">
          {segments.map((seg, i) => {
            const pct = parseFloat(seg.percentage) || 0
            if (pct <= 0) return null
            const colors = [
              "blue.500",
              "purple.500",
              "teal.500",
              "orange.500",
              "pink.500",
              "cyan.500",
            ]
            return (
              <Box
                key={i}
                bg={colors[i % colors.length]}
                w={`${pct}%`}
                h="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="width 0.2s"
              >
                {pct >= 8 && (
                  <Text fontSize="xs" color="white" fontWeight="bold">
                    {pct}%
                  </Text>
                )}
              </Box>
            )
          })}
        </Flex>
      </Box>
    </VStack>
  )
}
