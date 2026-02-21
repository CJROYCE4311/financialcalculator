'use client'

import React, { useState, useEffect } from 'react'
import Decimal from 'decimal.js'
import { formatCurrencyInput, parseCurrency } from '@/lib/formatters/currency'
import { InputField } from './InputField'

interface CurrencyInputProps {
  label: string
  id: string
  value: Decimal
  onChange: (value: Decimal) => void
  min?: number
  max?: number
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
}

export function CurrencyInput({
  label,
  id,
  value,
  onChange,
  min = 0,
  max,
  error,
  helperText,
  required = false,
  disabled = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Update display value when prop value changes (but not while focused)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatCurrencyInput(value))
    }
  }, [value, isFocused])

  const handleChange = (inputValue: string) => {
    // Allow empty string
    if (inputValue === '') {
      setDisplayValue('')
      onChange(new Decimal(0))
      return
    }

    // Remove non-numeric characters except decimal point and minus
    const cleaned = inputValue.replace(/[^0-9.-]/g, '')

    setDisplayValue(cleaned)

    // Parse and validate
    const parsed = parseCurrency(cleaned)

    // Apply min/max constraints
    let finalValue = parsed
    if (parsed.lessThan(min)) {
      finalValue = new Decimal(min)
    }
    if (max !== undefined && parsed.greaterThan(max)) {
      finalValue = new Decimal(max)
    }

    onChange(finalValue)
  }

  const handleFocus = () => {
    setIsFocused(true)
    // Remove commas for easier editing
    setDisplayValue(value.toString())
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Format with commas
    setDisplayValue(formatCurrencyInput(value))
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
      prefix="$"
      placeholder="0"
    />
  )
}
