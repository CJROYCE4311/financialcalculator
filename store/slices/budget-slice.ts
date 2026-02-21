import { StateCreator } from 'zustand'
import Decimal from 'decimal.js'
import type { CalculatorStore, BudgetState, YearlyCashFlow } from '@/types/calculator.types'
import { DEFAULT_VALUES } from '@/constants/financial-constants'
import { projectWithInflation, roundCurrency, percentageToRate } from '@/lib/calculations/financial-formulas'

export interface BudgetSlice {
  budget: BudgetState
  updateBudgetInputs: (inputs: Partial<BudgetState['inputs']>) => void
  calculateBudget: () => void
  resetBudget: () => void
}

const initialState: BudgetState = {
  inputs: {
    annualExpenses: DEFAULT_VALUES.ANNUAL_EXPENSES,
    inflationRate: DEFAULT_VALUES.INFLATION_RATE,
    yearsToProject: DEFAULT_VALUES.YEARS_TO_PROJECT,
    retirementAge: DEFAULT_VALUES.RETIREMENT_AGE,
    currentAge: DEFAULT_VALUES.CURRENT_AGE,
  },
  results: null,
  lastCalculated: null,
}

export const createBudgetSlice: StateCreator<
  CalculatorStore,
  [],
  [],
  BudgetSlice
> = (set, get) => ({
  budget: initialState,

  updateBudgetInputs: (inputs) => {
    set((state) => ({
      budget: {
        ...state.budget,
        inputs: {
          ...state.budget.inputs,
          ...inputs,
        },
      },
    }))
  },

  calculateBudget: () => {
    const { inputs } = get().budget
    const store = get()

    // Get income sources from other calculators
    const withdrawalResults = store.retirementWithdrawal.results
    const socialSecurityResults = store.socialSecurity.results
    const pensionResults = store.pension.results

    const inflationRateDecimal = percentageToRate(inputs.inflationRate)

    const yearByYear: YearlyCashFlow[] = []
    let totalLifetimeIncome = new Decimal(0)
    let totalLifetimeExpenses = new Decimal(0)
    let yearsWithDeficit = 0

    for (let year = 0; year < inputs.yearsToProject; year++) {
      const age = inputs.retirementAge + year

      // Calculate inflated expenses
      const yearExpenses = projectWithInflation(
        inputs.annualExpenses,
        inflationRateDecimal,
        year
      )

      // Aggregate income from all sources
      const withdrawals =
        withdrawalResults?.yearByYear[year]?.withdrawal || new Decimal(0)
      const socialSecurity =
        socialSecurityResults?.annualBenefit || new Decimal(0)
      const pension =
        pensionResults?.yearByYear[year]?.income || new Decimal(0)

      const totalIncome = withdrawals.plus(socialSecurity).plus(pension)
      const surplus = totalIncome.minus(yearExpenses)

      if (surplus.lessThan(0)) {
        yearsWithDeficit++
      }

      totalLifetimeIncome = totalLifetimeIncome.plus(totalIncome)
      totalLifetimeExpenses = totalLifetimeExpenses.plus(yearExpenses)

      yearByYear.push({
        year,
        age,
        totalIncome: roundCurrency(totalIncome),
        totalExpenses: roundCurrency(yearExpenses),
        surplus: roundCurrency(surplus),
        incomeBreakdown: {
          withdrawals: roundCurrency(withdrawals),
          socialSecurity: roundCurrency(socialSecurity),
          pension: roundCurrency(pension),
        },
      })
    }

    const averageSurplus = totalLifetimeIncome
      .minus(totalLifetimeExpenses)
      .div(inputs.yearsToProject)

    const results = {
      yearByYear,
      averageSurplus: roundCurrency(averageSurplus),
      yearsWithDeficit,
      totalLifetimeIncome: roundCurrency(totalLifetimeIncome),
      totalLifetimeExpenses: roundCurrency(totalLifetimeExpenses),
    }

    set((state) => ({
      budget: {
        ...state.budget,
        results,
        lastCalculated: new Date(),
      },
    }))
  },

  resetBudget: () => {
    set({ budget: initialState })
  },
})
