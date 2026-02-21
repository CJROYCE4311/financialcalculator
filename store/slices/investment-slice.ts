import { StateCreator } from 'zustand'
import Decimal from 'decimal.js'
import type { CalculatorStore, InvestmentProjectionState, YearlyProjection } from '@/types/calculator.types'
import { DEFAULT_VALUES, calculateBlendedReturn } from '@/constants/financial-constants'
import { calculateFutureValue, calculateEmployerMatch, roundCurrency, validateAssetAllocation } from '@/lib/calculations/financial-formulas'

export interface InvestmentSlice {
  investmentProjection: InvestmentProjectionState
  updateInvestmentInputs: (inputs: Partial<InvestmentProjectionState['inputs']>) => void
  calculateInvestmentProjection: () => void
  resetInvestmentProjection: () => void
}

const initialState: InvestmentProjectionState = {
  inputs: {
    currentBalance: DEFAULT_VALUES.CURRENT_BALANCE,
    equitiesPercent: DEFAULT_VALUES.EQUITIES_PERCENT,
    bondsPercent: DEFAULT_VALUES.BONDS_PERCENT,
    cashPercent: DEFAULT_VALUES.CASH_PERCENT,
    currentAge: DEFAULT_VALUES.CURRENT_AGE,
    annualInvestment: DEFAULT_VALUES.ANNUAL_INVESTMENT,
    employerMatchAmount: DEFAULT_VALUES.EMPLOYER_MATCH_AMOUNT,
    retirementAge: DEFAULT_VALUES.RETIREMENT_AGE,
  },
  results: null,
  lastCalculated: null,
}

export const createInvestmentSlice: StateCreator<
  CalculatorStore,
  [],
  [],
  InvestmentSlice
> = (set, get) => ({
  investmentProjection: initialState,

  updateInvestmentInputs: (inputs) => {
    set((state) => ({
      investmentProjection: {
        ...state.investmentProjection,
        inputs: {
          ...state.investmentProjection.inputs,
          ...inputs,
        },
      },
    }))
  },

  calculateInvestmentProjection: () => {
    const { inputs } = get().investmentProjection

    // Validate asset allocation
    if (!validateAssetAllocation(
      inputs.equitiesPercent,
      inputs.bondsPercent,
      inputs.cashPercent
    )) {
      console.error('Asset allocation must sum to 100%')
      return
    }

    const yearsToRetirement = inputs.retirementAge - inputs.currentAge
    if (yearsToRetirement <= 0) {
      console.error('Retirement age must be greater than current age')
      return
    }

    // Calculate blended return rate based on asset allocation
    const annualReturn = calculateBlendedReturn(
      new Decimal(inputs.equitiesPercent),
      new Decimal(inputs.bondsPercent),
      new Decimal(inputs.cashPercent)
    )

    // Use employer match amount directly
    const totalAnnualContribution = inputs.annualInvestment.plus(inputs.employerMatchAmount)

    // Year-by-year projection
    const yearByYear: YearlyProjection[] = []
    let currentBalance = inputs.currentBalance
    let totalContributions = new Decimal(0)
    let totalReturns = new Decimal(0)

    for (let year = 0; year <= yearsToRetirement; year++) {
      const age = inputs.currentAge + year
      const yearStartBalance = currentBalance

      // Calculate returns for the year
      const yearReturns = currentBalance.mul(annualReturn)

      // Add contributions (except in year 0 where we start with current balance)
      const yearContributions = year === 0 ? new Decimal(0) : totalAnnualContribution

      // Update balance
      currentBalance = currentBalance.plus(yearReturns).plus(yearContributions)
      totalContributions = totalContributions.plus(yearContributions)
      totalReturns = totalReturns.plus(yearReturns)

      yearByYear.push({
        year,
        age,
        balance: roundCurrency(currentBalance),
        contributions: roundCurrency(yearContributions),
        returns: roundCurrency(yearReturns),
      })
    }

    const results = {
      finalBalance: roundCurrency(currentBalance),
      totalContributions: roundCurrency(totalContributions),
      totalReturns: roundCurrency(totalReturns),
      yearByYear,
      assetAllocation: {
        equities: inputs.equitiesPercent,
        bonds: inputs.bondsPercent,
        cash: inputs.cashPercent,
      },
    }

    set((state) => ({
      investmentProjection: {
        ...state.investmentProjection,
        results,
        lastCalculated: new Date(),
      },
    }))

    // Auto-update withdrawal calculator with final balance
    get().updateWithdrawalInputs({
      startingBalance: results.finalBalance,
      retirementAge: inputs.retirementAge,
    })
  },

  resetInvestmentProjection: () => {
    set({ investmentProjection: initialState })
  },
})
