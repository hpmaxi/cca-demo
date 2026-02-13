import { createBrowserRouter } from "react-router"
import { Layout } from "./components/layout/Layout"
import { LandingLayout } from "./components/layout/LandingLayout"
import { DashboardPage } from "./pages/DashboardPage"
import { CreateAuctionPage } from "./pages/CreateAuctionPage"
import { AuctionsPage } from "./pages/AuctionsPage"
import { AuctionDetailPage } from "./pages/AuctionDetailPage"
import { MyBidsPage } from "./pages/MyBidsPage"
import { LandingPage } from "./pages/LandingPage"

const base = import.meta.env.BASE_URL.replace(/\/$/, "")

export const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [
      { path: "/landing", element: <LandingPage /> },
    ],
  },
  {
    element: <Layout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/create", element: <CreateAuctionPage /> },
      { path: "/auctions", element: <AuctionsPage /> },
      { path: "/auction/:id", element: <AuctionDetailPage /> },
      { path: "/bids", element: <MyBidsPage /> },
    ],
  },
], { basename: base || undefined })
