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
  blockDelta: string
}

interface Props {
  segments: ScheduleSegment[]
  onChange: (segments: ScheduleSegment[]) => void
}

const presets: { label: string; description: string; segments: ScheduleSegment[] }[] = [
  {
    label: "Linear",
    description: "Equal portions",
    segments: [
      { percentage: "25", blockDelta: "12500" },
      { percentage: "25", blockDelta: "12500" },
      { percentage: "25", blockDelta: "12500" },
      { percentage: "25", blockDelta: "12500" },
    ],
  },
  {
    label: "Back-loaded",
    description: "Most tokens later",
    segments: [
      { percentage: "5", blockDelta: "5000" },
      { percentage: "10", blockDelta: "10000" },
      { percentage: "25", blockDelta: "15000" },
      { percentage: "60", blockDelta: "20000" },
    ],
  },
  {
    label: "Front-loaded",
    description: "Most tokens early",
    segments: [
      { percentage: "50", blockDelta: "10000" },
      { percentage: "25", blockDelta: "10000" },
      { percentage: "15", blockDelta: "15000" },
      { percentage: "10", blockDelta: "15000" },
    ],
  },
]

export function ReleaseScheduleStep({ segments, onChange }: Props) {
  const totalPct = segments.reduce(
    (sum, s) => sum + (parseFloat(s.percentage) || 0),
    0,
  )

  const addSegment = () => {
    onChange([...segments, { percentage: "", blockDelta: "" }])
  }

  const removeSegment = (index: number) => {
    onChange(segments.filter((_, i) => i !== index))
  }

  const updateSegment = (
    index: number,
    field: keyof ScheduleSegment,
    value: string,
  ) => {
    const updated = segments.map((s, i) =>
      i === index ? { ...s, [field]: value } : s,
    )
    onChange(updated)
  }

  return (
    <VStack gap="6" align="stretch">
      <Text fontSize="sm" color="fg.muted">
        Choose how tokens are released after the auction. All at once or gradually.
      </Text>

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
            const blockDeltaNum = parseInt(seg.blockDelta)
            const humanTime = !isNaN(blockDeltaNum) && blockDeltaNum > 0
              ? blocksToTime(blockDeltaNum)
              : null
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
                    onChange={(e) =>
                      updateSegment(i, "percentage", e.target.value)
                    }
                  />
                </Box>
                <Box flex="1">
                  <Text fontSize="xs" color="fg.muted" mb="1">
                    Duration {humanTime && <Text as="span" fontSize="2xs">({humanTime})</Text>}
                  </Text>
                  <Input
                    size="sm"
                    placeholder="blocks"
                    value={seg.blockDelta}
                    onChange={(e) =>
                      updateSegment(i, "blockDelta", e.target.value)
                    }
                  />
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
