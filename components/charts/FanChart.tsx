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
import type { FanChartData } from '@/types/calculator.types'

interface FanChartProps {
  data: FanChartData[]
  title?: string
  height?: number
  showLegend?: boolean
}

/**
 * Fan Chart component for Monte Carlo simulation results
 * Shows 5th-95th percentile ranges as stacked areas
 */
export function FanChart({ data, title, height = 400, showLegend = true }: FanChartProps) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) {
      return null
    }

    const year = payload[0]?.payload?.year
    const p5 = payload.find((p: any) => p.dataKey === 'p5')?.value
    const p25 = payload.find((p: any) => p.dataKey === 'p25')?.value
    const p50 = payload.find((p: any) => p.dataKey === 'p50')?.value
    const p75 = payload.find((p: any) => p.dataKey === 'p75')?.value
    const p95 = payload.find((p: any) => p.dataKey === 'p95')?.value

    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4">
        <p className="font-semibold text-gray-900 mb-2">Year {year}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">95th percentile:</span>
            <span className="font-semibold text-green-700">
              ${(p95 || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">75th percentile:</span>
            <span className="font-semibold text-blue-700">
              ${(p75 || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Median (50th):</span>
            <span className="font-semibold text-gray-700">
              ${(p50 || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">25th percentile:</span>
            <span className="font-semibold text-orange-700">
              ${(p25 || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">5th percentile:</span>
            <span className="font-semibold text-red-700">
              ${(p5 || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {/* Gradient for 5th percentile area (worst case) */}
            <linearGradient id="colorP5" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
            </linearGradient>

            {/* Gradient for 25th percentile area */}
            <linearGradient id="colorP25" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
            </linearGradient>

            {/* Gradient for median area */}
            <linearGradient id="colorP50" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6B7280" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6B7280" stopOpacity={0.1} />
            </linearGradient>

            {/* Gradient for 75th percentile area */}
            <linearGradient id="colorP75" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
            </linearGradient>

            {/* Gradient for 95th percentile area (best case) */}
            <linearGradient id="colorP95" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="year"
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Year in Retirement', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            label={{ value: 'Portfolio Balance', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="top"
              height={36}
              iconType="rect"
              formatter={(value) => {
                const labels: { [key: string]: string } = {
                  p95: '95th percentile (optimistic)',
                  p75: '75th percentile',
                  p50: 'Median (50th)',
                  p25: '25th percentile',
                  p5: '5th percentile (pessimistic)',
                }
                return labels[value] || value
              }}
            />
          )}

          {/* Areas stacked from bottom to top */}
          <Area
            type="monotone"
            dataKey="p95"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#colorP95)"
            fillOpacity={1}
            name="p95"
          />
          <Area
            type="monotone"
            dataKey="p75"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#colorP75)"
            fillOpacity={1}
            name="p75"
          />
          <Area
            type="monotone"
            dataKey="p50"
            stroke="#6B7280"
            strokeWidth={2}
            fill="url(#colorP50)"
            fillOpacity={1}
            name="p50"
          />
          <Area
            type="monotone"
            dataKey="p25"
            stroke="#F59E0B"
            strokeWidth={2}
            fill="url(#colorP25)"
            fillOpacity={1}
            name="p25"
          />
          <Area
            type="monotone"
            dataKey="p5"
            stroke="#EF4444"
            strokeWidth={2}
            fill="url(#colorP5)"
            fillOpacity={1}
            name="p5"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Interpretation guide */}
      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <p>
          <strong>How to read this chart:</strong> The fan shows the range of possible outcomes
          across 1 million simulations.
        </p>
        <p>
          • <strong className="text-green-700">95th percentile:</strong> Only 5% of scenarios do
          better than this (optimistic case)
        </p>
        <p>
          • <strong className="text-gray-700">Median (50th):</strong> Half of scenarios are above,
          half below (typical case)
        </p>
        <p>
          • <strong className="text-red-700">5th percentile:</strong> 95% of scenarios do better
          than this (pessimistic case)
        </p>
        <p className="mt-2">
          A successful plan should keep the 5th percentile line above zero throughout retirement.
        </p>
      </div>
    </div>
  )
}
