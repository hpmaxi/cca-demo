import { Box } from "@chakra-ui/react"
import { Outlet } from "react-router"

export function LandingLayout() {
  return (
    <Box minH="100vh">
      <Outlet />
    </Box>
  )
}
