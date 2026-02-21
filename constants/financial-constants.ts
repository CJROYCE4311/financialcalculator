import Decimal from 'decimal.js'
import type { HistoricalReturns, SocialSecurityConstants } from '@/types/calculator.types'

/**
 * Historical average returns and volatility for asset classes
 * Based on historical data (1926-2025)
 * Source: S&P 500, Bloomberg Barclays Aggregate Bond Index, Treasury Bills
 */
export const HISTORICAL_RETURNS: HistoricalReturns = {
  equities: {
    mean: new Decimal(0.10), // 10% average annual return
    stdDev: new Decimal(0.18), // 18% standard deviation (volatility)
  },
  bonds: {
    mean: new Decimal(0.05), // 5% average annual return
    stdDev: new Decimal(0.06), // 6% standard deviation
  },
  cash: {
    mean: new Decimal(0.02), // 2% average annual return
    stdDev: new Decimal(0.01), // 1% standard deviation
  },
}

/**
 * Social Security Administration constants for 2026
 * Bend points and benefit calculation factors
 * Source: SSA.gov
 */
export const SSA_CONSTANTS: SocialSecurityConstants = {
  fullRetirementAge: 67, // FRA for people born 1960 or later
  bendPoint1: new Decimal(1226), // First bend point (monthly)
  bendPoint2: new Decimal(7391), // Second bend point (monthly)
  bendPointRate1: new Decimal(0.90), // 90% of first $1,226
  bendPointRate2: new Decimal(0.32), // 32% of amount between $1,226 and $7,391
  bendPointRate3: new Decimal(0.15), // 15% of amount over $7,391
  earlyReductionMonths: 36, // Months before FRA with 5/9% reduction
  delayedCreditRate: new Decimal(0.08), // 8% per year for delayed claiming
}

/**
 * Default calculator values
 */
export const DEFAULT_VALUES = {
  // Investment Projection
  CURRENT_BALANCE: new Decimal(100000),
  EQUITIES_PERCENT: new Decimal(60),
  BONDS_PERCENT: new Decimal(30),
  CASH_PERCENT: new Decimal(10),
  CURRENT_AGE: 30,
  ANNUAL_INVESTMENT: new Decimal(12000),
  EMPLOYER_MATCH_AMOUNT: new Decimal(6000), // Annual employer match
  RETIREMENT_AGE: 65,

  // Retirement Withdrawal
  WITHDRAWAL_RATE: new Decimal(4), // 4% rule
  INFLATION_RATE: new Decimal(3), // 3% annual inflation
  YEARS_IN_RETIREMENT: 30,

  // Social Security
  FINAL_SALARY: new Decimal(75000),
  SS_RETIREMENT_AGE: 67,

  // Pension
  PENSION_ANNUAL_BENEFIT: new Decimal(24000),
  PENSION_STARTING_AGE: 65,
  PENSION_TERM_YEARS: 20,

  // Budget
  ANNUAL_EXPENSES: new Decimal(50000),
  YEARS_TO_PROJECT: 30,

  // Monte Carlo
  MONTE_CARLO_ITERATIONS: 1000000,
  MONTE_CARLO_QUICK_ITERATIONS: 10000, // For testing/preview

  // Minimum/Maximum Values
  MIN_AGE: 18,
  MAX_AGE: 100,
  MIN_RETIREMENT_AGE: 50,
  MAX_RETIREMENT_AGE: 75,
  MIN_SS_CLAIM_AGE: 62,
  MAX_SS_CLAIM_AGE: 70,
}

/**
 * Retirement withdrawal sustainability thresholds
 */
export const WITHDRAWAL_THRESHOLDS = {
  CONSERVATIVE: new Decimal(3.5), // 3.5% or less
  MODERATE: new Decimal(4.0), // 4% rule
  AGGRESSIVE: new Decimal(5.0), // 5% or higher (risky)
}

/**
 * Monte Carlo success rate thresholds
 */
