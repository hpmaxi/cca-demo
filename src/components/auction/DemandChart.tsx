import { Box, Text } from "@chakra-ui/react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface Props {
  data: { price: number; demand: number }[]
  currency: string
}

export function DemandChart({ data, currency }: Props) {
  if (data.length === 0) {
    return (
      <Box p="8" textAlign="center" color="fg.muted">
        <Text>No demand data yet</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" mb="1">
        Bids at Each Price
      </Text>
      <Text fontSize="xs" color="fg.muted" mb="3">
        Higher bars mean more bids at that price.
      </Text>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="price"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v.toFixed(4)}
          />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number | undefined) => [`${(value ?? 0).toLocaleString()} ${currency}`, "Total Bids"]}
            labelFormatter={(label: unknown) => `Price: ${label}`}
          />
          <Bar dataKey="demand" fill="#0d9488" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}
