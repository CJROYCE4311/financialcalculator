'use client'

import React, { useEffect } from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CurrencyInput } from '@/components/forms/CurrencyInput'
import { PercentageInput } from '@/components/forms/PercentageInput'
import { AreaChart } from '@/components/charts/AreaChart'
import { CalculatorNavigation } from '@/components/layout/CalculatorNavigation'
import { formatCurrency } from '@/lib/formatters/currency'
import type { AreaChartData } from '@/types/calculator.types'
import { calculateBlendedReturn } from '@/constants/financial-constants'
import { rateToPercentage } from '@/lib/calculations/financial-formulas'
import Decimal from 'decimal.js'

export default function RetirementWithdrawalPage() {
  const {
    retirementWithdrawal,
    investmentProjection,
    updateWithdrawalInputs,
    calculateRetirementWithdrawal,
    resetRetirementWithdrawal,
  } = useCalculatorStore()

  const { inputs, results } = retirementWithdrawal

  // Auto-fill from Investment Projection if available
  useEffect(() => {
    if (
      investmentProjection.results &&
      inputs.startingBalance.isZero()
    ) {
      updateWithdrawalInputs({
        startingBalance: investmentProjection.results.finalBalance,
        retirementAge: investmentProjection.inputs.retirementAge,
      })
    }
  }, [investmentProjection.results])

  const handleCalculate = () => {
    calculateRetirementWithdrawal()
  }

  const handleReset = () => {
    resetRetirementWithdrawal()
  }

  // Prepare chart data for withdrawals over time
  const withdrawalChartData: AreaChartData[] = results
    ? results.yearByYear.map((year) => ({
        year: year.year,
        age: year.age,
        balance: year.inflationAdjusted.toNumber(),
      }))
    : []

  // Prepare chart data for remaining balance
  const balanceChartData: AreaChartData[] = results
    ? results.yearByYear.map((year) => ({
        year: year.year,
        age: year.age,
        balance: year.remainingBalance.toNumber(),
      }))
    : []

  return (
    <div className="min-h-screen bg-section py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            Retirement Withdrawal Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Calculate sustainable withdrawal rates for your retirement based on the 4% rule.
            See how inflation-adjusted withdrawals impact your portfolio over time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {/* Starting Balance */}
                  <div>
                    <CurrencyInput
                      label="Starting Portfolio Balance"
                      id="starting-balance"
                      value={inputs.startingBalance}
                      onChange={(value) => updateWithdrawalInputs({ startingBalance: value })}
                      helperText={
                        investmentProjection.results
                          ? `Auto-filled from Investment Projection: ${formatCurrency(investmentProjection.results.finalBalance, { showCents: false })}`
                          : 'Total portfolio value at retirement'
                      }
                    />
                  </div>

                  {/* Withdrawal Rate */}
                  <PercentageInput
                    label="Annual Withdrawal Rate"
                    id="withdrawal-rate"
                    value={inputs.withdrawalRate}
                    onChange={(value) => updateWithdrawalInputs({ withdrawalRate: value })}
                    max={10}
                    helperText="The 4% rule is considered safe. Higher rates increase risk of running out."
                  />

                  {/* Inflation Rate */}
                  <PercentageInput
                    label="Expected Inflation Rate"
                    id="inflation-rate"
                    value={inputs.inflationRate}
                    onChange={(value) => updateWithdrawalInputs({ inflationRate: value })}
                    max={10}
                    helperText="Withdrawals increase each year to maintain purchasing power"
                  />

                  {/* Retirement Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="retirement-age" className="block text-sm font-medium text-gray-700 mb-1">
                        Retirement Age
                      </label>
                      <input
                        id="retirement-age"
                        type="number"
                        min="50"
                        max="75"
                        value={inputs.retirementAge}
                        onChange={(e) => updateWithdrawalInputs({ retirementAge: parseInt(e.target.value) || 65 })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label htmlFor="years-in-retirement" className="block text-sm font-medium text-gray-700 mb-1">
                        Years in Retirement
                      </label>
                      <input
                        id="years-in-retirement"
                        type="number"
                        min="1"
                        max="50"
                        value={inputs.yearsInRetirement}
                        onChange={(e) => updateWithdrawalInputs({ yearsInRetirement: parseInt(e.target.value) || 30 })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Portfolio Return Info */}
                  {investmentProjection.inputs && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-sm text-gray-700">
                        <strong>Portfolio Return Rate:</strong>{' '}
                        {rateToPercentage(
                          calculateBlendedReturn(
                            new Decimal(investmentProjection.inputs.equitiesPercent),
                            new Decimal(investmentProjection.inputs.bondsPercent),
                            new Decimal(investmentProjection.inputs.cashPercent)
                          )
                        ).toFixed(2)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Using asset allocation from Investment Projection calculator
                      </p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleCalculate}
                      type="button"
                    >
                      Calculate Withdrawals
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleReset}
                      type="button"
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Withdrawal Rate Guide */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-primary mb-3">Withdrawal Rate Guide</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">≤ 3.5%</span>
                    <span className="text-gray-600">Very Conservative - High Safety</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">4.0%</span>
                    <span className="text-gray-600">Traditional Safe Withdrawal Rate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-700 font-medium">4.5-5%</span>
                    <span className="text-gray-600">Moderate - Some Risk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700 font-medium">&gt; 5%</span>
                    <span className="text-gray-600">Aggressive - High Risk</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {results ? (
              <>
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Withdrawal Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
                        <p className="text-sm text-gray-600">First Year Annual Withdrawal</p>
                        <p className="text-3xl font-bold text-primary mt-1">
                          {formatCurrency(results.annualWithdrawal)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(results.annualWithdrawal.div(12), { showCents: false })} per month
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-section p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Total Withdrawn</p>
                          <p className="text-xl font-bold text-gray-900 mt-1">
                            {formatCurrency(results.totalWithdrawn, { showCents: false })}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Investment Growth</p>
                          <p className="text-xl font-bold text-green-600 mt-1">
                            {formatCurrency(results.totalReturnsEarned, { showCents: false })}
                          </p>
                        </div>
                        <div className="bg-section p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Final Balance</p>
                          <p className="text-xl font-bold text-gray-900 mt-1">
                            {formatCurrency(
                              results.yearByYear[results.yearByYear.length - 1].remainingBalance,
                              { showCents: false }
                            )}
                          </p>
                        </div>
                      </div>

                      {results.balanceDepletionYear !== null && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                          <p className="text-sm font-semibold text-red-800">⚠️ Warning</p>
                          <p className="text-sm text-red-700 mt-1">
                            Portfolio depletes in year {results.balanceDepletionYear} (age{' '}
                            {inputs.retirementAge + results.balanceDepletionYear})
                          </p>
                          <p className="text-xs text-red-600 mt-2">
                            Consider reducing withdrawal rate or increasing starting balance.
                          </p>
                        </div>
                      )}

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Withdrawal rate:</strong> {inputs.withdrawalRate.toFixed(1)}%
                        </p>
                        <p>
                          <strong>Inflation adjustment:</strong> {inputs.inflationRate.toFixed(1)}% annually
                        </p>
                        <p>
                          <strong>Final year withdrawal:</strong>{' '}
                          {formatCurrency(
                            results.yearByYear[results.yearByYear.length - 1].inflationAdjusted,
                            { showCents: false }
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Annual Withdrawals Chart */}
                <Card>
                  <CardContent className="pt-6">
                    <AreaChart
                      data={withdrawalChartData}
                      title="Inflation-Adjusted Annual Withdrawals"
                      height={350}
                      color="#10B981"
                    />
                  </CardContent>
                </Card>

                {/* Remaining Balance Chart */}
                <Card>
                  <CardContent className="pt-6">
                    <AreaChart
                      data={balanceChartData}
                      title="Remaining Portfolio Balance Over Time"
                      height={350}
                      color="#3B82F6"
                    />
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <p className="text-xs text-gray-600">
                      <strong>Disclaimer:</strong> The 4% rule is based on historical data and assumes
                      a balanced portfolio. Actual results will vary based on market conditions, investment
                      returns, and personal circumstances. Portfolio growth during retirement is based on
                      your asset allocation from the Investment Projection calculator. Consult with a
                      financial professional for personalized advice.
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Results Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Enter your withdrawal parameters and click "Calculate Withdrawals"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <CalculatorNavigation currentPath="/calculators/retirement-withdrawal" />
        </div>
      </div>
    </div>
  )
}
