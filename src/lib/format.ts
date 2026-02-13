export const MOCK_ETH_PRICE_USD = 3000

/**
 * Convert a number of Ethereum blocks to a human-readable time string.
 * Each block is ~12 seconds.
 */
export function blocksToTime(blocks: number): string {
  const seconds = blocks * 12
  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24

  if (days >= 1) return `~${Math.round(days)} day${Math.round(days) === 1 ? "" : "s"}`
  if (hours >= 1) return `~${Math.round(hours)} hour${Math.round(hours) === 1 ? "" : "s"}`
  if (minutes >= 1) return `~${Math.round(minutes)} min`
  return `~${Math.round(seconds)}s`
}

/**
 * Format a currency amount with USD equivalent for ETH.
 * ETH: "342.5 ETH (~$1.03M)"
 * USDC: "$125,000"
 */
export function formatCurrencyWithUsd(
  amount: number | string,
  currency: string,
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return "—"

  if (currency === "USDC") {
    return `$${num.toLocaleString()}`
  }

  const usd = num * MOCK_ETH_PRICE_USD
  return `${num.toLocaleString()} ETH (~$${formatCompact(usd)})`
}

/**
 * Format a number compactly: "190.3M", "3.7K", "$1.03M"
 */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

/**
 * Truncate an Ethereum address: "0x1234...5678"
 */
export function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

/**
 * Convert a target block to a relative time string given the current block.
 * Positive = future, negative = past.
 */
export function blockToRelativeTime(
  targetBlock: number,
  currentBlock: number,
): string {
  const diff = targetBlock - currentBlock
  const absDiff = Math.abs(diff)
  const timeStr = blocksToTime(absDiff)

  if (diff > 0) return `${timeStr} remaining`
  if (diff < 0) return `${timeStr} ago`
  return "now"
}

/**
 * Get USD value for an ETH amount. Returns null for non-ETH currencies.
 */
export function getUsdValue(
  amount: number | string,
  currency: string,
): number | null {
  if (currency !== "ETH") return null
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return null
  return num * MOCK_ETH_PRICE_USD
}
