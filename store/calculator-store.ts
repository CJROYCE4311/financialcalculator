import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Decimal from 'decimal.js'
import type { CalculatorStore } from '@/types/calculator.types'
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
 * Custom storage with Decimal serialization
 */
const customStorage = {
  getItem: (name: string): string | null => {
    const item = localStorage.getItem(name)
    if (!item) return null

    try {
      // Parse the stored JSON and deserialize Decimal objects
      const parsed = JSON.parse(item)
      const deserialized = deserializeDecimals(parsed)
      // Return as JSON string for zustand
      return JSON.stringify(deserialized)
    } catch (error) {
      console.error('Error loading from storage:', error)
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      // Parse the value, serialize Decimals, and store
      const parsed = JSON.parse(value)
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
      storage: createJSONStorage(() => customStorage),
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
        if (version === 0) {
          // Migration from version 0 to 1 (if needed in future)
          // For now, just return the persisted state
        }
        return persistedState as CalculatorStore
      },
    }
  )
)

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
