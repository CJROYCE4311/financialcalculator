'use client'

import React from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CalculatorNavigation } from '@/components/layout/CalculatorNavigation'
import { CurrencyInput } from '@/components/forms/CurrencyInput'
import { formatCurrency } from '@/lib/formatters/currency'
import { formatPercentage } from '@/lib/formatters/percentage'

export default function SocialSecurityPage() {
  const {
    socialSecurity,
    updateSocialSecurityInputs,
    calculateSocialSecurity,
    resetSocialSecurity,
  } = useCalculatorStore()

  const { inputs, results } = socialSecurity

  const handleCalculate = () => {
    calculateSocialSecurity()
  }

  const handleReset = () => {
    resetSocialSecurity()
  }

  const getClaimingAdvice = (age: number, fra: number) => {
    if (age < fra) {
      return {
        type: 'warning',
        message: `Claiming before Full Retirement Age (${fra}) results in permanently reduced benefits.`,
      }
    } else if (age === fra) {
      return {
        type: 'info',
        message: 'Claiming at Full Retirement Age gives you 100% of your benefit.',
      }
    } else {
      return {
        type: 'success',
        message: `Delaying past Full Retirement Age increases your benefit by 8% per year until age 70.`,
      }
    }
  }

  const advice = results ? getClaimingAdvice(inputs.retirementAge, results.fullRetirementAge) : null

  return (
    <div className="min-h-screen bg-section py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            Social Security Estimator
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Estimate your Social Security retirement benefits based on your final salary and
            claiming age. Uses the SSA bend point formula with 2026 values.
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
                  {/* Final Salary */}
                  <CurrencyInput
                    label="Final Annual Salary"
                    id="final-salary"
                    value={inputs.finalSalary}
                    onChange={(value) => updateSocialSecurityInputs({ finalSalary: value })}
                    helperText="Your salary in your highest earning years (simplified estimate)"
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
                        max="70"
                        value={inputs.currentAge}
                        onChange={(e) => updateSocialSecurityInputs({ currentAge: parseInt(e.target.value) || 30 })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label htmlFor="retirement-age" className="block text-sm font-medium text-gray-700 mb-1">
                        Claiming Age
                      </label>
                      <input
                        id="retirement-age"
                        type="number"
                        min="62"
                        max="70"
                        value={inputs.retirementAge}
                        onChange={(e) => updateSocialSecurityInputs({ retirementAge: parseInt(e.target.value) || 67 })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Age 62-70 (FRA is typically 67)
                      </p>
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
                      Estimate Benefits
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

            {/* Claiming Age Guide */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-primary mb-3">Claiming Age Strategy</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-red-700">Age 62 (Earliest)</p>
                    <p className="text-gray-600">Approximately 30% reduction from full benefit</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">Age 67 (Full Retirement Age)</p>
                    <p className="text-gray-600">100% of calculated benefit</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-700">Age 70 (Maximum)</p>
                    <p className="text-gray-600">124% increase (8% per year after FRA)</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-300">
                  <p className="text-xs text-gray-600">
                    <strong>Tip:</strong> Delaying Social Security can significantly increase
                    lifetime benefits if you're healthy and have other income sources.
                  </p>
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
                    <CardTitle>Estimated Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
                        <p className="text-sm text-gray-600">Estimated Annual Benefit</p>
                        <p className="text-3xl font-bold text-primary mt-1">
                          {formatCurrency(results.annualBenefit)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(results.monthlyBenefit)} per month
                        </p>
                      </div>

                      {/* Claiming Age Impact */}
                      {advice && (
                        <div
                          className={`border-l-4 p-4 rounded ${
                            advice.type === 'warning'
                              ? 'bg-yellow-50 border-yellow-500'
                              : advice.type === 'success'
                              ? 'bg-green-50 border-green-500'
                              : 'bg-blue-50 border-blue-500'
                          }`}
                        >
                          <p className="text-sm font-medium">
                            {advice.type === 'warning' && '⚠️ '}
                            {advice.type === 'success' && '✅ '}
                            {advice.type === 'info' && 'ℹ️ '}
                            Claiming at Age {inputs.retirementAge}
                          </p>
                          <p className="text-sm mt-1">{advice.message}</p>
                        </div>
                      )}

                      <div className="bg-section p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Primary Insurance Amount (PIA)</span>
                          <span className="font-semibold">
                            {formatCurrency(results.primaryInsuranceAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Adjustment Factor</span>
                          <span className="font-semibold">
                            {formatPercentage(results.adjustmentFactor.minus(1).toNumber(), {
                              decimals: 1,
                              showSymbol: false,
                            })}
                            {results.adjustmentFactor.greaterThan(1) ? '% increase' : '% reduction'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Full Retirement Age</span>
                          <span className="font-semibold">{results.fullRetirementAge}</span>
                        </div>
                      </div>

                      {/* Comparison Table */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-section">
                            <tr>
                              <th className="px-4 py-2 text-left">Claiming Age</th>
                              <th className="px-4 py-2 text-right">Monthly Benefit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {[62, 65, 67, 70].map((age) => {
                              // Calculate benefit for this age (simplified)
                              const FRA = results.fullRetirementAge
                              let factor = 1
                              if (age < FRA) {
                                const monthsEarly = (FRA - age) * 12
                                if (monthsEarly <= 36) {
                                  factor = 1 - monthsEarly * (5 / 900)
                                } else {
                                  factor = 1 - 36 * (5 / 900) - (monthsEarly - 36) * (5 / 1200)
                                }
                              } else if (age > FRA) {
                                factor = 1 + (age - FRA) * 0.08
                              }
                              const benefit = results.primaryInsuranceAmount.mul(factor)

                              return (
                                <tr
                                  key={age}
                                  className={age === inputs.retirementAge ? 'bg-accent/10 font-semibold' : ''}
                                >
                                  <td className="px-4 py-2">
                                    Age {age}
                                    {age === inputs.retirementAge && ' (Selected)'}
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    {formatCurrency(benefit, { showCents: false })}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <p>
                          <strong>Input salary:</strong> {formatCurrency(inputs.finalSalary, { showCents: false })}
                        </p>
                        <p>
                          <strong>Monthly earnings:</strong>{' '}
                          {formatCurrency(inputs.finalSalary.div(12), { showCents: false })}
                        </p>
                        <p>
                          <strong>Years until claiming:</strong> {Math.max(0, inputs.retirementAge - inputs.currentAge)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SSA Formula Explanation */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-primary mb-2">How It's Calculated</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      The SSA uses a "bend point" formula (2026 values):
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                      <li>90% of first $1,226 of monthly earnings</li>
                      <li>32% of earnings between $1,226 and $7,391</li>
                      <li>15% of earnings above $7,391</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-3">
                      Then adjusted for early/delayed claiming relative to Full Retirement Age.
                    </p>
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <p className="text-xs text-gray-600">
                      <strong>Disclaimer:</strong> This is a simplified estimate based on final salary
                      and does not account for full earnings history, cost-of-living adjustments (COLA),
                      or future policy changes. For an accurate estimate, use the SSA's official calculator
                      at ssa.gov or review your Social Security statement. This is not financial advice.
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Results Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Enter your salary and claiming age, then click "Estimate Benefits"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <CalculatorNavigation currentPath="/calculators/social-security" />
        </div>
      </div>
    </div>
  )
}
