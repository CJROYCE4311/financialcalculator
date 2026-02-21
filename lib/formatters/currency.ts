import Decimal from 'decimal.js'

/**
 * Format a number or Decimal as currency (USD)
 * @param value - Number or Decimal to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | Decimal | string,
  options: {
    showCents?: boolean
    showSymbol?: boolean
    compact?: boolean
  } = {}
): string {
  const { showCents = true, showSymbol = true, compact = false } = options

  let numValue: number
  if (value instanceof Decimal) {
    numValue = value.toNumber()
  } else if (typeof value === 'string') {
    numValue = parseFloat(value)
  } else if (typeof value === 'object' && value !== null) {
    // Handle deserialized Decimal objects from localStorage
    numValue = new Decimal(value).toNumber()
  } else {
    numValue = value
  }

  // Handle compact notation for large numbers
  if (compact && Math.abs(numValue) >= 1000) {
    return formatCompactCurrency(numValue, showSymbol)
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })

  const formatted = formatter.format(numValue)

  if (!showSymbol) {
    return formatted.replace('$', '').trim()
  }

  return formatted
}

/**
 * Format large numbers in compact notation (e.g., $1.5M, $250K)
 */
function formatCompactCurrency(value: number, showSymbol: boolean = true): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  let formatted: string
  if (absValue >= 1_000_000_000) {
    formatted = (absValue / 1_000_000_000).toFixed(1) + 'B'
  } else if (absValue >= 1_000_000) {
    formatted = (absValue / 1_000_000).toFixed(1) + 'M'
  } else if (absValue >= 1_000) {
    formatted = (absValue / 1_000).toFixed(1) + 'K'
  } else {
    formatted = absValue.toFixed(0)
  }

  const symbol = showSymbol ? '$' : ''
  return `${sign}${symbol}${formatted}`
}

/**
 * Parse currency string to Decimal
 * Removes currency symbols, commas, and handles negative values
 */
export function parseCurrency(value: string): Decimal {
  if (!value || value.trim() === '') {
    return new Decimal(0)
  }

  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '')

  try {
    return new Decimal(cleaned)
  } catch {
    return new Decimal(0)
  }
}

/**
 * Format currency for input fields (no symbol, with commas)
 */
export function formatCurrencyInput(value: number | Decimal | string): string {
  let numValue: number
  if (value instanceof Decimal) {
    numValue = value.toNumber()
  } else if (typeof value === 'string') {
    numValue = parseFloat(value) || 0
  } else if (typeof value === 'object' && value !== null) {
    // Handle deserialized Decimal objects from localStorage
    numValue = new Decimal(value).toNumber()
  } else {
    numValue = value
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numValue)
}
