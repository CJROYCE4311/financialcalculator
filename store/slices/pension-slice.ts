import { StateCreator } from 'zustand'
import Decimal from 'decimal.js'
import type { CalculatorStore, PensionState } from '@/types/calculator.types'
import { DEFAULT_VALUES, getLifeExpectancy } from '@/constants/financial-constants'
import { roundCurrency } from '@/lib/calculations/financial-formulas'

export interface PensionSlice {
  pension: PensionState
  updatePensionInputs: (inputs: Partial<PensionState['inputs']>) => void
  calculatePension: () => void
  resetPension: () => void
}

const initialState: PensionState = {
  inputs: {
    pensionType: 'lifetime',
    annualBenefit: DEFAULT_VALUES.PENSION_ANNUAL_BENEFIT,
    startingAge: DEFAULT_VALUES.PENSION_STARTING_AGE,
    termYears: DEFAULT_VALUES.PENSION_TERM_YEARS,
  },
  results: null,
  lastCalculated: null,
}

export const createPensionSlice: StateCreator<
  CalculatorStore,
  [],
  [],
  PensionSlice
> = (set, get) => ({
  pension: initialState,

  updatePensionInputs: (inputs) => {
    set((state) => ({
      pension: {
        ...state.pension,
        inputs: {
          ...state.pension.inputs,
          ...inputs,
        },
      },
    }))
  },

  calculatePension: () => {
    const { inputs } = get().pension

    const yearByYear: Array<{ year: number; age: number; income: Decimal }> = []
    let totalValue = new Decimal(0)

    // Determine number of years for pension payments
    const yearsOfPayments =
      inputs.pensionType === 'lifetime'
        ? getLifeExpectancy(inputs.startingAge) - inputs.startingAge
        : inputs.termYears || 20

    for (let year = 0; year < yearsOfPayments; year++) {
      const age = inputs.startingAge + year
      yearByYear.push({
        year,
        age,
        income: inputs.annualBenefit,
      })
      totalValue = totalValue.plus(inputs.annualBenefit)
    }

    const results = {
      annualIncome: roundCurrency(inputs.annualBenefit),
      totalLifetimeValue: roundCurrency(totalValue),
      yearByYear,
    }

    set((state) => ({
      pension: {
        ...state.pension,
        results,
        lastCalculated: new Date(),
      },
    }))
  },

  resetPension: () => {
    set({ pension: initialState })
  },
})
