import { useState, useEffect, useCallback } from "react"
import { useReadContract, useWriteContract, usePublicClient, useBlockNumber, useAccount } from "wagmi"
import { type Address, parseEther, zeroAddress } from "viem"
import { ccaAbi } from "../abi/cca"
import { erc20Abi } from "../abi/erc20"
import { q96ToPrice, priceToQ96 } from "../lib/q96"

// ── Types ──────────────────────────────────────────────────

export interface CCABid {
  id: bigint
  owner: Address
  price: bigint      // Q96
  amount: bigint     // wei
  priceHuman: number // human-readable
  amountHuman: number
}

export interface CCACheckpoint {
  blockNumber: bigint
  clearingPrice: bigint   // Q96
  clearingPriceHuman: number
  cumulativeMps: number
}

export interface CCAAuctionState {
  address: Address
  clearingPrice: bigint
  clearingPriceHuman: number
  currency: Address
  tokenAddress: Address
  tokenName: string
  tokenSymbol: string
  tokenDecimals: number
  startBlock: bigint
  endBlock: bigint
  claimBlock: bigint
  currencyRaised: bigint
  totalCleared: bigint
  totalSupply: bigint
  isGraduated: boolean
  isLive: boolean
  isUpcoming: boolean
  isEnded: boolean
  currentBlock: bigint
}

// ── Read Auction State ─────────────────────────────────────

export function useCCAAuction(auctionAddress: Address | undefined) {
  const enabled = !!auctionAddress && auctionAddress !== zeroAddress

  const { data: currentBlock } = useBlockNumber({ watch: true })

  const { data: clearingPrice } = useReadContract({
    address: auctionAddress,
    abi: ccaAbi,
    functionName: "clearingPrice",
    query: { enabled, refetchInterval: 12_000 },
  })

  const { data: currency } = useReadContract({
    address: auctionAddress,
    abi: ccaAbi,
    functionName: "currency",
    query: { enabled },
  })

  const { data: tokenAddress } = useReadContract({
    address: auctionAddress,
    abi: ccaAbi,
    functionName: "token",
    query: { enabled },
  })

  const { data: startBlock } = useReadContract({
    address: auctionAddress,
    abi: ccaAbi,
    functionName: "startBlock",
    query: { enabled },
  })

  const { data: endBlock } = useReadContract({
    address: auctionAddress,
    abi: ccaAbi,
    functionName: "endBlock",
    query: { enabled },
  })

  const { data: claimBlock } = useReadContract({
    address: auctionAddress,
    abi: ccaAbi,
    functionName: "claimBlock",
    query: { enabled },
  })

  const { data: currencyRaised } = useReadContract({
    address: auctionAddress,
    abi: ccaAbi,
    functionName: "currencyRaised",
    query: { enabled, refetchInterval: 12_000 },
  })

  const { data: totalCleared } = useReadContract({
    address: auctionAddress,
    abi: ccaAbi,
    functionName: "totalCleared",
    query: { enabled, refetchInterval: 12_000 },
  })

  const { data: totalSupply } = useReadContract({
    address: auctionAddress,
    abi: ccaAbi,
    functionName: "totalSupply",
    query: { enabled },
  })

  const { data: isGraduated } = useReadContract({
    address: auctionAddress,
    abi: ccaAbi,
    functionName: "isGraduated",
    query: { enabled, refetchInterval: 12_000 },
  })

  // Token metadata
  const { data: tokenName } = useReadContract({
    address: tokenAddress as Address | undefined,
    abi: erc20Abi,
    functionName: "name",
    query: { enabled: !!tokenAddress && tokenAddress !== zeroAddress },
  })

  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress as Address | undefined,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled: !!tokenAddress && tokenAddress !== zeroAddress },
  })

  const { data: tokenDecimals } = useReadContract({
    address: tokenAddress as Address | undefined,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: !!tokenAddress && tokenAddress !== zeroAddress },
  })

  const start = startBlock ?? 0n
  const end = endBlock ?? 0n
  const block = currentBlock ?? 0n

  const state: CCAAuctionState | null =
    enabled && clearingPrice !== undefined && startBlock !== undefined
      ? {
          address: auctionAddress!,
          clearingPrice: clearingPrice ?? 0n,
          clearingPriceHuman: q96ToPrice(clearingPrice ?? 0n),
          currency: currency ?? zeroAddress,
          tokenAddress: (tokenAddress as Address) ?? zeroAddress,
          tokenName: (tokenName as string) ?? "Unknown",
          tokenSymbol: (tokenSymbol as string) ?? "???",
          tokenDecimals: (tokenDecimals as number) ?? 18,
          startBlock: start,
          endBlock: end,
          claimBlock: claimBlock ?? 0n,
          currencyRaised: currencyRaised ?? 0n,
          totalCleared: totalCleared ?? 0n,
          totalSupply: totalSupply ?? 0n,
          isGraduated: isGraduated ?? false,
          isLive: block >= start && block < end,
          isUpcoming: block < start,
          isEnded: block >= end,
          currentBlock: block,
        }
      : null

  return { auction: state, isLoading: enabled && !state, currentBlock: block }
}

// ── Read Bids from Events ──────────────────────────────────

