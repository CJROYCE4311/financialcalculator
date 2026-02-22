import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Decimal from 'decimal.js'
import type { CalculatorStore } from '@/types/calculator.types'
import { hydrateDecimals } from '@/lib/utils/decimal-helpers'
import { createInvestmentSlice } from './slices/investment-slice'
import { createWithdrawalSlice } from './slices/withdrawal-slice'
import { createSocialSecuritySlice } from './slices/social-security-slice'
import { createPensionSlice } from './slices/pension-slice'
import { createBudgetSlice } from './slices/budget-slice'
import { createMonteCarloSlice } from './slices/monte-carlo-slice'
import { createNarrativeSlice } from './slices/narrative-slice'
// Initialize and validate localStorage before creating store
import '@/lib/utils/storage-init'

/**
 * Custom serializer/deserializer for Decimal.js values in LocalStorage
 * Converts Decimal objects to/from JSON-serializable strings
 */
const decimalStorage = {
  getItem: (name: string): string | null => {
    const str = localStorage.getItem(name)
    if (!str) return null
    return str
  },
  setItem: (name: string, value: string): void => {
    localStorage.setItem(name, value)
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name)
  },
}

/**
 * Recursively convert Decimal objects to strings for JSON serialization
 */
function serializeDecimals(obj: any): any {
  if (obj instanceof Decimal) {
    return { __decimal: obj.toString() }
  }
  if (obj instanceof Date) {
    return { __date: obj.toISOString() }
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeDecimals)
  }
  if (obj !== null && typeof obj === 'object') {
    const result: any = {}
    for (const key in obj) {
      result[key] = serializeDecimals(obj[key])
    }
    return result
  }
  return obj
}

/**
 * Recursively convert serialized decimal strings back to Decimal objects
 * Also handles legacy formats (plain strings/numbers) for backward compatibility
 */
function deserializeDecimals(obj: any): any {
  if (obj && typeof obj === 'object') {
    if (obj.__decimal) {
      return new Decimal(obj.__decimal)
    }
    if (obj.__date) {
      return new Date(obj.__date)
    }
    if (Array.isArray(obj)) {
      return obj.map(deserializeDecimals)
    }
    const result: any = {}
    for (const key in obj) {
      result[key] = deserializeDecimals(obj[key])
    }
    return result
  }
  return obj
}

/**
 * Check if data is in old format (plain strings/numbers instead of {__decimal: "123"})
 */
function isOldFormat(state: any): boolean {
  try {
    // Check if investment inputs have Decimal values
    const balance = state?.state?.investmentProjection?.inputs?.currentBalance
    if (balance !== undefined && balance !== null) {
      // Old format: plain string or number
      // New format: {__decimal: "123"} or Decimal object
      if (typeof balance === 'string' || typeof balance === 'number') {
        return true
      }
      if (!(balance instanceof Decimal) && !balance.__decimal) {
        return true
      }
    }
    return false
  } catch {
    return false
  }
}

/**
 * Custom storage that handles Decimal serialization properly
 * This implements the storage interface directly without using createJSONStorage
 * to avoid the double-serialization issue
 */
const decimalAwareStorage = {
  getItem: (name: string) => {
    // Safety check: only run on client side
    if (typeof window === 'undefined') return null

    try {
      const item = localStorage.getItem(name)
      if (!item) return null

      // Parse the stored data
      const parsed = JSON.parse(item)

      // Basic validation - check if it's an object
      if (!parsed || typeof parsed !== 'object') {
        console.warn('⚠️ localStorage data is not an object, clearing...')
        localStorage.removeItem(name)
        return null
      }

      // Check for old format data (pre-v2)
      if (isOldFormat(parsed)) {
        console.warn('⚠️ Detected old format data from previous version')
        console.log('🔄 Clearing old data - will start with fresh state')
        localStorage.removeItem(name)
        return null
      }

      // Deserialize Decimals from {__decimal: "123"} format to Decimal objects
      // This happens during load, before zustand sets the state
      const deserialized = deserializeDecimals(parsed)

      // Return the deserialized object (not a string!)
      return deserialized
    } catch (error) {
      console.error('❌ Error loading from storage, clearing corrupt data:', error)
      // Clear corrupt data automatically
      try {
        localStorage.removeItem(name)
        console.log('✅ Corrupt data cleared - will start with fresh state')
      } catch (clearError) {
        console.error('Failed to clear corrupt data:', clearError)
      }
      return null
    }
  },
  setItem: (name: string, value: any): void => {
    // Safety check: only run on client side
    if (typeof window === 'undefined') return

    try {
      // Serialize Decimals to {__decimal: "123"} format before saving
      const serialized = serializeDecimals(value)
      const jsonString = JSON.stringify(serialized)

      // Log storage size for debugging
      const sizeInMB = (jsonString.length / (1024 * 1024)).toFixed(2)
      console.log(`💾 Saving to localStorage: ${sizeInMB} MB`)

      localStorage.setItem(name, jsonString)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('❌ localStorage quota exceeded! Data is too large to save.')
        console.error('💡 Tip: Large Monte Carlo results are automatically excluded from persistence.')
        console.error('   Summary statistics (percentiles, median, success rate) are preserved.')
      } else {
        console.error('❌ Error saving to storage:', error)
      }
    }
  },
  removeItem: (name: string): void => {
    // Safety check: only run on client side
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(name)
    } catch (error) {
      console.error('❌ Error removing from storage:', error)
    }
  },
}

/**
 * Main calculator store combining all slices
 */
