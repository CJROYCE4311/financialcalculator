import type { Decimal } from 'decimal.js'

// ============================================================================
// Investment Projection Calculator Types
// ============================================================================

export interface InvestmentProjectionInputs {
  currentBalance: Decimal
  equitiesPercent: Decimal
  bondsPercent: Decimal
  cashPercent: Decimal
  currentAge: number
  annualInvestment: Decimal
  employerMatchAmount: Decimal
  retirementAge: number
}

export interface YearlyProjection {
  year: number
  age: number
  balance: Decimal
  contributions: Decimal
  returns: Decimal
}

export interface InvestmentProjectionResults {
  finalBalance: Decimal
  totalContributions: Decimal
  totalReturns: Decimal
  yearByYear: YearlyProjection[]
  assetAllocation: {
    equities: Decimal
    bonds: Decimal
    cash: Decimal
  }
}

export interface InvestmentProjectionState {
  inputs: InvestmentProjectionInputs
  results: InvestmentProjectionResults | null
  lastCalculated: Date | null
}

// ============================================================================
// Retirement Withdrawal Calculator Types
// ============================================================================

export interface RetirementWithdrawalInputs {
  startingBalance: Decimal // Pre-filled from Investment Projection
  withdrawalRate: Decimal // Default 4%
  inflationRate: Decimal // Default 3%
  yearsInRetirement: number
  retirementAge: number
}

export interface YearlyWithdrawal {
  year: number
  age: number
  withdrawal: Decimal
  remainingBalance: Decimal
  inflationAdjusted: Decimal
  yearReturns: Decimal
}

export interface RetirementWithdrawalResults {
  annualWithdrawal: Decimal // First year withdrawal
  totalWithdrawn: Decimal
  totalReturnsEarned: Decimal
  yearByYear: YearlyWithdrawal[]
  balanceDepletionYear: number | null // Year when balance reaches 0, if applicable
}

export interface RetirementWithdrawalState {
  inputs: RetirementWithdrawalInputs
  results: RetirementWithdrawalResults | null
  lastCalculated: Date | null
}

// ============================================================================
// Social Security Calculator Types
// ============================================================================

export interface SocialSecurityInputs {
  finalSalary: Decimal
  retirementAge: number // 62-70
  currentAge: number
}

export interface SocialSecurityResults {
  annualBenefit: Decimal
  monthlyBenefit: Decimal
  primaryInsuranceAmount: Decimal
  adjustmentFactor: Decimal
  fullRetirementAge: number
}

export interface SocialSecurityState {
  inputs: SocialSecurityInputs
  results: SocialSecurityResults | null
  lastCalculated: Date | null
}

// ============================================================================
// Defined Retirement (Pension/Annuity) Calculator Types
// ============================================================================

export type PensionType = 'lifetime' | 'fixed-term'

export interface PensionInputs {
  pensionType: PensionType
  annualBenefit: Decimal
  startingAge: number
  termYears?: number // Only for fixed-term
}

export interface PensionResults {
  annualIncome: Decimal
  totalLifetimeValue: Decimal // Estimated total value
  yearByYear: Array<{
    year: number
    age: number
    income: Decimal
  }>
}

export interface PensionState {
  inputs: PensionInputs
  results: PensionResults | null
  lastCalculated: Date | null
}

// ============================================================================
// Budget & Cash Flow Calculator Types
// ============================================================================

export interface BudgetInputs {
  annualExpenses: Decimal
  inflationRate: Decimal // Default 3%
  yearsToProject: number
  retirementAge: number
  currentAge: number
}

export interface YearlyCashFlow {
  year: number
  age: number
  totalIncome: Decimal // Sum of all income sources
  totalExpenses: Decimal
  surplus: Decimal // Positive or negative
  incomeBreakdown: {
    withdrawals: Decimal
    socialSecurity: Decimal
    pension: Decimal
  }
}

export interface BudgetResults {
  yearByYear: YearlyCashFlow[]
  averageSurplus: Decimal
  yearsWithDeficit: number
  totalLifetimeIncome: Decimal
  totalLifetimeExpenses: Decimal
}

export interface BudgetState {
  inputs: BudgetInputs
  results: BudgetResults | null
  lastCalculated: Date | null
}

// ============================================================================
// Monte Carlo Simulation Types
// ============================================================================

export interface MonteCarloInputs {
  iterations: number // Default 1,000,000
  equitiesPercent: Decimal
  bondsPercent: Decimal
  cashPercent: Decimal
  startingBalance: Decimal
  annualWithdrawal: Decimal
  yearsInRetirement: number
  inflationRate: Decimal
}