export const SUCCESS_RATE_THRESHOLDS = {
  EXCELLENT: new Decimal(95), // 95%+ success rate
  GOOD: new Decimal(85), // 85-95% success rate
  MODERATE: new Decimal(75), // 75-85% success rate
  CONCERNING: new Decimal(65), // 65-75% success rate
  POOR: new Decimal(0), // Below 65% success rate
}

/**
 * Asset allocation risk profiles
 */
export const RISK_PROFILES = {
  CONSERVATIVE: {
    equities: new Decimal(30),
    bonds: new Decimal(60),
    cash: new Decimal(10),
  },
  MODERATE: {
    equities: new Decimal(60),
    bonds: new Decimal(30),
    cash: new Decimal(10),
  },
  AGGRESSIVE: {
    equities: new Decimal(80),
    bonds: new Decimal(15),
    cash: new Decimal(5),
  },
  VERY_AGGRESSIVE: {
    equities: new Decimal(95),
    bonds: new Decimal(5),
    cash: new Decimal(0),
  },
}

/**
 * Tax rates for simplified calculations
 * Note: These are approximations. Users should consult tax professionals.
 */
export const SIMPLIFIED_TAX_RATES = {
  ORDINARY_INCOME: new Decimal(0.22), // Approximate federal marginal rate
  CAPITAL_GAINS_LONG_TERM: new Decimal(0.15), // Long-term capital gains
  SOCIAL_SECURITY_TAX: new Decimal(0.85), // Up to 85% of benefits may be taxable
}

/**
 * Life expectancy by age (simplified US actuarial tables)
 * Source: Social Security Administration Period Life Table
 */
export const LIFE_EXPECTANCY: Record<number, number> = {
  50: 82,
  55: 82,
  60: 83,
  65: 84,
  70: 85,
  75: 87,
  80: 89,
  85: 92,
}

/**
 * Calculate blended return based on asset allocation
 */
export function calculateBlendedReturn(
  equitiesPercent: Decimal,
  bondsPercent: Decimal,
  cashPercent: Decimal
): Decimal {
  const equitiesReturn = equitiesPercent.div(100).mul(HISTORICAL_RETURNS.equities.mean)
  const bondsReturn = bondsPercent.div(100).mul(HISTORICAL_RETURNS.bonds.mean)
  const cashReturn = cashPercent.div(100).mul(HISTORICAL_RETURNS.cash.mean)

  return equitiesReturn.plus(bondsReturn).plus(cashReturn)
}

/**
 * Calculate blended volatility (standard deviation) based on asset allocation
 * Simplified calculation assuming no correlation between asset classes
 */
export function calculateBlendedVolatility(
  equitiesPercent: Decimal,
  bondsPercent: Decimal,
  cashPercent: Decimal
): Decimal {
  const equitiesWeight = equitiesPercent.div(100)
  const bondsWeight = bondsPercent.div(100)
  const cashWeight = cashPercent.div(100)

  // Variance calculation (assuming independence)
  const variance = equitiesWeight
    .pow(2)
    .mul(HISTORICAL_RETURNS.equities.stdDev.pow(2))
    .plus(bondsWeight.pow(2).mul(HISTORICAL_RETURNS.bonds.stdDev.pow(2)))
    .plus(cashWeight.pow(2).mul(HISTORICAL_RETURNS.cash.stdDev.pow(2)))

  // Return standard deviation (square root of variance)
  return new Decimal(Math.sqrt(variance.toNumber()))
}

/**
 * Get life expectancy for a given age
 */
export function getLifeExpectancy(age: number): number {
  if (age < 50) return 85
  if (age >= 85) return 92

  // Find closest age in table
  const ages = Object.keys(LIFE_EXPECTANCY).map(Number).sort((a, b) => a - b)
  const closestAge = ages.reduce((prev, curr) =>
    Math.abs(curr - age) < Math.abs(prev - age) ? curr : prev
  )

  return LIFE_EXPECTANCY[closestAge]
}
