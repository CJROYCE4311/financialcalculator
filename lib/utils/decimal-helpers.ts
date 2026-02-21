import Decimal from 'decimal.js'

/**
 * Utility functions to ensure Decimal objects are properly handled
 */

/**
 * Ensure a value is a Decimal object
 * Converts numbers/strings to Decimal if needed
 */
export function ensureDecimal(value: any): Decimal {
  if (value instanceof Decimal) {
    return value
  }
  if (typeof value === 'number' || typeof value === 'string') {
    return new Decimal(value)
  }
  if (value && typeof value === 'object' && value.__decimal) {
    return new Decimal(value.__decimal)
  }
  return new Decimal(0)
}

/**
 * Safely call toNumber on a value that might or might not be a Decimal
 */
export function toNumber(value: any): number {
  if (value instanceof Decimal) {
    return value.toNumber()
  }
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string') {
    return parseFloat(value) || 0
  }
  return 0
}

/**
 * Recursively ensure all Decimal-like objects in a structure are proper Decimals
 */
export function hydrateDecimals<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (obj instanceof Decimal) {
    return obj
  }

  // Check if it's a serialized Decimal
  if (typeof obj === 'object' && '__decimal' in obj) {
    return new Decimal((obj as any).__decimal) as any
  }

  if (Array.isArray(obj)) {
    return obj.map(hydrateDecimals) as any
  }

  if (typeof obj === 'object') {
    const result: any = {}
    for (const key in obj) {
      result[key] = hydrateDecimals(obj[key])
    }
    return result
  }

  return obj
}

/**
 * Mutate an object in place to convert all Decimal-like objects to proper Decimals
 * This is useful for Zustand rehydration where we need to mutate the state object
 */
export function hydrateDecimalsInPlace(obj: any): void {
  if (!obj || typeof obj !== 'object') {
    return
  }

  for (const key in obj) {
    const value = obj[key]

    if (value === null || value === undefined) {
      continue
    }

    // Check if it's a serialized Decimal
    if (typeof value === 'object' && '__decimal' in value) {
      obj[key] = new Decimal(value.__decimal)
    }
    // Recursively process nested objects and arrays
    else if (typeof value === 'object') {
      hydrateDecimalsInPlace(value)
    }
  }
}
