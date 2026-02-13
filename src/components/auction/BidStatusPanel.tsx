import { Badge, Box, HStack, Table, Text } from "@chakra-ui/react"
import type { Bid } from "../../mock/types"
import { glossary } from "../../lib/glossary"
import { EmptyState } from "../ui/empty-state"
import { FileText } from "lucide-react"

const statusColorMap: Record<string, string> = {
  active: "blue",
  outbid: "orange",
  filled: "green",
  exited: "gray",
}

interface Props {
  bids: Bid[]
  currency: string
}

export function BidStatusPanel({ bids, currency }: Props) {
  if (bids.length === 0) {
    return (
      <EmptyState
        title="No bids placed yet"
        description="Place a bid above to get started."
        icon={<FileText size={24} />}
      />
    )
  }

  return (
    <Box overflowX="auto">
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Max Price</Table.ColumnHeader>
            <Table.ColumnHeader>Budget</Table.ColumnHeader>
            <Table.ColumnHeader>Tokens Received</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {bids.map((bid) => (
            <Table.Row key={bid.id}>
              <Table.Cell fontFamily="mono">
                {bid.maxPrice} {currency}
              </Table.Cell>
              <Table.Cell fontFamily="mono">
                {bid.amount} {currency}
              </Table.Cell>
              <Table.Cell fontFamily="mono">
                {parseFloat(bid.tokensFilled).toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                <HStack gap="2">
                  <Badge
                    colorPalette={statusColorMap[bid.status]}
                    size="sm"
                  >
                    {bid.status}
                  </Badge>
                  <Text fontSize="xs" color="fg.muted">
                    {glossary[`status.${bid.status}`]}
                  </Text>
                </HStack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}
