'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/formatters/currency'

interface StackedAreaChartProps {
  data: Array<{
    year: number
    age: number
    [key: string]: number
  }>
  dataKeys: Array<{
    key: string
    name: string
    color: string
  }>
  title?: string
  height?: number
}

export function StackedAreaChart({
  data,
  dataKeys,
  title,
  height = 400,
}: StackedAreaChartProps) {
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
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {dataKeys.map((dataKey) => (
              <linearGradient
                key={dataKey.key}
                id={`color-${dataKey.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={dataKey.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={dataKey.color} stopOpacity={0.3} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="age"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={formatYAxis}
            label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
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
          <Legend />
          {dataKeys.map((dataKey) => (
            <Area
              key={dataKey.key}
              type="monotone"
              dataKey={dataKey.key}
              name={dataKey.name}
              stackId="1"
              stroke={dataKey.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color-${dataKey.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
