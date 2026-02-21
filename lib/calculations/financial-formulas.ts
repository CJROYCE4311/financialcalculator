import Decimal from 'decimal.js'

/**
 * Core Financial Formulas using Decimal.js for precise calculations
 *
 * IMPORTANT: All monetary calculations must use Decimal to avoid
 * floating-point arithmetic errors. Never use native JavaScript numbers
 * for financial calculations.
 */

// Configure Decimal.js for financial precision
Decimal.set({
  precision: 20, // High precision for accurate calculations
  rounding: Decimal.ROUND_HALF_UP, // Standard rounding (banker's rounding)
  toExpNeg: -7,
  toExpPos: 21,
})

// ============================================================================
// Future Value Calculations
// ============================================================================

/**
 * Calculate Future Value of a present value with compound interest
 * FV = PV × (1 + r)^n
 *
 * @param presentValue - Present value (initial amount)
 * @param rate - Interest rate per period (as decimal, e.g., 0.05 for 5%)
 * @param periods - Number of compounding periods
 * @returns Future value
 */
export function calculateFutureValue(
  presentValue: Decimal,
  rate: Decimal,
  periods: number
): Decimal {
  if (periods === 0) return presentValue

  const onePlusRate = new Decimal(1).plus(rate)
  return presentValue.mul(onePlusRate.pow(periods))
}

/**
 * Calculate Future Value of regular contributions (annuity)
 * FV = PMT × [((1 + r)^n - 1) / r]
 *
 * @param payment - Regular payment amount per period
 * @param rate - Interest rate per period (as decimal)
 * @param periods - Number of periods
 * @returns Future value of annuity
 */
export function calculateFutureValueAnnuity(
  payment: Decimal,
  rate: Decimal,
  periods: number
): Decimal {
  if (periods === 0) return new Decimal(0)

  // Special case: if rate is 0, FV is simply payment × periods
  if (rate.isZero()) {
    return payment.mul(periods)
  }

  const onePlusRate = new Decimal(1).plus(rate)
  const numerator = onePlusRate.pow(periods).minus(1)
  const denominator = rate

  return payment.mul(numerator.div(denominator))
}

/**
 * Calculate Future Value with both present value and regular contributions
 * Combines both FV formulas
 *
 * @param presentValue - Initial amount
 * @param payment - Regular payment per period
 * @param rate - Interest rate per period
 * @param periods - Number of periods
 * @returns Total future value
 */
export function calculateFutureValueTotal(
  presentValue: Decimal,
  payment: Decimal,
  rate: Decimal,
  periods: number
): Decimal {
  const fvPresentValue = calculateFutureValue(presentValue, rate, periods)
  const fvAnnuity = calculateFutureValueAnnuity(payment, rate, periods)

  return fvPresentValue.plus(fvAnnuity)
}

// ============================================================================
// Present Value Calculations
// ============================================================================

/**
 * Calculate Present Value from a future value
 * PV = FV / (1 + r)^n
 *
 * @param futureValue - Future value amount
 * @param rate - Discount rate per period
 * @param periods - Number of periods
 * @returns Present value
 */
export function calculatePresentValue(
  futureValue: Decimal,
  rate: Decimal,
  periods: number
): Decimal {
  if (periods === 0) return futureValue

  const onePlusRate = new Decimal(1).plus(rate)
  return futureValue.div(onePlusRate.pow(periods))
}

/**
 * Calculate Present Value of an annuity (stream of payments)
 * PV = PMT × [(1 - (1 + r)^-n) / r]
 *
 * @param payment - Payment amount per period
 * @param rate - Discount rate per period
 * @param periods - Number of periods
 * @returns Present value of annuity
 */
export function calculatePresentValueAnnuity(
  payment: Decimal,
  rate: Decimal,
  periods: number
): Decimal {
  if (periods === 0) return new Decimal(0)

  // Special case: if rate is 0
  if (rate.isZero()) {
    return payment.mul(periods)
  }

  const onePlusRate = new Decimal(1).plus(rate)
  const numerator = new Decimal(1).minus(onePlusRate.pow(-periods))
  const denominator = rate

  return payment.mul(numerator.div(denominator))
}

