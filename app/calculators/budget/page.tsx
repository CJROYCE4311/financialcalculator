'use client'

import React from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CurrencyInput } from '@/components/forms/CurrencyInput'
import { PercentageInput } from '@/components/forms/PercentageInput'
import { StackedAreaChart } from '@/components/charts/StackedAreaChart'
import { CalculatorNavigation } from '@/components/layout/CalculatorNavigation'
import { formatCurrency } from '@/lib/formatters/currency'
import Decimal from 'decimal.js'

export default function BudgetPage() {
  const {
    budget,
    retirementWithdrawal,
    socialSecurity,
    pension,
    updateBudgetInputs,
    calculateBudget,
    resetBudget,
  } = useCalculatorStore()

  const { inputs, results } = budget

  const handleCalculate = () => {
    calculateBudget()
  }

  const handleReset = () => {
    resetBudget()
  }

  // Check if we have income sources calculated
  const hasIncomeSources =
    retirementWithdrawal.results || socialSecurity.results || pension.results

  // Prepare stacked chart data
  const chartData = results
    ? results.yearByYear.map((year) => ({
        year: year.year,
        age: year.age,
        Withdrawals: year.incomeBreakdown.withdrawals.toNumber(),
        'Social Security': year.incomeBreakdown.socialSecurity.toNumber(),
        Pension: year.incomeBreakdown.pension.toNumber(),
        Expenses: year.totalExpenses.toNumber(),
      }))
    : []

  const incomeDataKeys = [
    { key: 'Withdrawals', name: 'Portfolio Withdrawals', color: '#3B82F6' },
    { key: 'Social Security', name: 'Social Security', color: '#10B981' },
    { key: 'Pension', name: 'Pension/Annuity', color: '#8B5CF6' },
  ]

  return (
    <div className="min-h-screen bg-section py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            Budget & Cash Flow Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Analyze your total retirement income from all sources versus your expenses.
            See if you'll have a surplus or shortfall throughout retirement.
          </p>
        </div>

        {!hasIncomeSources && (
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
                    This calculator aggregates income from other calculators. For best results,
                    complete the Retirement Withdrawal, Social Security, and Pension calculators first.
                    You can still use this calculator to model expenses only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Budget Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {/* Annual Expenses */}
                  <CurrencyInput
                    label="Annual Expenses in Retirement"
                    id="annual-expenses"
                    value={inputs.annualExpenses}
                    onChange={(value) => updateBudgetInputs({ annualExpenses: value })}
                    helperText="Estimated total annual spending (housing, food, healthcare, etc.)"
                  />

                  {/* Inflation Rate */}
                  <PercentageInput
                    label="Expense Inflation Rate"
                    id="inflation-rate"
                    value={inputs.inflationRate}
                    onChange={(value) => updateBudgetInputs({ inflationRate: value })}
                    max={10}
                    helperText="How much expenses increase each year (typically 3%)"
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
                        onChange={(e) => updateBudgetInputs({ retirementAge: parseInt(e.target.value) || 65 })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label htmlFor="years-to-project" className="block text-sm font-medium text-gray-700 mb-1">
                        Years to Project
                      </label>
                      <input
                        id="years-to-project"
                        type="number"
                        min="1"
                        max="50"
                        value={inputs.yearsToProject}
                        onChange={(e) => updateBudgetInputs({ yearsToProject: parseInt(e.target.value) || 30 })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Income Source Summary */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-sm mb-3">Income Sources (from other calculators)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Portfolio Withdrawals:</span>
                        <span className={retirementWithdrawal.results ? 'font-semibold text-green-700' : 'text-gray-400'}>
                          {retirementWithdrawal.results
                            ? formatCurrency(retirementWithdrawal.results.annualWithdrawal, { showCents: false })
                            : 'Not calculated'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Social Security:</span>
                        <span className={socialSecurity.results ? 'font-semibold text-green-700' : 'text-gray-400'}>
                          {socialSecurity.results
                            ? formatCurrency(socialSecurity.results.annualBenefit, { showCents: false })
                            : 'Not calculated'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pension/Annuity:</span>
                        <span className={pension.results ? 'font-semibold text-green-700' : 'text-gray-400'}>
                          {pension.results
                            ? formatCurrency(pension.results.annualIncome, { showCents: false })
                            : 'Not calculated'}
                        </span>
                      </div>
                    </div>
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
                      Analyze Cash Flow
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
                    <CardTitle>Cash Flow Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Total Income vs Expenses */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                          <p className="text-sm text-gray-600">Total Lifetime Income</p>
                          <p className="text-2xl font-bold text-green-700 mt-1">
                            {formatCurrency(results.totalLifetimeIncome, { showCents: false })}
                          </p>
                        </div>
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                          <p className="text-sm text-gray-600">Total Lifetime Expenses</p>
                          <p className="text-2xl font-bold text-red-700 mt-1">
                            {formatCurrency(results.totalLifetimeExpenses, { showCents: false })}
                          </p>
                        </div>
                      </div>

                      {/* Average Surplus/Deficit */}
                      <div
                        className={`border-l-4 p-4 rounded ${
                          results.averageSurplus.greaterThan(0)
                            ? 'bg-green-50 border-green-500'
                            : 'bg-red-50 border-red-500'
                        }`}
                      >
                        <p className="text-sm text-gray-600">Average Annual Surplus/Deficit</p>
                        <p
                          className={`text-3xl font-bold mt-1 ${
                            results.averageSurplus.greaterThan(0) ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {results.averageSurplus.greaterThan(0) ? '+' : ''}
                          {formatCurrency(results.averageSurplus, { showCents: false })}
                        </p>
                      </div>

                      {/* Years with Deficit */}
                      {results.yearsWithDeficit > 0 && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                          <p className="text-sm font-semibold text-yellow-800">⚠️ Deficit Warning</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            {results.yearsWithDeficit} out of {inputs.yearsToProject} years show a deficit
                            (expenses exceed income)
                          </p>
                        </div>
                      )}

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Projection period:</strong> {inputs.yearsToProject} years (ages{' '}
                          {inputs.retirementAge} - {inputs.retirementAge + inputs.yearsToProject - 1})
                        </p>
                        <p>
                          <strong>Starting expenses:</strong>{' '}
                          {formatCurrency(inputs.annualExpenses, { showCents: false })}
                        </p>
                        <p>
                          <strong>Final year expenses:</strong>{' '}
                          {formatCurrency(
                            results.yearByYear[results.yearByYear.length - 1].totalExpenses,
                            { showCents: false }
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Income Sources Stacked Chart */}
                <Card>
                  <CardContent className="pt-6">
                    <StackedAreaChart
                      data={chartData}
                      dataKeys={incomeDataKeys}
                      title="Income Sources Over Time"
                      height={350}
                    />
                  </CardContent>
                </Card>

                {/* Year-by-Year Table (First 5 and Last 5 years) */}
                <Card>
                  <CardHeader>
                    <CardTitle>Year-by-Year Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-section">
                          <tr>
                            <th className="px-3 py-2 text-left">Age</th>
                            <th className="px-3 py-2 text-right">Income</th>
                            <th className="px-3 py-2 text-right">Expenses</th>
                            <th className="px-3 py-2 text-right">Surplus</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {results.yearByYear.slice(0, 5).map((year) => (
                            <tr key={year.year}>
                              <td className="px-3 py-2">{year.age}</td>
                              <td className="px-3 py-2 text-right text-green-700">
                                {formatCurrency(year.totalIncome, { showCents: false, compact: true })}
                              </td>
                              <td className="px-3 py-2 text-right text-red-700">
                                {formatCurrency(year.totalExpenses, { showCents: false, compact: true })}
                              </td>
                              <td
                                className={`px-3 py-2 text-right font-semibold ${
                                  year.surplus.greaterThan(0) ? 'text-green-700' : 'text-red-700'
                                }`}
                              >
                                {year.surplus.greaterThan(0) ? '+' : ''}
                                {formatCurrency(year.surplus, { showCents: false, compact: true })}
                              </td>
                            </tr>
                          ))}
                          {results.yearByYear.length > 10 && (
                            <tr>
                              <td colSpan={4} className="px-3 py-2 text-center text-gray-400">
                                ... {results.yearByYear.length - 10} more years ...
                              </td>
                            </tr>
                          )}
                          {results.yearByYear.slice(-5).map((year) => (
                            <tr key={year.year}>
                              <td className="px-3 py-2">{year.age}</td>
                              <td className="px-3 py-2 text-right text-green-700">
                                {formatCurrency(year.totalIncome, { showCents: false, compact: true })}
                              </td>
                              <td className="px-3 py-2 text-right text-red-700">
                                {formatCurrency(year.totalExpenses, { showCents: false, compact: true })}
                              </td>
                              <td
                                className={`px-3 py-2 text-right font-semibold ${
                                  year.surplus.greaterThan(0) ? 'text-green-700' : 'text-red-700'
                                }`}
                              >
                                {year.surplus.greaterThan(0) ? '+' : ''}
                                {formatCurrency(year.surplus, { showCents: false, compact: true })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <p className="text-xs text-gray-600">
                      <strong>Disclaimer:</strong> This analysis assumes constant expense patterns
                      adjusted for inflation and does not account for unexpected costs, healthcare
                      expenses, or lifestyle changes. Actual expenses in retirement may vary
                      significantly. This is for educational purposes only and is not financial advice.
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
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Results Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Enter your budget information and click "Analyze Cash Flow"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <CalculatorNavigation currentPath="/calculators/budget" />
        </div>
      </div>
    </div>
  )
}
