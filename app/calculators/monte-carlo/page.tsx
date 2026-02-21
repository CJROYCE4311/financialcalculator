'use client'

import React, { useEffect } from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CurrencyInput } from '@/components/forms/CurrencyInput'
import { PercentageInput } from '@/components/forms/PercentageInput'
import { LinkedSliders } from '@/components/forms/LinkedSliders'
import { FanChart } from '@/components/charts/FanChart'
import { SuccessGauge } from '@/components/charts/SuccessGauge'
import { CalculatorNavigation } from '@/components/layout/CalculatorNavigation'
import { formatCurrency } from '@/lib/formatters/currency'
import type { FanChartData } from '@/types/calculator.types'
import Decimal from 'decimal.js'

export default function MonteCarloPage() {
  const {
    monteCarlo,
    retirementWithdrawal,
    investmentProjection,
    updateMonteCarloInputs,
    startMonteCarloSimulation,
    resetMonteCarlo,
  } = useCalculatorStore()

  const { inputs, results, isRunning, progress } = monteCarlo

  // Auto-populate from other calculators on mount
  useEffect(() => {
    // Only auto-populate if we haven't run the simulation yet
    if (!results && !isRunning) {
      const updates: any = {}

      // Get starting balance from Investment Projection or Retirement Withdrawal
      if (investmentProjection.results) {
        updates.startingBalance = investmentProjection.results.finalBalance
        updates.equitiesPercent = investmentProjection.inputs.equitiesPercent
        updates.bondsPercent = investmentProjection.inputs.bondsPercent
        updates.cashPercent = investmentProjection.inputs.cashPercent
      } else if (retirementWithdrawal.inputs.startingBalance.greaterThan(0)) {
        updates.startingBalance = retirementWithdrawal.inputs.startingBalance
      }

      // Get withdrawal amount from Retirement Withdrawal
      if (retirementWithdrawal.results) {
        updates.annualWithdrawal = retirementWithdrawal.results.annualWithdrawal
        updates.yearsInRetirement = retirementWithdrawal.inputs.yearsInRetirement
        updates.inflationRate = retirementWithdrawal.inputs.inflationRate
      }

      // Only update if we have meaningful data
      if (Object.keys(updates).length > 0) {
        updateMonteCarloInputs(updates)
      }
    }
  }, []) // Run only on mount

  const handleStartSimulation = () => {
    startMonteCarloSimulation()
  }

  const handleReset = () => {
    resetMonteCarlo()
  }

  // Prepare fan chart data
  const fanChartData: FanChartData[] = results
    ? results.percentileOutcomes.p5.map((_, index) => ({
        year: index,
        p5: results.percentileOutcomes.p5[index].toNumber(),
        p25: results.percentileOutcomes.p25[index].toNumber(),
        p50: results.percentileOutcomes.p50[index].toNumber(),
        p75: results.percentileOutcomes.p75[index].toNumber(),
        p95: results.percentileOutcomes.p95[index].toNumber(),
      }))
    : []

  const hasRequiredData =
    inputs.startingBalance.greaterThan(0) && inputs.annualWithdrawal.greaterThan(0)

  // Quick iteration option (for testing)
  const quickIterations = 10000

  return (
    <div className="min-h-screen bg-section py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            Monte Carlo Simulation
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Stress-test your retirement plan across 1 million randomized market scenarios.
            See the probability your portfolio will last throughout retirement.
          </p>
        </div>

        {!hasRequiredData && (
          <Card className="mb-8 bg-yellow-50 border-yellow-300">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Complete Other Calculators First
                  </h4>
                  <p className="text-sm text-yellow-800">
                    For best results, complete the Investment Projection and Retirement Withdrawal
                    calculators first. This will auto-populate your starting balance and withdrawal
                    amounts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Simulation Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {/* Starting Balance */}
                  <CurrencyInput
                    label="Starting Portfolio Balance"
                    id="starting-balance"
                    value={inputs.startingBalance}
                    onChange={(value) => updateMonteCarloInputs({ startingBalance: value })}
                    helperText="Portfolio value at start of retirement"
                  />

                  {/* Annual Withdrawal */}
                  <CurrencyInput
                    label="First Year Withdrawal"
                    id="annual-withdrawal"
                    value={inputs.annualWithdrawal}
                    onChange={(value) => updateMonteCarloInputs({ annualWithdrawal: value })}
                    helperText="Amount withdrawn in year 1 (increases with inflation)"
                  />

                  {/* Asset Allocation */}
                  <LinkedSliders
                    values={{
                      equities: inputs.equitiesPercent,
                      bonds: inputs.bondsPercent,
                      cash: inputs.cashPercent,
                    }}
                    onChange={(values) =>
                      updateMonteCarloInputs({
                        equitiesPercent: values.equities,
                        bondsPercent: values.bonds,
                        cashPercent: values.cash,
                      })
                    }
                  />

                  {/* Years in Retirement */}
                  <div>
                    <label
                      htmlFor="years-retirement"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Years in Retirement
                    </label>
                    <input
                      id="years-retirement"
                      type="number"
                      min="1"
                      max="50"
                      value={inputs.yearsInRetirement}
                      onChange={(e) =>
                        updateMonteCarloInputs({
                          yearsInRetirement: parseInt(e.target.value) || 30,
                        })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                    />
                  </div>

                  {/* Inflation Rate */}
                  <PercentageInput
                    label="Inflation Rate"
                    id="inflation-rate"
                    value={inputs.inflationRate}
                    onChange={(value) => updateMonteCarloInputs({ inflationRate: value })}
                    max={10}
                    helperText="Annual increase in withdrawals"
                  />

                  {/* Iterations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Simulation Iterations
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateMonteCarloInputs({ iterations: quickIterations })}
                        className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                          inputs.iterations === quickIterations
                            ? 'bg-accent text-white border-accent'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Quick (10K)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateMonteCarloInputs({ iterations: 1000000 })}
                        className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                          inputs.iterations === 1000000
                            ? 'bg-accent text-white border-accent'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Full (1M)
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Quick mode for testing (~1-2 sec), Full for accurate results (~10-30 sec)
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-3 pt-4">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleStartSimulation}
                      type="button"
                      disabled={isRunning || !hasRequiredData}
                    >
                      {isRunning ? 'Running...' : 'Start Simulation'}
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      fullWidth
                      onClick={handleReset}
                      type="button"
                      disabled={isRunning}
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Bar */}
            {isRunning && (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Running Simulation...
                    </h3>
                    <p className="text-sm text-gray-600">
                      Processing {inputs.iterations.toLocaleString()} market scenarios
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-accent h-4 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">{progress}% complete</p>
                </CardContent>
              </Card>
            )}

            {results && !isRunning && (
              <>
                {/* Success Gauge */}
                <Card>
                  <CardContent className="py-8">
                    <SuccessGauge successRate={results.successRate.toNumber()} />
                  </CardContent>
                </Card>

                {/* Statistics Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Outcome Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <p className="text-sm text-gray-600">Best Case (95th)</p>
                        <p className="text-xl font-bold text-green-700 mt-1">
                          {formatCurrency(results.bestCase, { showCents: false })}
                        </p>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <p className="text-sm text-gray-600">Median (50th)</p>
                        <p className="text-xl font-bold text-blue-700 mt-1">
                          {formatCurrency(results.medianFinalBalance, { showCents: false })}
                        </p>
                      </div>
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                        <p className="text-sm text-gray-600">Worst Case (5th)</p>
                        <p className="text-xl font-bold text-orange-700 mt-1">
                          {formatCurrency(results.worstCase, { showCents: false })}
                        </p>
                      </div>
                      <div
                        className={`border-l-4 p-4 rounded ${
                          results.successRate.greaterThanOrEqualTo(75)
                            ? 'bg-green-50 border-green-500'
                            : 'bg-red-50 border-red-500'
                        }`}
                      >
                        <p className="text-sm text-gray-600">Success Rate</p>
                        <p
                          className={`text-xl font-bold mt-1 ${
                            results.successRate.greaterThanOrEqualTo(75)
                              ? 'text-green-700'
                              : 'text-red-700'
                          }`}
                        >
                          {results.successRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                      <p>
                        <strong>Simulation details:</strong> {inputs.iterations.toLocaleString()}{' '}
                        scenarios over {inputs.yearsInRetirement} years
                      </p>
                      <p>
                        <strong>Withdrawal strategy:</strong>{' '}
                        {formatCurrency(inputs.annualWithdrawal, { showCents: false })} initially,
                        increasing {inputs.inflationRate.toFixed(1)}% annually
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Fan Chart */}
                <Card>
                  <CardContent className="pt-6">
                    <FanChart
                      data={fanChartData}
                      title="Portfolio Balance Over Time (Percentiles)"
                      height={400}
                    />
                  </CardContent>
                </Card>

                {/* Interpretation */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-blue-900 mb-3">💡 What This Means</h4>
                    <div className="text-sm text-blue-800 space-y-2">
                      {results.successRate.greaterThanOrEqualTo(90) ? (
                        <p>
                          ✅ <strong>Excellent plan:</strong> Your retirement strategy shows strong
                          resilience. In {results.successRate.toFixed(1)}% of scenarios, your
                          portfolio successfully funded your entire retirement.
                        </p>
                      ) : results.successRate.greaterThanOrEqualTo(75) ? (
                        <p>
                          ✓ <strong>Good plan:</strong> Your strategy is generally sound with a{' '}
                          {results.successRate.toFixed(1)}% success rate, though there's room to
                          improve confidence.
                        </p>
                      ) : results.successRate.greaterThanOrEqualTo(50) ? (
                        <p>
                          ⚠️ <strong>Moderate risk:</strong> With a{' '}
                          {results.successRate.toFixed(1)}% success rate, your plan has meaningful
                          risk. Consider reducing withdrawals, working longer, or delaying Social
                          Security.
                        </p>
                      ) : (
                        <p>
                          🚨 <strong>High risk:</strong> Your {results.successRate.toFixed(1)}%
                          success rate indicates substantial risk of running out of money.
                          Strategic changes are strongly recommended.
                        </p>
                      )}
                      <p>
                        The fan chart shows the range of outcomes. A robust plan keeps even the 5th
                        percentile (pessimistic) line above zero throughout retirement.
                      </p>
                      {results.worstCase.lessThanOrEqualTo(0) && (
                        <p className="font-semibold text-red-700">
                          ⚠️ Warning: In the worst-case scenarios (bottom 5%), the portfolio is
                          depleted before the end of retirement.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <p className="text-xs text-gray-600">
                      <strong>Disclaimer:</strong> Monte Carlo simulations use historical market
                      data and random sampling to project future scenarios. Results are estimates
                      only and do not guarantee future performance. Actual market conditions,
                      sequence of returns, taxes, and life events can significantly impact outcomes.
                      This is for educational purposes only and is not financial advice.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            {!results && !isRunning && (
              <Card>
                <CardContent className="py-16 text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Simulation Results Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Configure your parameters and click "Start Simulation" to begin
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <CalculatorNavigation currentPath="/calculators/monte-carlo" />
        </div>
      </div>
    </div>
  )
}
