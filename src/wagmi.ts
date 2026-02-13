import { http, createConfig } from "wagmi"
import { mainnet, sepolia, base } from "wagmi/chains"
import { injected } from "wagmi/connectors"
import { defineChain } from "viem"

export const anvilFork = defineChain({
  id: 31337,
  name: "Anvil Fork",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
})

export const config = createConfig({
  chains: [anvilFork, sepolia, mainnet, base],
  connectors: [injected()],
  transports: {
    [anvilFork.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}
