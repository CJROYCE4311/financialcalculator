import { StateCreator } from 'zustand'
import Decimal from 'decimal.js'
import type { CalculatorStore, SocialSecurityState } from '@/types/calculator.types'
import { DEFAULT_VALUES, SSA_CONSTANTS } from '@/constants/financial-constants'
import { roundCurrency } from '@/lib/calculations/financial-formulas'

export interface SocialSecuritySlice {
  socialSecurity: SocialSecurityState
  updateSocialSecurityInputs: (inputs: Partial<SocialSecurityState['inputs']>) => void
  calculateSocialSecurity: () => void
  resetSocialSecurity: () => void
}

const initialState: SocialSecurityState = {
  inputs: {
    finalSalary: DEFAULT_VALUES.FINAL_SALARY,
    retirementAge: DEFAULT_VALUES.SS_RETIREMENT_AGE,
    currentAge: DEFAULT_VALUES.CURRENT_AGE,
  },
  results: null,
  lastCalculated: null,
}

export const createSocialSecuritySlice: StateCreator<
  CalculatorStore,
  [],
  [],
  SocialSecuritySlice
> = (set, get) => ({
  socialSecurity: initialState,

  updateSocialSecurityInputs: (inputs) => {
    set((state) => ({
      socialSecurity: {
        ...state.socialSecurity,
        inputs: {
          ...state.socialSecurity.inputs,
          ...inputs,
        },
      },
    }))
  },

  calculateSocialSecurity: () => {
    const { inputs } = get().socialSecurity

    // Calculate average indexed monthly earnings (simplified - using final salary / 12)
    const monthlyEarnings = inputs.finalSalary.div(12)

    // Apply SSA bend points to calculate Primary Insurance Amount (PIA)
    let primaryInsuranceAmount: Decimal

    if (monthlyEarnings.lessThanOrEqualTo(SSA_CONSTANTS.bendPoint1)) {
      // First tier: 90% of earnings up to first bend point
      primaryInsuranceAmount = monthlyEarnings.mul(SSA_CONSTANTS.bendPointRate1)
    } else if (monthlyEarnings.lessThanOrEqualTo(SSA_CONSTANTS.bendPoint2)) {
      // First tier + second tier
      primaryInsuranceAmount = SSA_CONSTANTS.bendPoint1
        .mul(SSA_CONSTANTS.bendPointRate1)
        .plus(
          monthlyEarnings
            .minus(SSA_CONSTANTS.bendPoint1)
            .mul(SSA_CONSTANTS.bendPointRate2)
        )
    } else {
      // All three tiers
      primaryInsuranceAmount = SSA_CONSTANTS.bendPoint1
        .mul(SSA_CONSTANTS.bendPointRate1)
        .plus(
          SSA_CONSTANTS.bendPoint2
            .minus(SSA_CONSTANTS.bendPoint1)
            .mul(SSA_CONSTANTS.bendPointRate2)
        )
        .plus(
          monthlyEarnings
            .minus(SSA_CONSTANTS.bendPoint2)
            .mul(SSA_CONSTANTS.bendPointRate3)
        )
    }

    // Apply early/delayed retirement adjustments
    const FRA = SSA_CONSTANTS.fullRetirementAge
    let adjustmentFactor = new Decimal(1)

    if (inputs.retirementAge < FRA) {
      // Early retirement reduction
      const monthsEarly = (FRA - inputs.retirementAge) * 12

      if (monthsEarly <= SSA_CONSTANTS.earlyReductionMonths) {
        // 5/9 of 1% for each month (up to 36 months)
        adjustmentFactor = new Decimal(1).minus(
          new Decimal(monthsEarly).mul(new Decimal(5).div(900))
        )
      } else {
        // 5/9 of 1% for first 36 months, 5/12 of 1% for each additional month
        const firstReduction = new Decimal(36).mul(new Decimal(5).div(900))
        const additionalMonths = monthsEarly - 36
        const additionalReduction = new Decimal(additionalMonths).mul(new Decimal(5).div(1200))
        adjustmentFactor = new Decimal(1).minus(firstReduction).minus(additionalReduction)
      }
    } else if (inputs.retirementAge > FRA) {
      // Delayed retirement credits: 8% per year
      const yearsDelayed = inputs.retirementAge - FRA
      adjustmentFactor = new Decimal(1).plus(
        SSA_CONSTANTS.delayedCreditRate.mul(yearsDelayed)
      )
    }

    const adjustedMonthlyBenefit = primaryInsuranceAmount.mul(adjustmentFactor)
    const annualBenefit = adjustedMonthlyBenefit.mul(12)

    const results = {
      annualBenefit: roundCurrency(annualBenefit),
      monthlyBenefit: roundCurrency(adjustedMonthlyBenefit),
      primaryInsuranceAmount: roundCurrency(primaryInsuranceAmount),
      adjustmentFactor: adjustmentFactor,
      fullRetirementAge: FRA,
    }

    set((state) => ({
      socialSecurity: {
        ...state.socialSecurity,
        results,
        lastCalculated: new Date(),
      },
    }))
  },

  resetSocialSecurity: () => {
    set({ socialSecurity: initialState })
  },
})