// ============================================================================
// Payment (PMT) Calculations
// ============================================================================

/**
 * Calculate monthly payment for a loan
 * PMT = P × [r(1 + r)^n] / [(1 + r)^n - 1]
 *
 * @param principal - Loan principal amount
 * @param rate - Interest rate per period (monthly rate for monthly payments)
 * @param periods - Number of payment periods
 * @returns Payment amount per period
 */
export function calculateLoanPayment(
  principal: Decimal,
  rate: Decimal,
  periods: number
): Decimal {
  if (periods === 0) return new Decimal(0)

  // Special case: if rate is 0, payment is principal / periods
  if (rate.isZero()) {
    return principal.div(periods)
  }

  const onePlusRate = new Decimal(1).plus(rate)
  const onePlusRatePowN = onePlusRate.pow(periods)

  const numerator = rate.mul(onePlusRatePowN)
  const denominator = onePlusRatePowN.minus(1)

  return principal.mul(numerator.div(denominator))
}

// ============================================================================
// Rate Calculations
// ============================================================================

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 * CAGR = (Ending Value / Beginning Value)^(1/years) - 1
 *
 * @param beginningValue - Starting value
 * @param endingValue - Ending value
 * @param years - Number of years
 * @returns Annual growth rate as decimal
 */
export function calculateCAGR(
  beginningValue: Decimal,
  endingValue: Decimal,
  years: number
): Decimal {
  if (years === 0) return new Decimal(0)
  if (beginningValue.isZero()) return new Decimal(0)

  const ratio = endingValue.div(beginningValue)
  const exponent = 1 / years
  const cagr = new Decimal(Math.pow(ratio.toNumber(), exponent)).minus(1)

  return cagr
}

/**
 * Calculate effective annual rate from nominal rate
 * EAR = (1 + r/n)^n - 1
 *
 * @param nominalRate - Nominal annual rate
 * @param compoundingPeriods - Number of compounding periods per year
 * @returns Effective annual rate
 */
export function calculateEffectiveAnnualRate(
  nominalRate: Decimal,
  compoundingPeriods: number
): Decimal {
  if (compoundingPeriods === 0) return new Decimal(0)

  const ratePerPeriod = nominalRate.div(compoundingPeriods)
  const onePlusRate = new Decimal(1).plus(ratePerPeriod)

  return onePlusRate.pow(compoundingPeriods).minus(1)
}

// ============================================================================
// Inflation Adjustment
// ============================================================================

/**
 * Adjust a value for inflation (future value to real/present value)
 * Real Value = Nominal Value / (1 + inflation)^years
 *
 * @param nominalValue - Future nominal value
 * @param inflationRate - Annual inflation rate as decimal
 * @param years - Number of years
 * @returns Real (inflation-adjusted) value
 */
export function adjustForInflation(
  nominalValue: Decimal,
  inflationRate: Decimal,
  years: number
): Decimal {
  if (years === 0) return nominalValue

  const onePlusInflation = new Decimal(1).plus(inflationRate)
  return nominalValue.div(onePlusInflation.pow(years))
}

/**
 * Calculate future nominal value accounting for inflation
 * Future Nominal = Present Value × (1 + inflation)^years
 *
 * @param presentValue - Current value
 * @param inflationRate - Annual inflation rate as decimal
 * @param years - Number of years
 * @returns Future nominal value
 */
export function projectWithInflation(
  presentValue: Decimal,
  inflationRate: Decimal,
  years: number
): Decimal {
  if (years === 0) return presentValue

  const onePlusInflation = new Decimal(1).plus(inflationRate)
  return presentValue.mul(onePlusInflation.pow(years))
}

// ============================================================================
// Retirement-Specific Calculations
// ============================================================================

/**
 * Calculate safe annual withdrawal amount (4% rule)
 * Safe Withdrawal = Portfolio Value × Withdrawal Rate
 *
 * @param portfolioValue - Total portfolio value
 * @param withdrawalRate - Annual withdrawal rate (default 4% = 0.04)
 * @returns Safe annual withdrawal amount
 */
