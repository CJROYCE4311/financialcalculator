'use client'

import React, { useState, useEffect } from 'react'
import Decimal from 'decimal.js'
import { formatPercentageInput } from '@/lib/formatters/percentage'
import { InputField } from './InputField'

interface PercentageInputProps {
  label: string
  id: string
  value: Decimal // Expected as percentage (e.g., 5 for 5%)
  onChange: (value: Decimal) => void
  min?: number
  max?: number
  step?: number
  decimals?: number
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
}

export function PercentageInput({
  label,
  id,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.1,
  decimals = 1,
  error,
  helperText,
  required = false,
  disabled = false,
}: PercentageInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Update display value when prop value changes (but not while focused)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatPercentageInput(value, decimals))
    }
  }, [value, isFocused, decimals])

  const handleChange = (inputValue: string) => {
    // Allow empty string
    if (inputValue === '') {
      setDisplayValue('')
      onChange(new Decimal(0))
      return
    }

    // Remove non-numeric characters except decimal point
    const cleaned = inputValue.replace(/[^0-9.]/g, '')

    setDisplayValue(cleaned)

    // Parse and validate
    try {
      const parsed = new Decimal(cleaned)

      // Apply min/max constraints
      let finalValue = parsed
      if (parsed.lessThan(min)) {
        finalValue = new Decimal(min)
      }
      if (parsed.greaterThan(max)) {
        finalValue = new Decimal(max)
      }

      onChange(finalValue)
    } catch {
      // Invalid number, keep display but don't update value
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Format to specified decimals
    setDisplayValue(formatPercentageInput(value, decimals))
  }

  return (
    <InputField
      label={label}
      id={id}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      suffix="%"
      placeholder="0"
    />
  )
}
