import Decimal from 'decimal.js'

/**
 * Format a number or Decimal as percentage
 * @param value - Number or Decimal to format (as decimal, e.g., 0.05 for 5%)
 * @param options - Formatting options
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | Decimal | string,
  options: {
    decimals?: number
    showSymbol?: boolean
    isAlreadyPercent?: boolean // If true, value is already 5 not 0.05
  } = {}
): string {
  const { decimals = 2, showSymbol = true, isAlreadyPercent = false } = options

  let numValue: number
  if (value instanceof Decimal) {
    numValue = value.toNumber()
  } else if (typeof value === 'string') {
    numValue = parseFloat(value)
  } else {
    numValue = value
  }

  // Convert to percentage if needed
  const percentValue = isAlreadyPercent ? numValue : numValue * 100

  const formatted = percentValue.toFixed(decimals)
  return showSymbol ? `${formatted}%` : formatted
}

/**
 * Parse percentage string to Decimal (as decimal, not percent)
 * Example: "5%" -> Decimal(0.05)
 */
export function parsePercentage(value: string, asPercent: boolean = false): Decimal {
  if (!value || value.trim() === '') {
    return new Decimal(0)
  }

  // Remove percentage symbol and whitespace
  const cleaned = value.replace(/[%\s]/g, '')

  try {
    const decimal = new Decimal(cleaned)
    // If asPercent is true, return as-is (5), otherwise divide by 100 (0.05)
    return asPercent ? decimal : decimal.div(100)
  } catch {
    return new Decimal(0)
  }
}

/**
 * Format percentage for input fields (no symbol)
 */
export function formatPercentageInput(
  value: number | Decimal | string,
  decimals: number = 1
): string {
  let numValue: number
  if (value instanceof Decimal) {
    numValue = value.toNumber()
  } else if (typeof value === 'string') {
    numValue = parseFloat(value) || 0
  } else {
    numValue = value
  }

  return numValue.toFixed(decimals)
}
