import { Badge, Button, HStack, Table, Text } from "@chakra-ui/react"
import { mockAuctions } from "../../mock/auctions"
import { mockBids } from "../../mock/bids"
import { toaster } from "../ui/toaster"
import { glossary } from "../../lib/glossary"
import { EmptyState } from "../ui/empty-state"
import { UsdEquivalent } from "../shared/UsdEquivalent"
import { Tooltip } from "../ui/tooltip"
import { FileText } from "lucide-react"

const statusColorMap: Record<string, string> = {
  active: "blue",
  outbid: "orange",
  filled: "green",
  exited: "gray",
}

export function MyBidsTable() {
  const auctionMap = Object.fromEntries(mockAuctions.map((a) => [a.id, a]))

  const handleClaim = (bidId: string) => {
    toaster.create({
      title: "Tokens Claimed",
      description: `Successfully claimed tokens for bid ${bidId}`,
      type: "success",
    })
  }

  const handleExit = (bidId: string) => {
    toaster.create({
      title: "Bid Exited",
      description: `Successfully exited bid ${bidId}`,
      type: "info",
    })
  }

  if (mockBids.length === 0) {
    return (
      <EmptyState
        title="No bids yet"
        description="Browse auctions to place your first bid."
        icon={<FileText size={24} />}
      />
    )
  }

  return (
    <Table.Root size="sm" variant="outline">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Auction</Table.ColumnHeader>
          <Table.ColumnHeader>Max Price</Table.ColumnHeader>
          <Table.ColumnHeader>Budget</Table.ColumnHeader>
          <Table.ColumnHeader>Tokens Received</Table.ColumnHeader>
          <Table.ColumnHeader>Status</Table.ColumnHeader>
          <Table.ColumnHeader>Actions</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {mockBids.map((bid) => {
          const auction = auctionMap[bid.auctionId]
          const currency = auction?.currency ?? ""
          return (
            <Table.Row key={bid.id}>
              <Table.Cell>
                {auction
                  ? `${auction.token.name} ($${auction.token.symbol})`
                  : bid.auctionId}
              </Table.Cell>
              <Table.Cell fontFamily="mono">
                <HStack gap="1">
                  <Text>{bid.maxPrice} {currency}</Text>
                  <UsdEquivalent amount={bid.maxPrice} currency={currency} fontSize="xs" />
                </HStack>
              </Table.Cell>
              <Table.Cell fontFamily="mono">
                <HStack gap="1">
                  <Text>{bid.amount} {currency}</Text>
                  <UsdEquivalent amount={bid.amount} currency={currency} fontSize="xs" />
                </HStack>
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
              <Table.Cell>
                <HStack gap="2">
                  {bid.status === "filled" && (
                    <Tooltip content="Withdraw tokens to your wallet" showArrow>
                      <Button
                        size="xs"
                        colorPalette="green"
                        variant="outline"
                        onClick={() => handleClaim(bid.id)}
                      >
                        Claim
                      </Button>
                    </Tooltip>
                  )}
                  {(bid.status === "active" || bid.status === "outbid") && (
                    <Tooltip content="Cancel bid, get funds back" showArrow>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleExit(bid.id)}
                      >
                        Exit
                      </Button>
                    </Tooltip>
                  )}
                </HStack>
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table.Root>
  )
}
