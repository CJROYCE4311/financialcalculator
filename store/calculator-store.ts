import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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
 * Custom storage that handles Decimal serialization properly
 * This storage is used by createJSONStorage, which expects string in/out
 */
const decimalAwareStorage = {
  getItem: (name: string): string | null => {
    const item = localStorage.getItem(name)
    if (!item) return null

    try {
      // Parse from localStorage
      const parsed = JSON.parse(item)

      // Validate the parsed data structure
      if (!parsed || typeof parsed !== 'object' || !parsed.state) {
        console.warn('Invalid localStorage data structure, clearing...')
        localStorage.removeItem(name)
        return null
      }

      // Deserialize Decimals from {__decimal: "123"} format
      const withDecimals = deserializeDecimals(parsed)

      // IMPORTANT: createJSONStorage will parse this again,
      // so we need to use a custom replacer to preserve Decimals
      return JSON.stringify(withDecimals, (key, value) => {
        if (value instanceof Decimal) {
          return { __decimal: value.toString() }
        }
        if (value instanceof Date) {
          return { __date: value.toISOString() }
        }
        return value
      })
    } catch (error) {
      console.error('Error loading from storage, clearing corrupt data:', error)
      // Clear corrupt data automatically
      try {
        localStorage.removeItem(name)
      } catch (clearError) {
        console.error('Failed to clear corrupt data:', clearError)
      }
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      // createJSONStorage stringifies before calling this
      const parsed = JSON.parse(value)
      // Serialize Decimals to {__decimal: "123"} format
      const serialized = serializeDecimals(parsed)
      localStorage.setItem(name, JSON.stringify(serialized))
    } catch (error) {
      console.error('Error saving to storage:', error)
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name)
  },
}

/**
 * Main calculator store combining all slices
 */
export const useCalculatorStore = create<CalculatorStore>()(
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
      version: 1,
      storage: createJSONStorage(() => decimalAwareStorage),
      // Hydrate Decimals after loading from storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          try {
            // Recursively hydrate all Decimal values
            const hydrated = hydrateDecimals(state)
            Object.assign(state, hydrated)
            console.log('✅ Successfully rehydrated calculator state from localStorage')
          } catch (error) {
            console.error('❌ Error rehydrating state from localStorage:', error)
            console.warn('🧹 Clearing corrupt localStorage data...')
            // Clear the corrupt data to prevent app crashes
            try {
              localStorage.removeItem('financial-calculator-storage')
              console.log('✅ Corrupt data cleared. Page will reload with fresh state.')
              // Reload to start fresh
              window.location.reload()
            } catch (clearError) {
              console.error('Failed to clear localStorage:', clearError)
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
        },
        narrative: state.narrative,
      }),
      // Handle version migrations if needed
      migrate: (persistedState: any, version: number) => {
        try {
          if (version < 1) {
            // Migration from version 0 to 1
            console.log(`🔄 Migrating storage from version ${version} to version 1`)
            // Clear old data that doesn't match current schema
            // In future versions, add specific migration logic here
            return persistedState as CalculatorStore
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
 * Selector hooks for better performance
 * These allow components to subscribe to specific slices
 */
export const useInvestmentProjection = () =>
  useCalculatorStore((state) => state.investmentProjection)

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
