import { Box, Flex } from "@chakra-ui/react"
import { Outlet } from "react-router"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

export function Layout() {
  return (
    <Box minH="100vh" bg="bg">
      <Sidebar />
      <Flex direction="column" minH="100vh" pl="64">
        <Topbar />
        <Box
          as="main"
          flex="1"
          p={{ base: "4", md: "8" }}
          maxW="7xl"
          mx="auto"
          w="full"
          css={{
            animation: "fadeIn 0.5s ease-out",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "translateY(8px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <Outlet />
        </Box>
      </Flex>
    </Box>
  )
}
