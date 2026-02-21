import { StateCreator } from 'zustand'
import Decimal from 'decimal.js'
import type { CalculatorStore, MonteCarloState, MonteCarloResults } from '@/types/calculator.types'
import { DEFAULT_VALUES } from '@/constants/financial-constants'

export interface MonteCarloSlice {
  monteCarlo: MonteCarloState
  updateMonteCarloInputs: (inputs: Partial<MonteCarloState['inputs']>) => void
  startMonteCarloSimulation: () => void
  updateMonteCarloProgress: (progress: number) => void
  completeMonteCarloSimulation: (results: MonteCarloResults) => void
  resetMonteCarlo: () => void
}

const initialState: MonteCarloState = {
  inputs: {
    iterations: DEFAULT_VALUES.MONTE_CARLO_ITERATIONS,
    equitiesPercent: DEFAULT_VALUES.EQUITIES_PERCENT,
    bondsPercent: DEFAULT_VALUES.BONDS_PERCENT,
    cashPercent: DEFAULT_VALUES.CASH_PERCENT,
    startingBalance: new Decimal(0),
    annualWithdrawal: new Decimal(0),
    yearsInRetirement: DEFAULT_VALUES.YEARS_IN_RETIREMENT,
    inflationRate: DEFAULT_VALUES.INFLATION_RATE,
  },
  results: null,
  isRunning: false,
  progress: 0,
  lastCalculated: null,
}

export const createMonteCarloSlice: StateCreator<
  CalculatorStore,
  [],
  [],
  MonteCarloSlice
> = (set, get) => ({
  monteCarlo: initialState,

  updateMonteCarloInputs: (inputs) => {
    set((state) => ({
      monteCarlo: {
        ...state.monteCarlo,
        inputs: {
          ...state.monteCarlo.inputs,
          ...inputs,
        },
      },
    }))
  },

  startMonteCarloSimulation: () => {
    const state = get()
    const { inputs } = state.monteCarlo

    set((stateToUpdate) => ({
      monteCarlo: {
        ...stateToUpdate.monteCarlo,
        isRunning: true,
        progress: 0,
        results: null,
      },
    }))

    // Create Web Worker
    const worker = new Worker(new URL('@/lib/calculations/monte-carlo.worker.ts', import.meta.url))

    // Handle worker messages
    worker.onmessage = (event: MessageEvent) => {
      const { type, progress, results } = event.data

      if (type === 'PROGRESS') {
        get().updateMonteCarloProgress(progress)
      } else if (type === 'COMPLETE') {
        // Convert plain numbers back to Decimals for storage
        const decimalResults = {
          successRate: new Decimal(results.successRate),
          medianFinalBalance: new Decimal(results.medianFinalBalance),
          percentileOutcomes: {
            p5: results.percentileOutcomes.p5.map((n: number) => new Decimal(n)),
            p25: results.percentileOutcomes.p25.map((n: number) => new Decimal(n)),
            p50: results.percentileOutcomes.p50.map((n: number) => new Decimal(n)),
            p75: results.percentileOutcomes.p75.map((n: number) => new Decimal(n)),
            p95: results.percentileOutcomes.p95.map((n: number) => new Decimal(n)),
          },
          allFinalBalances: results.allFinalBalances.map((n: number) => new Decimal(n)),
          worstCase: new Decimal(results.worstCase),
          bestCase: new Decimal(results.bestCase),
        }

        get().completeMonteCarloSimulation(decimalResults)
        worker.terminate()
      }
    }

    worker.onerror = (error: ErrorEvent) => {
      console.error('Monte Carlo worker error:', error)
      set((stateToUpdate) => ({
        monteCarlo: {
          ...stateToUpdate.monteCarlo,
          isRunning: false,
          progress: 0,
        },
      }))
      worker.terminate()
    }

    // Send simulation parameters to worker (convert Decimals to numbers)
    worker.postMessage({
      type: 'START_SIMULATION',
      params: {
        iterations: inputs.iterations,
        equitiesPercent: inputs.equitiesPercent.toNumber(),
        bondsPercent: inputs.bondsPercent.toNumber(),
        cashPercent: inputs.cashPercent.toNumber(),
        startingBalance: inputs.startingBalance.toNumber(),
        annualWithdrawal: inputs.annualWithdrawal.toNumber(),
        yearsInRetirement: inputs.yearsInRetirement,
        inflationRate: inputs.inflationRate.toNumber(),
      },
    })
  },

  updateMonteCarloProgress: (progress) => {
    set((state) => ({
      monteCarlo: {
        ...state.monteCarlo,
        progress: Math.min(100, Math.max(0, progress)),
      },
    }))
  },

  completeMonteCarloSimulation: (results) => {
    set((state) => ({
      monteCarlo: {
        ...state.monteCarlo,
        results,
        isRunning: false,
        progress: 100,
        lastCalculated: new Date(),
      },
    }))
  },

  resetMonteCarlo: () => {
    set({ monteCarlo: initialState })
  },
})
