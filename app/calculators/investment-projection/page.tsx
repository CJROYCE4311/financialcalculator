'use client'

import React, { useEffect } from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CurrencyInput } from '@/components/forms/CurrencyInput'
import { PercentageInput } from '@/components/forms/PercentageInput'
import { LinkedSliders } from '@/components/forms/LinkedSliders'
import { PieChart } from '@/components/charts/PieChart'
import { AreaChart } from '@/components/charts/AreaChart'
import { CalculatorNavigation } from '@/components/layout/CalculatorNavigation'
import { formatCurrency } from '@/lib/formatters/currency'
import type { PieChartData, AreaChartData } from '@/types/calculator.types'
import Decimal from 'decimal.js'
import { calculateBlendedReturn } from '@/constants/financial-constants'
import { rateToPercentage } from '@/lib/calculations/financial-formulas'

export default function InvestmentProjectionPage() {
  const {
    investmentProjection,
    updateInvestmentInputs,
    calculateInvestmentProjection,
    resetInvestmentProjection,
  } = useCalculatorStore()

  const { inputs, results } = investmentProjection

  // Auto-calculate on mount if inputs have values
  useEffect(() => {
    if (!results && inputs.currentBalance.greaterThan(0)) {
      calculateInvestmentProjection()
    }
  }, [])

  const handleCalculate = () => {
    calculateInvestmentProjection()
  }

  const handleReset = () => {
    resetInvestmentProjection()
  }

  // Prepare chart data
  const pieChartData: PieChartData[] = results
    ? [
        {
          name: 'Equities',
          value: results.assetAllocation.equities instanceof Decimal
            ? results.assetAllocation.equities.toNumber()
            : Number(results.assetAllocation.equities),
          color: '#3B82F6',
        },
        {
          name: 'Bonds',
          value: results.assetAllocation.bonds instanceof Decimal
            ? results.assetAllocation.bonds.toNumber()
            : Number(results.assetAllocation.bonds),
          color: '#10B981',
        },
        {
          name: 'Cash',
          value: results.assetAllocation.cash instanceof Decimal
            ? results.assetAllocation.cash.toNumber()
            : Number(results.assetAllocation.cash),
          color: '#EAB308',
        },
      ]
    : []

  const areaChartData: AreaChartData[] = results
    ? results.yearByYear.map((year) => ({
        year: year.year,
        age: year.age,
        balance: year.balance instanceof Decimal
          ? year.balance.toNumber()
          : Number(year.balance),
      }))
    : []

  return (
    <div className="min-h-screen bg-section py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            Investment Projection Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Project your investment growth from now until retirement. This calculator
            shows how your current savings, ongoing contributions, and asset allocation
            will grow over time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {/* Current Balance */}
                  <CurrencyInput
                    label="Current Investment Balance"
                    id="current-balance"
                    value={inputs.currentBalance}
                    onChange={(value) => updateInvestmentInputs({ currentBalance: value })}
                    helperText="Total value of your current retirement accounts"
                  />

                  {/* Age Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="current-age" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Age
                      </label>
                      <input
                        id="current-age"
                        type="number"
                        min="18"
                        max="100"
                        value={inputs.currentAge}
                        onChange={(e) => updateInvestmentInputs({ currentAge: parseInt(e.target.value) || 18 })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
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
                        onChange={(e) => updateInvestmentInputs({ retirementAge: parseInt(e.target.value) || 65 })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Annual Investment */}
                  <CurrencyInput
                    label="Annual Investment"
                    id="annual-investment"
                    value={inputs.annualInvestment}
                    onChange={(value) => updateInvestmentInputs({ annualInvestment: value })}
                    helperText="How much you contribute each year"
                  />

                  {/* Employer Match */}
                  <CurrencyInput
                    label="Annual Employer Match"
                    id="employer-match"
                    value={inputs.employerMatchAmount}
                    onChange={(value) => updateInvestmentInputs({ employerMatchAmount: value })}
                    helperText="Total annual dollar amount your employer contributes"
                  />

                  {/* Asset Allocation */}
                  <div className="pt-4 border-t border-gray-200">
                    <LinkedSliders
                      values={{
                        equities: inputs.equitiesPercent,
                        bonds: inputs.bondsPercent,
                        cash: inputs.cashPercent,
                      }}
                      onChange={(values) =>
                        updateInvestmentInputs({
                          equitiesPercent: values.equities,
                          bondsPercent: values.bonds,
                          cashPercent: values.cash,
                        })
                      }
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleCalculate}
                      type="button"
                    >
                      Calculate Projection
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
          </div>

          {/* Results */}
          <div className="space-y-6">
            {results ? (
              <>
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Projection Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
                        <p className="text-sm text-gray-600">Projected Balance at Retirement</p>
                        <p className="text-3xl font-bold text-primary mt-1">
                          {formatCurrency(results.finalBalance)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          At age {inputs.retirementAge} ({inputs.retirementAge - inputs.currentAge} years)
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-section p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Total Contributions</p>
                          <p className="text-xl font-bold text-gray-900 mt-1">
                            {formatCurrency(results.totalContributions, { showCents: false })}
                          </p>
                        </div>
                        <div className="bg-section p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Investment Returns</p>
                          <p className="text-xl font-bold text-green-600 mt-1">
                            {formatCurrency(results.totalReturns, { showCents: false })}
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                        <p className="text-sm text-gray-600">Expected Annual Return</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {rateToPercentage(
                            calculateBlendedReturn(
                              new Decimal(results.assetAllocation.equities),
                              new Decimal(results.assetAllocation.bonds),
                              new Decimal(results.assetAllocation.cash)
                            )
                          ).toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Based on historical averages: Stocks 10%, Bonds 5%, Cash 2%
                        </p>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Years to retirement:</strong> {inputs.retirementAge - inputs.currentAge}
                        </p>
                        <p>
                          <strong>Contribution rate:</strong>{' '}
                          {formatCurrency(inputs.annualInvestment)} per year
                          {(inputs.employerMatchAmount instanceof Decimal
                            ? inputs.employerMatchAmount.greaterThan(0)
                            : Number(inputs.employerMatchAmount) > 0) && (
                            <span> (+ {formatCurrency(inputs.employerMatchAmount, { showCents: false })} employer match)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Asset Allocation Pie Chart */}
                <Card>
                  <CardContent className="pt-6">
                    <PieChart
                      data={pieChartData}
                      title="Asset Allocation"
                      height={300}
                    />
                  </CardContent>
                </Card>

                {/* Balance Over Time Area Chart */}
                <Card>
                  <CardContent className="pt-6">
                    <AreaChart
                      data={areaChartData}
                      title="Projected Balance Over Time"
                      height={400}
                    />
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <p className="text-xs text-gray-600">
                      <strong>Disclaimer:</strong> This projection is for educational and
                      informational purposes only. Actual returns will vary based on market
                      conditions. Historical average returns are used: 10% for equities, 5% for
                      bonds, 2% for cash. This is not financial advice. Consult with a qualified
                      professional before making investment decisions.
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Results Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Enter your information and click "Calculate Projection" to see your results
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <CalculatorNavigation currentPath="/calculators/investment-projection" />
        </div>
      </div>
    </div>
  )
}