const store = create<CalculatorStore>()(
  persist(
    (...args) => ({
      // Combine all slices
      ...createInvestmentSlice(...args),
      ...createWithdrawalSlice(...args),
      ...createSocialSecuritySlice(...args),
      ...createPensionSlice(...args),
      ...createBudgetSlice(...args),
      ...createMonteCarloSlice(...args),
      ...createNarrativeSlice(...args),

      // Global actions
      resetAllCalculators: () => {
        const { set } = args[0] as any
        const store = args[1]() as CalculatorStore

        store.resetInvestmentProjection()
        store.resetRetirementWithdrawal()
        store.resetSocialSecurity()
        store.resetPension()
        store.resetBudget()
        store.resetMonteCarlo()
        store.resetNarrative()
      },

      exportData: () => {
        const { get } = args[1] as any
        const state = get()

        // Serialize the entire state
        const serialized = serializeDecimals(state)
        return JSON.stringify(serialized, null, 2)
      },

      importData: (data: string) => {
        const { set } = args[0] as any

        try {
          const parsed = JSON.parse(data)
          const deserialized = deserializeDecimals(parsed)

          // Validate and set the imported state
          set(deserialized)
        } catch (error) {
          console.error('Failed to import data:', error)
          throw new Error('Invalid import data format')
        }
      },
    }),
    {
      name: 'financial-calculator-storage',
      version: 2, // Bumped to v2 to clear old format data from production
      // Use our custom storage directly (not wrapped in createJSONStorage)
      // This way we control the serialization/deserialization of Decimals
      storage: decimalAwareStorage,
      // Validate rehydration after loading from storage
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('❌ Rehydration error:', error)
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('financial-calculator-storage')
              console.log('✅ Corrupt data cleared - starting fresh')
            } catch (e) {
              console.error('Failed to clear storage:', e)
            }
          }
          return
        }

        if (state) {
          // Validate that Decimals were properly hydrated
          const balance = (state as any).investmentProjection?.inputs?.currentBalance
          if (balance instanceof Decimal) {
            console.log('✅ State rehydrated successfully with Decimal objects')
          } else {
            console.error('❌ Decimal hydration failed - currentBalance type:', typeof balance, balance)
            console.warn('🧹 Clearing incompatible data...')
            // Clear the bad data
            if (typeof window !== 'undefined') {
              try {
                localStorage.removeItem('financial-calculator-storage')
                console.log('✅ Incompatible data cleared - please reload the page')
              } catch (e) {
                console.error('Failed to clear storage:', e)
              }
            }
          }
        }
      },
      // Partial persistence - only persist inputs and results, not UI state
      partialize: (state) => ({
        investmentProjection: state.investmentProjection,
        retirementWithdrawal: state.retirementWithdrawal,
        socialSecurity: state.socialSecurity,
        pension: state.pension,
        budget: state.budget,
        monteCarlo: {
          ...state.monteCarlo,
          isRunning: false, // Don't persist running state
          progress: 0, // Don't persist progress
          // Exclude large result arrays that exceed localStorage quota (5-10MB limit)
          // With 1M iterations, allFinalBalances contains 1M+ Decimal objects (~30MB+)
          // The UI only needs percentile data for charts, not the raw distribution
          results: state.monteCarlo.results ? {
            ...state.monteCarlo.results,
            allFinalBalances: [], // Empty array - saves ~95% storage space
          } : null,
        },
        narrative: state.narrative,
      }),
      // Handle version migrations if needed
      migrate: (persistedState: any, version: number) => {
        try {
          if (version < 2) {
            // Migration from version 0/1 to 2
            // Version 2 introduces proper Decimal serialization format
            // Old versions stored Decimals as plain strings/numbers
            console.warn(`⚠️ Migrating from version ${version} to version 2`)
            console.log('🧹 Clearing old format data to prevent type errors')
            console.log('💡 Your calculator will start fresh with correct data types')
            // Return undefined to clear old data and start fresh
            return undefined as any
          }
          return persistedState as CalculatorStore
        } catch (error) {
          console.error('❌ Migration failed:', error)
          console.warn('🧹 Clearing incompatible data...')
          // Return undefined to trigger fresh state
          return undefined as any
        }
      },
    }
  )
)

/**
 * Utility function to clear all calculator data from localStorage
 * Can be called from browser console if needed: window.clearCalculatorStorage()
 */
export function clearCalculatorStorage() {
  try {
    localStorage.removeItem('financial-calculator-storage')
    console.log('✅ Calculator storage cleared successfully')
    console.log('🔄 Reload the page to start with fresh state')
    return true
  } catch (error) {
    console.error('❌ Failed to clear calculator storage:', error)
    return false
  }
}

// Expose to window for debugging in production
if (typeof window !== 'undefined') {
  (window as any).clearCalculatorStorage = clearCalculatorStorage
}

/**
 * Export the main store hook
 */
export const useCalculatorStore = store

/**
 * Selector hooks for better performance
 * These allow components to subscribe to specific slices
 */
export const useInvestmentProjection = () =>
  store((state) => state.investmentProjection)

export const useRetirementWithdrawal = () =>
  useCalculatorStore((state) => state.retirementWithdrawal)

export const useSocialSecurity = () =>
  useCalculatorStore((state) => state.socialSecurity)

export const usePension = () =>
  useCalculatorStore((state) => state.pension)

export const useBudget = () =>
  useCalculatorStore((state) => state.budget)

export const useMonteCarlo = () =>
  useCalculatorStore((state) => state.monteCarlo)

export const useNarrative = () =>
  useCalculatorStore((state) => state.narrative)
