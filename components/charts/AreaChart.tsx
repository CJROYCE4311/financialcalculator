'use client'

import React from 'react'
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/formatters/currency'
import type { AreaChartData } from '@/types/calculator.types'

interface AreaChartProps {
  data: AreaChartData[]
  title?: string
  height?: number
  dataKey?: string
  xAxisKey?: string
  color?: string
}

export function AreaChart({
  data,
  title,
  height = 400,
  dataKey = 'balance',
  xAxisKey = 'age',
  color = '#15c18f',
}: AreaChartProps) {
  const formatYAxis = (value: number) => {
    return formatCurrency(value, { compact: true, showCents: false })
  }

  const formatTooltip = (value: number) => {
    return formatCurrency(value, { showCents: false })
  }

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={xAxisKey}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={formatYAxis}
            label={{ value: 'Balance', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={formatTooltip}
            labelFormatter={(label) => `Age: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '10px',
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBalance)"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
