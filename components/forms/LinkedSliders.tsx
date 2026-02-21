'use client'

import React, { useState, useEffect } from 'react'
import Decimal from 'decimal.js'

interface AssetAllocation {
  equities: Decimal
  bonds: Decimal
  cash: Decimal
}

interface LinkedSlidersProps {
  values: AssetAllocation
  onChange: (values: AssetAllocation) => void
  disabled?: boolean
}

type AssetType = 'equities' | 'bonds' | 'cash'

const assetConfig = {
  equities: {
    label: 'Equities (Stocks)',
    color: 'bg-blue-500',
    description: 'Higher risk, higher potential returns',
  },
  bonds: {
    label: 'Bonds (Fixed Income)',
    color: 'bg-green-500',
    description: 'Moderate risk, steady income',
  },
  cash: {
    label: 'Cash & Equivalents',
    color: 'bg-yellow-500',
    description: 'Low risk, low returns',
  },
}

export function LinkedSliders({ values, onChange, disabled = false }: LinkedSlidersProps) {
  const [activeSlider, setActiveSlider] = useState<AssetType | null>(null)

  // Validate that values sum to 100
  const total = values.equities.plus(values.bonds).plus(values.cash)
  const isValid = total.equals(100)

  const handleSliderChange = (assetType: AssetType, newValue: number) => {
    const newValueDecimal = new Decimal(newValue)

    let newEquities = values.equities
    let newBonds = values.bonds
    let newCash = values.cash

    if (assetType === 'equities') {
      // Stocks changed: remainder split between bonds/cash proportionally
      newEquities = newValueDecimal
      const remainder = new Decimal(100).minus(newEquities)

      const currentBondsCash = values.bonds.plus(values.cash)
      if (currentBondsCash.isZero()) {
        // Split evenly if both were 0
        newBonds = remainder.div(2)
        newCash = remainder.div(2)
      } else {
        // Maintain bonds/cash ratio
        const bondsRatio = values.bonds.div(currentBondsCash)
        newBonds = remainder.mul(bondsRatio)
        newCash = remainder.minus(newBonds)
      }
    }
    else if (assetType === 'bonds') {
      // Bonds changed: only affects cash (stocks fixed)
      newBonds = newValueDecimal
      newCash = new Decimal(100).minus(newEquities).minus(newBonds)

      // Prevent negative cash
      if (newCash.lessThan(0)) {
        newBonds = new Decimal(100).minus(newEquities)
        newCash = new Decimal(0)
      }
    }
    else if (assetType === 'cash') {
      // Cash changed: only affects bonds (stocks fixed)
      newCash = newValueDecimal
      newBonds = new Decimal(100).minus(newEquities).minus(newCash)

      // Prevent negative bonds
      if (newBonds.lessThan(0)) {
        newCash = new Decimal(100).minus(newEquities)
        newBonds = new Decimal(0)
      }
    }

    // Round to 1 decimal place
    newEquities = newEquities.toDecimalPlaces(1)
    newBonds = newBonds.toDecimalPlaces(1)
    newCash = newCash.toDecimalPlaces(1)

    // Adjust for rounding errors
    const total = newEquities.plus(newBonds).plus(newCash)
    if (!total.equals(100)) {
      const adjustment = new Decimal(100).minus(total)
      newCash = newCash.plus(adjustment)
    }

    onChange({
      equities: newEquities,
      bonds: newBonds,
      cash: newCash,
    })
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          Asset Allocation
        </h4>
        <p className="text-sm text-gray-600">
          Adjust sliders to set your portfolio mix. Total must equal 100%.
        </p>
      </div>

      {/* Visual allocation bar */}
      <div className="w-full h-8 flex rounded-lg overflow-hidden shadow-sm">
        <div
          className="bg-blue-500 transition-all duration-300 flex items-center justify-center text-white text-xs font-medium"
          style={{ width: `${values.equities.toNumber()}%` }}
        >
          {values.equities.toNumber() > 5 && `${values.equities.toFixed(0)}%`}
        </div>
        <div
          className="bg-green-500 transition-all duration-300 flex items-center justify-center text-white text-xs font-medium"
          style={{ width: `${values.bonds.toNumber()}%` }}
        >
          {values.bonds.toNumber() > 5 && `${values.bonds.toFixed(0)}%`}
        </div>
        <div
          className="bg-yellow-500 transition-all duration-300 flex items-center justify-center text-white text-xs font-medium"
          style={{ width: `${values.cash.toNumber()}%` }}
        >
          {values.cash.toNumber() > 5 && `${values.cash.toFixed(0)}%`}
        </div>
      </div>

      {/* Individual sliders */}
      <div className="space-y-4">
        {(Object.keys(assetConfig) as AssetType[]).map((assetType) => {
          const config = assetConfig[assetType]
          const value = values[assetType].toNumber()

          return (
            <div key={assetType} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label
                    htmlFor={`slider-${assetType}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {config.label}
                  </label>
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-primary">
                    {value.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="relative">
                <input
                  id={`slider-${assetType}`}
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={value}
                  onChange={(e) => handleSliderChange(assetType, parseFloat(e.target.value))}
                  onMouseDown={() => setActiveSlider(assetType)}
                  onMouseUp={() => setActiveSlider(null)}
                  onTouchStart={() => setActiveSlider(assetType)}
                  onTouchEnd={() => setActiveSlider(null)}
                  disabled={disabled}
                  className={`
                    w-full h-2 rounded-lg appearance-none cursor-pointer
                    bg-gray-200
                    focus:outline-none focus:ring-2 focus:ring-accent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    slider-${assetType}
                  `}
                  style={{
                    background: `linear-gradient(to right, ${getSliderColor(assetType)} 0%, ${getSliderColor(assetType)} ${value}%, #E5E7EB ${value}%, #E5E7EB 100%)`,
                  }}
                  aria-label={`${config.label} percentage`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={value}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Total validation */}
      <div className={`
        flex items-center justify-between p-3 rounded-lg border-2
        ${isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}
      `}>
        <span className="text-sm font-medium">
          Total Allocation:
        </span>
        <span className={`text-lg font-bold ${isValid ? 'text-green-700' : 'text-red-700'}`}>
          {total.toFixed(1)}%
        </span>
      </div>

      {!isValid && (
        <p className="text-sm text-red-600">
          Total allocation must equal 100%. Current total: {total.toFixed(1)}%
        </p>
      )}

      {/* Quick preset buttons */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Quick Presets:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <PresetButton
            label="Conservative"
            onClick={() => onChange({
              equities: new Decimal(30),
              bonds: new Decimal(60),
              cash: new Decimal(10),
            })}
            disabled={disabled}
          />
          <PresetButton
            label="Moderate"
            onClick={() => onChange({
              equities: new Decimal(60),
              bonds: new Decimal(30),
              cash: new Decimal(10),
            })}
            disabled={disabled}
          />
          <PresetButton
            label="Aggressive"
            onClick={() => onChange({
              equities: new Decimal(80),
              bonds: new Decimal(15),
              cash: new Decimal(5),
            })}
            disabled={disabled}
          />
          <PresetButton
            label="Very Aggressive"
            onClick={() => onChange({
              equities: new Decimal(95),
              bonds: new Decimal(5),
              cash: new Decimal(0),
            })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}

function getSliderColor(assetType: AssetType): string {
  const colors = {
    equities: '#3B82F6', // blue-500
    bonds: '#10B981', // green-500
    cash: '#EAB308', // yellow-500
  }
  return colors[assetType]
}

interface PresetButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

function PresetButton({ label, onClick, disabled }: PresetButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-2 text-xs font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  )
}
