'use client'

import React from 'react'

interface SuccessGaugeProps {
  successRate: number // 0-100
  size?: number
  showLabel?: boolean
}

/**
 * Circular gauge showing Monte Carlo success rate
 * Color-coded: Red (<50%), Yellow (50-75%), Green (>75%)
 */
export function SuccessGauge({ successRate, size = 200, showLabel = true }: SuccessGaugeProps) {
  // Clamp success rate between 0 and 100
  const rate = Math.max(0, Math.min(100, successRate))

  // Calculate SVG path for the arc
  const radius = 80
  const strokeWidth = 16
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (rate / 100) * circumference

  // Determine color based on success rate
  const getColor = (rate: number) => {
    if (rate >= 90) return '#10B981' // Green - Excellent
    if (rate >= 75) return '#3B82F6' // Blue - Good
    if (rate >= 50) return '#F59E0B' // Orange - Fair
    return '#EF4444' // Red - Poor
  }

  // Determine interpretation
  const getInterpretation = (rate: number) => {
    if (rate >= 90) return { label: 'Excellent', description: 'Highly robust plan' }
    if (rate >= 75) return { label: 'Good', description: 'Generally acceptable' }
    if (rate >= 50) return { label: 'Fair', description: 'Moderate risk' }
    return { label: 'At Risk', description: 'Plan needs improvement' }
  }

  const color = getColor(rate)
  const interpretation = getInterpretation(rate)

  return (
    <div className="flex flex-col items-center">
      {showLabel && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Success Rate</h3>
      )}

      {/* SVG Circular Gauge */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />

          {/* Progress arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color }}>
              {rate.toFixed(1)}%
            </div>
            <div className="text-sm font-semibold text-gray-700 mt-1">
              {interpretation.label}
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      {showLabel && (
        <div className="mt-4 text-center max-w-xs">
          <p className="text-sm text-gray-600 mb-3">{interpretation.description}</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              In <strong className="font-semibold">{rate.toFixed(1)}%</strong> of 1 million
              simulated scenarios, your portfolio successfully funded your entire retirement
              without running out of money.
            </p>
          </div>
        </div>
      )}

      {/* Color legend */}
      {showLabel && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">90%+ Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">75-89% Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-600">50-74% Fair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">&lt;50% At Risk</span>
          </div>
        </div>
      )}
    </div>
  )
}
