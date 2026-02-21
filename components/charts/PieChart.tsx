'use client'

import React from 'react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { PieChartData } from '@/types/calculator.types'

interface PieChartProps {
  data: PieChartData[]
  title?: string
  height?: number
}

export function PieChart({ data, title, height = 300 }: PieChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `${value.toFixed(1)}%`}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
