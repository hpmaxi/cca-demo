import { Box, Card, Input, Text, VStack } from "@chakra-ui/react"
import { Field } from "../ui/field"
import type { GatekeepMode } from "../../mock/types"
import { RadioCardItem, RadioCardRoot } from "../ui/radio-card"
import { SegmentedControl } from "../ui/segmented-control"
import { NumberInputField, NumberInputRoot } from "../ui/number-input"
import { Shield, ShieldCheck, Key, Globe } from "lucide-react"

interface GatekeepConfig {
  mode: GatekeepMode
  config: Record<string, string>
}

interface Props {
  data: GatekeepConfig
  onChange: (data: GatekeepConfig) => void
}

const modeOptions: {
  value: GatekeepMode
  label: string
  description: string
  icon: React.ReactElement
}[] = [
  {
    value: "none",
    label: "Open",
    description: "Anyone can participate. No requirements.",
    icon: <Shield size={20} />,
  },
  {
    value: "eas",
    label: "Attestation (EAS)",
    description: "Participants need an on-chain attestation to join.",
    icon: <ShieldCheck size={20} />,
  },
  {
    value: "erc1155",
    label: "NFT Holder (ERC-1155)",
    description: "Participants must hold a specific NFT to join.",
    icon: <Key size={20} />,
  },
  {
    value: "zk-passport",
    label: "ZK Passport",
    description: "Participants verify their identity privately via ZK proof.",
    icon: <Globe size={20} />,
  },
]

export function GatekeepingStep({ data, onChange }: Props) {
  const updateMode = (value: string) => {
    onChange({ mode: value as GatekeepMode, config: {} })
  }

  const updateConfig = (key: string, value: string) => {
    onChange({ ...data, config: { ...data.config, [key]: value } })
  }

  return (
    <VStack gap="6" align="stretch">
      <Text fontSize="sm" color="fg.muted">
        Choose who can participate in your auction.
      </Text>

      <RadioCardRoot
        value={data.mode}
        onValueChange={(e) => updateMode(e.value ?? "none")}
      >
        <VStack gap="3" align="stretch">
          {modeOptions.map((opt) => (
            <RadioCardItem
              key={opt.value}
              value={opt.value}
              label={opt.label}
              description={opt.description}
              icon={opt.icon}
            />
          ))}
        </VStack>
      </RadioCardRoot>

      {data.mode === "eas" && (
        <Card.Root variant="outline">
          <Card.Body gap="4">
            <Text fontWeight="medium">EAS Configuration</Text>
            <Field label="Schema UID" required helperText="The unique identifier for the attestation schema.">
              <Input
                placeholder="0x..."
                fontFamily="mono"
                value={data.config.schemaUID ?? ""}
                onChange={(e) => updateConfig("schemaUID", e.target.value)}
              />
            </Field>
            <Field label="Attester Address" required helperText="The wallet address authorized to issue attestations.">
              <Input
                placeholder="0x..."
                fontFamily="mono"
                value={data.config.attester ?? ""}
                onChange={(e) => updateConfig("attester", e.target.value)}
              />
            </Field>
          </Card.Body>
        </Card.Root>
      )}

      {data.mode === "erc1155" && (
        <Card.Root variant="outline">
          <Card.Body gap="4">
            <Text fontWeight="medium">NFT Configuration</Text>
            <Field label="Token Contract Address" required helperText="The contract address of the NFT collection.">
              <Input
                placeholder="0x..."
                fontFamily="mono"
                value={data.config.tokenAddress ?? ""}
                onChange={(e) =>
                  updateConfig("tokenAddress", e.target.value)
                }
              />
            </Field>
            <Field label="Required Token ID" required helperText="The specific token ID participants must hold.">
              <Input
                placeholder="e.g. 1"
                value={data.config.tokenId ?? ""}
                onChange={(e) => updateConfig("tokenId", e.target.value)}
              />
            </Field>
          </Card.Body>
        </Card.Root>
      )}

      {data.mode === "zk-passport" && (
        <Card.Root variant="outline">
          <Card.Body gap="4">
            <Text fontWeight="medium">ZK Passport Configuration</Text>
            <Box p="3" bg="blue.subtle" rounded="md">
              <Text fontSize="sm" color="blue.fg">
                Participants prove their identity privately using a zero-knowledge proof from their passport. No personal data is revealed on-chain.
              </Text>
            </Box>
            <Field label="Country Filter Mode">
              <SegmentedControl
                value={data.config.countryMode ?? "whitelist"}
                onValueChange={(e) => updateConfig("countryMode", e.value ?? "whitelist")}
                items={[
                  { value: "whitelist", label: "Allow list" },
                  { value: "blacklist", label: "Block list" },
                ]}
              />
            </Field>
            <Field
              label="Country Codes"
              helperText="Comma-separated ISO 3166-1 alpha-2 codes (e.g. US, GB, DE)"
            >
              <Input
                placeholder="US, GB, DE"
                value={data.config.countries ?? ""}
                onChange={(e) => updateConfig("countries", e.target.value)}
              />
            </Field>
            <Field
              label="Minimum Age"
              helperText="Participants must be at least this age."
            >
              <NumberInputRoot
                min={0}
                max={150}
                value={data.config.minimumAge ?? ""}
                onValueChange={(e) => updateConfig("minimumAge", e.value)}
              >
                <NumberInputField placeholder="e.g. 18" />
              </NumberInputRoot>
            </Field>
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  )
}