export function calculateSafeWithdrawal(
  portfolioValue: Decimal,
  withdrawalRate: Decimal = new Decimal(0.04)
): Decimal {
  return portfolioValue.mul(withdrawalRate)
}

/**
 * Calculate required portfolio value for desired income
 * Required Portfolio = Desired Annual Income / Withdrawal Rate
 *
 * @param desiredAnnualIncome - Desired annual withdrawal
 * @param withdrawalRate - Safe withdrawal rate (default 4% = 0.04)
 * @returns Required portfolio value
 */
export function calculateRequiredPortfolio(
  desiredAnnualIncome: Decimal,
  withdrawalRate: Decimal = new Decimal(0.04)
): Decimal {
  if (withdrawalRate.isZero()) return new Decimal(0)

  return desiredAnnualIncome.div(withdrawalRate)
}

/**
 * Calculate employer 401k match contribution
 *
 * @param employeeContribution - Employee's contribution
 * @param matchPercentage - Employer match percentage (e.g., 50 for 50% match)
 * @param maxMatchPercentOfSalary - Max match as % of salary (optional cap)
 * @param salary - Annual salary (required if maxMatchPercentOfSalary is set)
 * @returns Employer match amount
 */
export function calculateEmployerMatch(
  employeeContribution: Decimal,
  matchPercentage: Decimal,
  maxMatchPercentOfSalary?: Decimal,
  salary?: Decimal
): Decimal {
  const matchAmount = employeeContribution.mul(matchPercentage.div(100))

  // Apply cap if specified
  if (maxMatchPercentOfSalary && salary) {
    const maxMatch = salary.mul(maxMatchPercentOfSalary.div(100))
    return Decimal.min(matchAmount, maxMatch)
  }

  return matchAmount
}

// ============================================================================
// Net Present Value (NPV) & Internal Rate of Return (IRR)
// ============================================================================

/**
 * Calculate Net Present Value of a series of cash flows
 * NPV = Σ [CFt / (1 + r)^t]
 *
 * @param cashFlows - Array of cash flows (can be negative or positive)
 * @param discountRate - Discount rate per period
 * @returns Net present value
 */
export function calculateNPV(
  cashFlows: Decimal[],
  discountRate: Decimal
): Decimal {
  let npv = new Decimal(0)

  cashFlows.forEach((cashFlow, index) => {
    const pv = calculatePresentValue(cashFlow, discountRate, index)
    npv = npv.plus(pv)
  })

  return npv
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate that asset allocation percentages sum to 100
 *
 * @param equities - Equities percentage
 * @param bonds - Bonds percentage
 * @param cash - Cash percentage
 * @returns true if sum equals 100, false otherwise
 */
export function validateAssetAllocation(
  equities: Decimal,
  bonds: Decimal,
  cash: Decimal
): boolean {
  const sum = equities.plus(bonds).plus(cash)
  return sum.equals(100)
}

/**
 * Round a decimal value to specified decimal places for currency
 *
 * @param value - Decimal value to round
 * @param decimalPlaces - Number of decimal places (default 2 for currency)
 * @returns Rounded decimal
 */
export function roundCurrency(
  value: Decimal,
  decimalPlaces: number = 2
): Decimal {
  return value.toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP)
}

/**
 * Round a percentage value
 *
 * @param value - Decimal value to round
 * @param decimalPlaces - Number of decimal places (default 2)
 * @returns Rounded decimal
 */
export function roundPercentage(
  value: Decimal,
  decimalPlaces: number = 2
): Decimal {
  return value.toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP)
}

/**
 * Convert percentage to decimal rate
 * Example: 5% -> 0.05
 *
 * @param percentage - Percentage value
 * @returns Decimal rate
 */
export function percentageToRate(percentage: Decimal): Decimal {
  return percentage.div(100)
}

/**
 * Convert decimal rate to percentage
 * Example: 0.05 -> 5
 *
 * @param rate - Decimal rate
 * @returns Percentage value
 */
export function rateToPercentage(rate: Decimal): Decimal {
  return rate.mul(100)
}
