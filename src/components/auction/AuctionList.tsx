import { SimpleGrid, Tabs } from "@chakra-ui/react"
import { mockAuctions } from "../../mock/auctions"
import type { AuctionStatus } from "../../mock/types"
import { AuctionCard } from "./AuctionCard"
import { EmptyState } from "../ui/empty-state"
import { Search } from "lucide-react"

const tabs: { label: string; statuses: AuctionStatus[] }[] = [
  { label: "Live", statuses: ["live"] },
  { label: "Upcoming", statuses: ["upcoming"] },
  { label: "Completed", statuses: ["completed", "graduated"] },
]

function getCount(statuses: AuctionStatus[]) {
  return mockAuctions.filter((a) => statuses.includes(a.status)).length
}

export function AuctionList() {
  return (
    <Tabs.Root defaultValue="Live" variant="line">
      <Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Trigger key={tab.label} value={tab.label}>
            {tab.label} ({getCount(tab.statuses)})
          </Tabs.Trigger>
        ))}
        <Tabs.Indicator />
      </Tabs.List>
      {tabs.map((tab) => {
        const filtered = mockAuctions.filter((a) =>
          tab.statuses.includes(a.status),
        )
        return (
          <Tabs.Content key={tab.label} value={tab.label}>
            {filtered.length === 0 ? (
              <EmptyState
                title={`No ${tab.label.toLowerCase()} auctions`}
                description="Check back later for new auctions."
                icon={<Search size={24} />}
              />
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6" pt="4">
                {filtered.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </SimpleGrid>
            )}
          </Tabs.Content>
        )
      })}
    </Tabs.Root>
  )
}
