import { StateCreator } from 'zustand'
import Decimal from 'decimal.js'
import type { CalculatorStore, RetirementWithdrawalState, YearlyWithdrawal } from '@/types/calculator.types'
import { DEFAULT_VALUES, calculateBlendedReturn } from '@/constants/financial-constants'
import { calculateSafeWithdrawal, projectWithInflation, roundCurrency, percentageToRate } from '@/lib/calculations/financial-formulas'

export interface WithdrawalSlice {
  retirementWithdrawal: RetirementWithdrawalState
  updateWithdrawalInputs: (inputs: Partial<RetirementWithdrawalState['inputs']>) => void
  calculateRetirementWithdrawal: () => void
  resetRetirementWithdrawal: () => void
}

const initialState: RetirementWithdrawalState = {
  inputs: {
    startingBalance: new Decimal(0), // Will be filled from Investment Projection
    withdrawalRate: DEFAULT_VALUES.WITHDRAWAL_RATE,
    inflationRate: DEFAULT_VALUES.INFLATION_RATE,
    yearsInRetirement: DEFAULT_VALUES.YEARS_IN_RETIREMENT,
    retirementAge: DEFAULT_VALUES.RETIREMENT_AGE,
  },
  results: null,
  lastCalculated: null,
}

export const createWithdrawalSlice: StateCreator<
  CalculatorStore,
  [],
  [],
  WithdrawalSlice
> = (set, get) => ({
  retirementWithdrawal: initialState,

  updateWithdrawalInputs: (inputs) => {
    set((state) => ({
      retirementWithdrawal: {
        ...state.retirementWithdrawal,
        inputs: {
          ...state.retirementWithdrawal.inputs,
          ...inputs,
        },
      },
    }))
  },

  calculateRetirementWithdrawal: () => {
    const { inputs } = get().retirementWithdrawal

    if (inputs.startingBalance.isZero()) {
      console.error('Starting balance must be greater than zero')
      return
    }

    // Calculate first year withdrawal based on withdrawal rate
    const withdrawalRateDecimal = percentageToRate(inputs.withdrawalRate)
    const inflationRateDecimal = percentageToRate(inputs.inflationRate)
    const firstYearWithdrawal = calculateSafeWithdrawal(
      inputs.startingBalance,
      withdrawalRateDecimal
    )

    // Get asset allocation from investment calculator to calculate returns
    const investmentState = get().investmentProjection
    const assetAllocation = investmentState.inputs

    // Calculate blended return rate (same as investment calculator)
    const portfolioReturnRate = calculateBlendedReturn(
      new Decimal(assetAllocation.equitiesPercent),
      new Decimal(assetAllocation.bondsPercent),
      new Decimal(assetAllocation.cashPercent)
    )

    // Simulate withdrawal over retirement years
    const yearByYear: YearlyWithdrawal[] = []
    let remainingBalance = inputs.startingBalance
    let totalWithdrawn = new Decimal(0)
    let totalReturnsEarned = new Decimal(0)
    let balanceDepletionYear: number | null = null

    for (let year = 0; year < inputs.yearsInRetirement; year++) {
      const age = inputs.retirementAge + year

      // Calculate inflation-adjusted withdrawal
      const inflationAdjusted = projectWithInflation(
        firstYearWithdrawal,
        inflationRateDecimal,
        year
      )

      // Calculate investment returns on remaining balance
      const yearReturns = remainingBalance.mul(portfolioReturnRate)
      totalReturnsEarned = totalReturnsEarned.plus(yearReturns)

      // Update balance: add returns, subtract withdrawal
      const newBalance = remainingBalance.plus(yearReturns).minus(inflationAdjusted)

      if (newBalance.greaterThanOrEqualTo(0)) {
        remainingBalance = newBalance
        totalWithdrawn = totalWithdrawn.plus(inflationAdjusted)
      } else {
        // Balance depleted - take what's left
        if (balanceDepletionYear === null) {
          balanceDepletionYear = year
        }
        const partialWithdrawal = remainingBalance.plus(yearReturns)
        totalWithdrawn = totalWithdrawn.plus(Decimal.max(partialWithdrawal, 0))
        remainingBalance = new Decimal(0)
      }

      yearByYear.push({
        year,
        age,
        withdrawal: roundCurrency(inflationAdjusted),
        remainingBalance: roundCurrency(remainingBalance),
        inflationAdjusted: roundCurrency(inflationAdjusted),
        yearReturns: roundCurrency(yearReturns),
      })
    }

    const results = {
      annualWithdrawal: roundCurrency(firstYearWithdrawal),
      totalWithdrawn: roundCurrency(totalWithdrawn),
      totalReturnsEarned: roundCurrency(totalReturnsEarned),
      yearByYear,
      balanceDepletionYear,
    }

    set((state) => ({
      retirementWithdrawal: {
        ...state.retirementWithdrawal,
        results,
        lastCalculated: new Date(),
      },
    }))

    // Update budget calculator with withdrawal amount
    get().updateBudgetInputs({
      retirementAge: inputs.retirementAge,
    })
  },

  resetRetirementWithdrawal: () => {
    set({ retirementWithdrawal: initialState })
  },
})
