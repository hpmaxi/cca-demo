/**
 * Q96 fixed-point math utilities for CCA price encoding.
 *
 * CCA uses Q96 format: price_q96 = human_price * 2^96
 * where human_price = currency_amount / token_amount (in base units).
 *
 * For ETH (18 decimals) as currency and a token with 18 decimals:
 *   human_price of 0.005 means 0.005 ETH per 1 token
 *   q96 = 0.005 * 2^96
 */

const Q96 = 2n ** 96n
const SCALE = 10n ** 18n

/**
 * Convert a human-readable price (e.g. 0.005) to Q96 bigint.
 * Assumes both currency and token have 18 decimals.
 */
export function priceToQ96(price: number): bigint {
  const scaled = BigInt(Math.round(price * 1e18))
  return (scaled * Q96) / SCALE
}

/**
 * Convert a Q96 bigint to a human-readable price number.
 * Assumes both currency and token have 18 decimals.
 */
export function q96ToPrice(q96: bigint): number {
  if (q96 === 0n) return 0
  const scaled = (q96 * SCALE) / Q96
  return Number(scaled) / 1e18
}

/**
 * Convert a Q96 bigint to a display string with specified decimal places.
 */
export function q96ToPriceString(q96: bigint, decimals: number = 6): string {
  return q96ToPrice(q96).toFixed(decimals)
}

/**
 * Format a Q96 price for compact display.
 */
export function formatQ96Price(q96: bigint): string {
  const price = q96ToPrice(q96)
  if (price === 0) return "0"
  if (price < 0.000001) return price.toExponential(2)
  if (price < 0.01) return price.toFixed(6)
  if (price < 1) return price.toFixed(4)
  if (price < 1000) return price.toFixed(2)
  return price.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

/**
 * Format a wei amount (bigint) to a human-readable ETH string.
 */
export function formatWei(wei: bigint, decimals: number = 18): string {
  const num = Number(wei) / 10 ** decimals
  if (num === 0) return "0"
  if (num < 0.001) return num.toExponential(2)
  if (num < 1) return num.toFixed(4)
  if (num < 1000) return num.toFixed(2)
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

/**
 * Parse an ETH amount string to wei bigint.
 */
export function parseEthToWei(eth: string): bigint {
  const num = parseFloat(eth)
  if (isNaN(num) || num <= 0) return 0n
  return BigInt(Math.round(num * 1e18))
}
