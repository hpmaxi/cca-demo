import { useState, useEffect, useCallback } from "react"
import { usePublicClient } from "wagmi"
import { type Address } from "viem"
import { ccaFactoryAbi, CCA_FACTORY_ADDRESS } from "../abi/ccaFactory"
import { ccaAbi } from "../abi/cca"
import { erc20Abi } from "../abi/erc20"
import { q96ToPrice } from "../lib/q96"

export interface AuctionListItem {
  address: Address
  tokenAddress: Address
  tokenName: string
  tokenSymbol: string
  clearingPrice: number
  startBlock: bigint
  endBlock: bigint
  isLive: boolean
  isUpcoming: boolean
  isEnded: boolean
  currencyRaised: bigint
}

export function useAuctionList() {
  const client = usePublicClient()
  const [auctions, setAuctions] = useState<AuctionListItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAuctions = useCallback(async () => {
    if (!client) return
    setLoading(true)
    try {
      const logs = await client.getContractEvents({
        address: CCA_FACTORY_ADDRESS,
        abi: ccaFactoryAbi,
        eventName: "AuctionCreated",
        fromBlock: 0n,
      })

      const currentBlock = await client.getBlockNumber()

      const items: AuctionListItem[] = await Promise.all(
        logs.map(async (log) => {
          const args = log.args as { auction: Address; token: Address }
          const auctionAddr = args.auction
          const tokenAddr = args.token

          // Read auction state (batch)
          const [clearingPriceResult, startBlockResult, endBlockResult, currencyRaisedResult] =
            await Promise.all([
              client.readContract({ address: auctionAddr, abi: ccaAbi, functionName: "clearingPrice" }).catch(() => 0n),
              client.readContract({ address: auctionAddr, abi: ccaAbi, functionName: "startBlock" }).catch(() => 0n),
              client.readContract({ address: auctionAddr, abi: ccaAbi, functionName: "endBlock" }).catch(() => 0n),
              client.readContract({ address: auctionAddr, abi: ccaAbi, functionName: "currencyRaised" }).catch(() => 0n),
            ])

          // Read token metadata
          const [tokenName, tokenSymbol] = await Promise.all([
            client.readContract({ address: tokenAddr, abi: erc20Abi, functionName: "name" }).catch(() => "Unknown"),
            client.readContract({ address: tokenAddr, abi: erc20Abi, functionName: "symbol" }).catch(() => "???"),
          ])

          const start = startBlockResult as bigint
          const end = endBlockResult as bigint

          return {
            address: auctionAddr,
            tokenAddress: tokenAddr,
            tokenName: tokenName as string,
            tokenSymbol: tokenSymbol as string,
            clearingPrice: q96ToPrice(clearingPriceResult as bigint),
            startBlock: start,
            endBlock: end,
            isLive: currentBlock >= start && currentBlock < end,
            isUpcoming: currentBlock < start,
            isEnded: currentBlock >= end,
            currencyRaised: currencyRaisedResult as bigint,
          }
        }),
      )

      setAuctions(items)
    } catch (e) {
      console.error("Failed to fetch auctions:", e)
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    fetchAuctions()
  }, [fetchAuctions])

  return { auctions, loading, refetch: fetchAuctions }
}
