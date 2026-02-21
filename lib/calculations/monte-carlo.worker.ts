/**
 * Monte Carlo Simulation Web Worker
 * Runs retirement portfolio simulations with random market returns
 * Uses Box-Muller transform for normal distribution sampling
 */

interface SimulationParams {
  iterations: number
  equitiesPercent: number
  bondsPercent: number
  cashPercent: number
  startingBalance: number
  annualWithdrawal: number
  yearsInRetirement: number
  inflationRate: number
}

interface SimulationPath {
  yearByYear: number[]
  success: boolean
  finalBalance: number
}

interface SimulationResults {
  successRate: number
  medianFinalBalance: number
  percentileOutcomes: {
    p5: number[]
    p25: number[]
    p50: number[]
    p75: number[]
    p95: number[]
  }
  allFinalBalances: number[]
  worstCase: number
  bestCase: number
}

// Historical mean returns and standard deviations
const ASSET_CLASS_STATS = {
  equities: { mean: 0.10, stdDev: 0.18 }, // 10% ± 18%
  bonds: { mean: 0.05, stdDev: 0.06 },    // 5% ± 6%
  cash: { mean: 0.02, stdDev: 0.01 },     // 2% ± 1%
}

/**
 * Box-Muller transform to generate normally distributed random numbers
 * Returns a random number from N(0, 1) distribution
 */
function boxMullerRandom(): number {
  let u1 = 0
  let u2 = 0

  // Ensure we don't get exactly 0 (would cause log(0) = -Infinity)
  while (u1 === 0) u1 = Math.random()
  while (u2 === 0) u2 = Math.random()

  // Box-Muller transform
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return z0
}

/**
 * Generate a random return for a single year based on asset allocation
 */
function generateRandomReturn(
  equitiesPercent: number,
  bondsPercent: number,
  cashPercent: number
): number {
  // Generate random returns for each asset class using Box-Muller
  const equitiesReturn = ASSET_CLASS_STATS.equities.mean +
    boxMullerRandom() * ASSET_CLASS_STATS.equities.stdDev

  const bondsReturn = ASSET_CLASS_STATS.bonds.mean +
    boxMullerRandom() * ASSET_CLASS_STATS.bonds.stdDev

  const cashReturn = ASSET_CLASS_STATS.cash.mean +
    boxMullerRandom() * ASSET_CLASS_STATS.cash.stdDev

  // Calculate blended return based on allocation
  const blendedReturn =
    (equitiesPercent / 100) * equitiesReturn +
    (bondsPercent / 100) * bondsReturn +
    (cashPercent / 100) * cashReturn

  return blendedReturn
}

/**
 * Run a single Monte Carlo simulation path
 */
function runSingleSimulation(params: SimulationParams): SimulationPath {
  const {
    equitiesPercent,
    bondsPercent,
    cashPercent,
    startingBalance,
    annualWithdrawal,
    yearsInRetirement,
    inflationRate,
  } = params

  const yearByYear: number[] = []
  let balance = startingBalance
  let currentWithdrawal = annualWithdrawal

  yearByYear.push(balance)

  for (let year = 1; year <= yearsInRetirement; year++) {
    // Generate random return for this year
    const returnRate = generateRandomReturn(equitiesPercent, bondsPercent, cashPercent)

    // Apply return to current balance
    balance = balance * (1 + returnRate)

    // Subtract withdrawal
    balance = balance - currentWithdrawal

    // Track balance (even if negative)
    yearByYear.push(Math.max(0, balance))

    // Inflate withdrawal for next year
    currentWithdrawal = currentWithdrawal * (1 + inflationRate / 100)

    // If balance goes negative, mark as failure but continue simulation
    if (balance < 0) {
      balance = 0
    }
  }

  const finalBalance = balance
  const success = finalBalance > 0

  return {
    yearByYear,
    success,
    finalBalance,
  }
}

/**
 * Calculate percentile value from sorted array
 */
function percentile(sortedArray: number[], p: number): number {
  if (sortedArray.length === 0) return 0

  const index = (p / 100) * (sortedArray.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index % 1

  if (lower === upper) {
    return sortedArray[lower]
  }

  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
}

/**
 * Calculate percentile paths from all simulations
 */
function calculatePercentilePaths(
  allPaths: SimulationPath[],
  yearsInRetirement: number
): {
  p5: number[]
  p25: number[]
  p50: number[]
  p75: number[]
  p95: number[]
} {
  const p5: number[] = []
  const p25: number[] = []
  const p50: number[] = []
  const p75: number[] = []
  const p95: number[] = []

  // For each year, calculate percentiles across all simulations
  for (let year = 0; year <= yearsInRetirement; year++) {
    const balancesAtYear = allPaths.map(path => path.yearByYear[year]).sort((a, b) => a - b)

    p5.push(percentile(balancesAtYear, 5))
    p25.push(percentile(balancesAtYear, 25))
    p50.push(percentile(balancesAtYear, 50))
    p75.push(percentile(balancesAtYear, 75))
    p95.push(percentile(balancesAtYear, 95))
  }

  return { p5, p25, p50, p75, p95 }
}

/**
 * Main worker message handler
 */
self.onmessage = (event: MessageEvent<{ type: string; params?: SimulationParams }>) => {
  const { type, params } = event.data

  if (type !== 'START_SIMULATION' || !params) {
    return
  }

  const { iterations } = params
  const allPaths: SimulationPath[] = []
  const progressInterval = Math.floor(iterations / 100) // Report every 1%

  // Run all simulations
  for (let i = 0; i < iterations; i++) {
    const path = runSingleSimulation(params)
    allPaths.push(path)

    // Report progress every 1%
    if (i > 0 && i % progressInterval === 0) {
      const progress = Math.floor((i / iterations) * 100)
      self.postMessage({
        type: 'PROGRESS',
        progress,
      })
    }
  }

  // Calculate results
  const successfulPaths = allPaths.filter(path => path.success)
  const successRate = (successfulPaths.length / iterations) * 100

  const allFinalBalances = allPaths.map(path => path.finalBalance).sort((a, b) => a - b)
  const medianFinalBalance = percentile(allFinalBalances, 50)
  const worstCase = allFinalBalances[0]
  const bestCase = allFinalBalances[allFinalBalances.length - 1]

  const percentileOutcomes = calculatePercentilePaths(allPaths, params.yearsInRetirement)

  const results: SimulationResults = {
    successRate,
    medianFinalBalance,
    percentileOutcomes,
    allFinalBalances,
    worstCase,
    bestCase,
  }

  // Send final results
  self.postMessage({
    type: 'COMPLETE',
    results,
  })
}

// Export empty object to make TypeScript happy
export {}