export interface MonteCarloSimulationPath {
  yearByYear: Decimal[]
  success: boolean // Did balance last through retirement?
  finalBalance: Decimal
}

export interface MonteCarloResults {
  successRate: Decimal // Percentage of successful simulations
  medianFinalBalance: Decimal
  percentileOutcomes: {
    p5: Decimal[]   // 5th percentile path
    p25: Decimal[]  // 25th percentile
    p50: Decimal[]  // Median
    p75: Decimal[]  // 75th percentile
    p95: Decimal[]  // 95th percentile
  }
  allFinalBalances: Decimal[] // For distribution analysis
  worstCase: Decimal
  bestCase: Decimal
}

export interface MonteCarloState {
  inputs: MonteCarloInputs
  results: MonteCarloResults | null
  isRunning: boolean
  progress: number // 0-100
  lastCalculated: Date | null
}

// ============================================================================
// Strategy Narrative Types
// ============================================================================

export interface NarrativeInputs {
  includeExecutiveSummary: boolean
  includeAssetAnalysis: boolean
  includeIncomeAnalysis: boolean
  includeSuccessEvaluation: boolean
  includeRecommendations: boolean
  includeDisclaimer: boolean
}

export interface NarrativeResults {
  fullNarrative: string
  sections: {
    executiveSummary?: string
    assetAnalysis?: string
    incomeAnalysis?: string
    successEvaluation?: string
    recommendations?: string[]
    disclaimer?: string
  }
  wordCount: number
  generatedAt: Date
}

export interface NarrativeState {
  inputs: NarrativeInputs
  results: NarrativeResults | null
  lastCalculated: Date | null
}

// ============================================================================
// Global Calculator Store State
// ============================================================================

export interface CalculatorStore {
  // Calculator States
  investmentProjection: InvestmentProjectionState
  retirementWithdrawal: RetirementWithdrawalState
  socialSecurity: SocialSecurityState
  pension: PensionState
  budget: BudgetState
  monteCarlo: MonteCarloState
  narrative: NarrativeState

  // Actions for Investment Projection
  updateInvestmentInputs: (inputs: Partial<InvestmentProjectionInputs>) => void
  calculateInvestmentProjection: () => void
  resetInvestmentProjection: () => void

  // Actions for Retirement Withdrawal
  updateWithdrawalInputs: (inputs: Partial<RetirementWithdrawalInputs>) => void
  calculateRetirementWithdrawal: () => void
  resetRetirementWithdrawal: () => void

  // Actions for Social Security
  updateSocialSecurityInputs: (inputs: Partial<SocialSecurityInputs>) => void
  calculateSocialSecurity: () => void
  resetSocialSecurity: () => void

  // Actions for Pension
  updatePensionInputs: (inputs: Partial<PensionInputs>) => void
  calculatePension: () => void
  resetPension: () => void

  // Actions for Budget
  updateBudgetInputs: (inputs: Partial<BudgetInputs>) => void
  calculateBudget: () => void
  resetBudget: () => void

  // Actions for Monte Carlo
  updateMonteCarloInputs: (inputs: Partial<MonteCarloInputs>) => void
  startMonteCarloSimulation: () => void
  updateMonteCarloProgress: (progress: number) => void
  completeMonteCarloSimulation: (results: MonteCarloResults) => void
  resetMonteCarlo: () => void

  // Actions for Narrative
  updateNarrativeInputs: (inputs: Partial<NarrativeInputs>) => void
  generateNarrative: () => void
  resetNarrative: () => void

  // Global Actions
  resetAllCalculators: () => void
  exportData: () => string
  importData: (data: string) => void
}

// ============================================================================
// Financial Constants Types
// ============================================================================

export interface HistoricalReturns {
  equities: {
    mean: Decimal
    stdDev: Decimal
  }
  bonds: {
    mean: Decimal
    stdDev: Decimal
  }
  cash: {
    mean: Decimal
    stdDev: Decimal
  }
}

export interface SocialSecurityConstants {
  fullRetirementAge: number
  bendPoint1: Decimal
  bendPoint2: Decimal
  bendPointRate1: Decimal
  bendPointRate2: Decimal
  bendPointRate3: Decimal
  earlyReductionMonths: number
  delayedCreditRate: Decimal
}

// ============================================================================
// Chart Data Types
// ============================================================================

export interface PieChartData {
  name: string
  value: number
  color: string
}

export interface AreaChartData {
  year: number
  age: number
  balance: number
}

export interface StackedAreaChartData {
  year: number
  age: number
  income: number
  expenses: number
  surplus: number
}

export interface FanChartData {
  year: number
  p5: number
  p25: number
  p50: number
  p75: number
  p95: number
}
