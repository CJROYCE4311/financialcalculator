'use client'

import React from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CurrencyInput } from '@/components/forms/CurrencyInput'
import { AreaChart } from '@/components/charts/AreaChart'
import { CalculatorNavigation } from '@/components/layout/CalculatorNavigation'
import { formatCurrency } from '@/lib/formatters/currency'
import type { AreaChartData } from '@/types/calculator.types'

export default function PensionPage() {
  const {
    pension,
    updatePensionInputs,
    calculatePension,
    resetPension,
  } = useCalculatorStore()

  const { inputs, results } = pension

  const handleCalculate = () => {
    calculatePension()
  }

  const handleReset = () => {
    resetPension()
  }

  // Prepare chart data
  const incomeChartData: AreaChartData[] = results
    ? results.yearByYear.map((year) => ({
        year: year.year,
        age: year.age,
        balance: year.income.toNumber(),
      }))
    : []

  return (
    <div className="min-h-screen bg-section py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            Pension & Annuity Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Calculate the lifetime value of your pension or annuity income. Model both
            lifetime benefits and fixed-term payments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Pension Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {/* Pension Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pension Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => updatePensionInputs({ pensionType: 'lifetime' })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          inputs.pensionType === 'lifetime'
                            ? 'border-accent bg-accent/10 text-accent font-semibold'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        Lifetime
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePensionInputs({ pensionType: 'fixed-term' })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          inputs.pensionType === 'fixed-term'
                            ? 'border-accent bg-accent/10 text-accent font-semibold'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        Fixed Term
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {inputs.pensionType === 'lifetime'
                        ? 'Payments continue for your estimated lifetime'
                        : 'Payments for a specified number of years'}
                    </p>
                  </div>

                  {/* Annual Benefit */}
                  <CurrencyInput
                    label="Annual Pension Benefit"
                    id="annual-benefit"
                    value={inputs.annualBenefit}
                    onChange={(value) => updatePensionInputs({ annualBenefit: value })}
                    helperText="Guaranteed annual income from pension or annuity"
                  />

                  {/* Starting Age */}
                  <div>
                    <label htmlFor="starting-age" className="block text-sm font-medium text-gray-700 mb-1">
                      Starting Age
                    </label>
                    <input
                      id="starting-age"
                      type="number"
                      min="50"
                      max="80"
                      value={inputs.startingAge}
                      onChange={(e) => updatePensionInputs({ startingAge: parseInt(e.target.value) || 65 })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Age when pension payments begin
                    </p>
                  </div>

                  {/* Term Years (only for fixed-term) */}
                  {inputs.pensionType === 'fixed-term' && (
                    <div>
                      <label htmlFor="term-years" className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Years
                      </label>
                      <input
                        id="term-years"
                        type="number"
                        min="1"
                        max="50"
                        value={inputs.termYears || 20}
                        onChange={(e) => updatePensionInputs({ termYears: parseInt(e.target.value) || 20 })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        How many years will payments continue?
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
                      Calculate Value
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

            {/* Pension Types Info */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-primary mb-3">Pension Types</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-blue-700">Lifetime (Single Life)</p>
                    <p className="text-gray-600">
                      Payments continue for your entire life based on actuarial tables.
                      Typically offers higher monthly payments.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">Fixed Term (Period Certain)</p>
                    <p className="text-gray-600">
                      Payments guaranteed for a specific number of years (e.g., 10, 20, 30 years).
                      Provides certainty but may have lower payments.
                    </p>
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
                    <CardTitle>Pension Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
                        <p className="text-sm text-gray-600">Annual Income</p>
                        <p className="text-3xl font-bold text-primary mt-1">
                          {formatCurrency(results.annualIncome)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(results.annualIncome.div(12), { showCents: false })} per month
                        </p>
                      </div>

                      <div className="bg-section p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Total Lifetime Value</span>
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(results.totalLifetimeValue, { showCents: false })}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>
                            <strong>Payment period:</strong> {results.yearByYear.length} years
                          </p>
                          <p>
                            <strong>Starting age:</strong> {inputs.startingAge}
                          </p>
                          <p>
                            <strong>Ending age:</strong>{' '}
                            {inputs.startingAge + results.yearByYear.length - 1}
                          </p>
                        </div>
                      </div>

                      {/* Comparison with lump sum */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-sm mb-3">Lump Sum Equivalency</h5>
                        <p className="text-xs text-gray-600 mb-2">
                          If you took a lump sum instead and withdrew the annual benefit amount:
                        </p>
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm">
                            Required lump sum:{' '}
                            <span className="font-bold text-primary">
                              {formatCurrency(results.totalLifetimeValue, { showCents: false })}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Assuming 0% growth (conservative estimate)
                          </p>
                        </div>
                      </div>

                      {/* Key Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-section p-3 rounded">
                          <p className="text-xs text-gray-600">Pension Type</p>
                          <p className="font-semibold capitalize">
                            {inputs.pensionType.replace('-', ' ')}
                          </p>
                        </div>
                        <div className="bg-section p-3 rounded">
                          <p className="text-xs text-gray-600">Total Payments</p>
                          <p className="font-semibold">{results.yearByYear.length}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Income Over Time Chart */}
                <Card>
                  <CardContent className="pt-6">
                    <AreaChart
                      data={incomeChartData}
                      title="Annual Pension Income Over Time"
                      height={350}
                      color="#8B5CF6"
                    />
                  </CardContent>
                </Card>

                {/* Important Considerations */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-primary mb-2">Important Considerations</h4>
                    <ul className="text-sm text-gray-700 space-y-2 ml-4 list-disc">
                      <li>This calculator does not account for cost-of-living adjustments (COLA)</li>
                      <li>Actual lifetime depends on health and actuarial factors</li>
                      <li>Consider survivor benefits if applicable (joint vs. single life)</li>
                      <li>Pension income may be partially taxable</li>
                      <li>Company pension health affects payment security</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <p className="text-xs text-gray-600">
                      <strong>Disclaimer:</strong> This calculator provides estimates for educational
                      purposes only. Actual pension values depend on plan terms, actuarial calculations,
                      survivor options, and other factors. Always review your pension plan documents
                      and consult with a financial advisor before making pension decisions. This is not
                      financial advice.
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
                      d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Results Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Enter your pension details and click "Calculate Value"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <CalculatorNavigation currentPath="/calculators/pension" />
        </div>
      </div>
    </div>
  )
}