export function useCCABids(auctionAddress: Address | undefined, fromBlock?: bigint) {
  const client = usePublicClient()
  const [bids, setBids] = useState<CCABid[]>([])
  const [exitedBidIds, setExitedBidIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const fetchBids = useCallback(async () => {
    if (!client || !auctionAddress || auctionAddress === zeroAddress) return
    setLoading(true)
    try {
      const start = fromBlock ?? 0n
      const bidLogs = await client.getContractEvents({
        address: auctionAddress,
        abi: ccaAbi,
        eventName: "BidSubmitted",
        fromBlock: start,
      })
      const exitLogs = await client.getContractEvents({
        address: auctionAddress,
        abi: ccaAbi,
        eventName: "BidExited",
        fromBlock: start,
      })
      const exited = new Set(exitLogs.map((l) => (l.args as { bidId: bigint }).bidId.toString()))
      setExitedBidIds(exited)

      const parsed: CCABid[] = bidLogs.map((log) => {
        const args = log.args as { id: bigint; owner: Address; price: bigint; amount: bigint }
        return {
          id: args.id,
          owner: args.owner,
          price: args.price,
          amount: args.amount,
          priceHuman: q96ToPrice(args.price),
          amountHuman: Number(args.amount) / 1e18,
        }
      })
      setBids(parsed)
    } catch (e) {
      console.error("Failed to fetch bids:", e)
    } finally {
      setLoading(false)
    }
  }, [client, auctionAddress, fromBlock])

  useEffect(() => {
    fetchBids()
  }, [fetchBids])

  // Filter out exited bids
  const activeBids = bids.filter((b) => !exitedBidIds.has(b.id.toString()))

  return { bids, activeBids, exitedBidIds, loading, refetch: fetchBids }
}

// ── Read Checkpoints from Events ───────────────────────────

export function useCCACheckpoints(auctionAddress: Address | undefined, fromBlock?: bigint) {
  const client = usePublicClient()
  const [checkpoints, setCheckpoints] = useState<CCACheckpoint[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCheckpoints = useCallback(async () => {
    if (!client || !auctionAddress || auctionAddress === zeroAddress) return
    setLoading(true)
    try {
      const logs = await client.getContractEvents({
        address: auctionAddress,
        abi: ccaAbi,
        eventName: "CheckpointUpdated",
        fromBlock: fromBlock ?? 0n,
      })
      const parsed: CCACheckpoint[] = logs.map((log) => {
        const args = log.args as { blockNumber: bigint; clearingPrice: bigint; cumulativeMps: number }
        return {
          blockNumber: args.blockNumber,
          clearingPrice: args.clearingPrice,
          clearingPriceHuman: q96ToPrice(args.clearingPrice),
          cumulativeMps: Number(args.cumulativeMps),
        }
      })
      setCheckpoints(parsed.sort((a, b) => Number(b.blockNumber - a.blockNumber)))
    } catch (e) {
      console.error("Failed to fetch checkpoints:", e)
    } finally {
      setLoading(false)
    }
  }, [client, auctionAddress, fromBlock])

  useEffect(() => {
    fetchCheckpoints()
  }, [fetchCheckpoints])

  return { checkpoints, loading, refetch: fetchCheckpoints }
}

// ── Submit Bid ─────────────────────────────────────────────

export function useSubmitBid(auctionAddress: Address | undefined) {
  const { address: userAddress } = useAccount()
  const { writeContractAsync, isPending } = useWriteContract()

  const submitBid = useCallback(
    async (maxPriceHuman: number, amountEth: string) => {
      if (!auctionAddress || !userAddress) throw new Error("Not connected")

      const maxPriceQ96 = priceToQ96(maxPriceHuman)
      const amountWei = parseEther(amountEth)

      const hash = await writeContractAsync({
        address: auctionAddress,
        abi: ccaAbi,
        functionName: "submitBid",
        args: [maxPriceQ96, amountWei, userAddress, "0x"],
        value: amountWei, // ETH auction — send value
      })

      return hash
    },
    [auctionAddress, userAddress, writeContractAsync],
  )

  return { submitBid, isPending }
}

// ── Exit Bid ───────────────────────────────────────────────

export function useExitBid(auctionAddress: Address | undefined) {
  const { writeContractAsync, isPending } = useWriteContract()

  const exitBid = useCallback(
    async (bidId: bigint) => {
      if (!auctionAddress) throw new Error("No auction")
      return writeContractAsync({
        address: auctionAddress,
        abi: ccaAbi,
        functionName: "exitBid",
        args: [bidId],
      })
    },
    [auctionAddress, writeContractAsync],
  )

  return { exitBid, isPending }
}

// ── Claim Tokens ───────────────────────────────────────────

export function useClaimTokens(auctionAddress: Address | undefined) {
  const { writeContractAsync, isPending } = useWriteContract()

  const claimTokens = useCallback(
    async (bidId: bigint) => {
      if (!auctionAddress) throw new Error("No auction")
      return writeContractAsync({
        address: auctionAddress,
        abi: ccaAbi,
        functionName: "claimTokens",
        args: [bidId],
      })
    },
    [auctionAddress, writeContractAsync],
  )

  return { claimTokens, isPending }
}
