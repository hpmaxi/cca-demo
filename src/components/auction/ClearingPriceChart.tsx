import { Box, Text } from "@chakra-ui/react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"

interface Props {
  data: { block: number; price: number }[]
  currency: string
  floorPrice?: number
}

export function ClearingPriceChart({ data, currency, floorPrice }: Props) {
  if (data.length === 0) {
    return (
      <Box p="8" textAlign="center" color="fg.muted">
        <Text>No price data yet</Text>
      </Box>
    )
  }

  return (
    <Box>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="block"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `Blk ${(v / 1e6).toFixed(1)}M`}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v.toFixed(4)}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(6)} ${currency}`, "Price"]}
            labelFormatter={(label: unknown) => `Block ${Number(label).toLocaleString()}`}
          />
          {floorPrice != null && (
            <ReferenceLine
              y={floorPrice}
              stroke="#ef4444"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: "Min Price", position: "right", fontSize: 11, fill: "#ef4444" }}
            />
          )}
          <Area
            type="monotone"
            dataKey="price"
            stroke="#0d9488"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}
