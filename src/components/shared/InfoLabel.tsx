import { HStack, Text } from "@chakra-ui/react"
import { Info } from "lucide-react"
import { Tooltip } from "../ui/tooltip"
import { glossary } from "../../lib/glossary"

interface Props {
  label: string
  glossaryKey?: string
  tip?: string
  fontSize?: string
}

export function InfoLabel({ label, glossaryKey, tip, fontSize = "xs" }: Props) {
  const content = tip ?? (glossaryKey ? glossary[glossaryKey] : undefined)

  if (!content) {
    return (
      <Text fontSize={fontSize} color="fg.muted">
        {label}
      </Text>
    )
  }

  return (
    <HStack gap="1">
      <Text fontSize={fontSize} color="fg.muted">
        {label}
      </Text>
      <Tooltip content={content} showArrow>
        <Info size={12} style={{ color: "var(--chakra-colors-fg-muted)", cursor: "help", flexShrink: 0 }} />
      </Tooltip>
    </HStack>
  )
}
