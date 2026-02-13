import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { RouterProvider } from "react-router"
import { Provider } from "./components/ui/provider"
import { Toaster } from "./components/ui/toaster"
import { router } from "./router"
import { config } from "./wagmi"

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Provider>
          <RouterProvider router={router} />
          <Toaster />
        </Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
