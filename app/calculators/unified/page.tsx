'use client'

import React, { useState } from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CurrencyInput } from '@/components/forms/CurrencyInput'
import { PercentageInput } from '@/components/forms/PercentageInput'
import { LinkedSliders } from '@/components/forms/LinkedSliders'
import { formatCurrency } from '@/lib/formatters/currency'
import { CalculatorNavigation } from '@/components/layout/CalculatorNavigation'
import Link from 'next/link'

export default function UnifiedPlanningPage() {
  const {
    // Get all update functions
    updateInvestmentInputs,
    updateWithdrawalInputs,
    updateSocialSecurityInputs,
    updatePensionInputs,
    updateBudgetInputs,
    // Get all calculation functions
    calculateInvestmentProjection,
    calculateRetirementWithdrawal,
    calculateSocialSecurity,
    calculatePension,
    calculateBudget,
    // Get current state for display
    investmentProjection,
    retirementWithdrawal,
    socialSecurity,
    pension,
    budget,
  } = useCalculatorStore()

  const [isCalculating, setIsCalculating] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    demographics: true,
    investment: true,
    retirement: false,
    income: false,
    expenses: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  const handleCalculateAll = () => {
    setIsCalculating(true)

    // Execute in dependency order
    calculateInvestmentProjection() // Auto-updates withdrawal
    calculateRetirementWithdrawal() // Uses investment results
    calculateSocialSecurity()
    calculatePension()
    calculateBudget() // Aggregates all income

    setIsCalculating(false)

    // Collapse input sections
    setExpandedSections({
      demographics: false,
      investment: false,
      retirement: false,
      income: false,
      expenses: false,
    })
  }

  const hasResults = investmentProjection.results !== null

  return (
    <div className="min-h-screen bg-section py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            Complete Financial Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Enter all your financial information in one place and calculate a comprehensive
            retirement plan. This unified view makes it easy to see your complete financial picture.
          </p>
        </div>

        {/* Section 1: Demographics */}
        <Card className="mb-6">
          <button
            onClick={() => toggleSection('demographics')}
            className="w-full text-left flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-2xl font-bold text-primary">Personal Information</h2>
            <span className="text-3xl text-primary">
              {expandedSections.demographics ? '−' : '+'}
            </span>
          </button>

          {expandedSections.demographics && (
            <CardContent className="border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="current-age" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Age
                  </label>
                  <input
                    id="current-age"
                    type="number"
                    min="18"
                    max="100"
                    value={investmentProjection.inputs.currentAge}
                    onChange={(e) => {
                      const age = parseInt(e.target.value) || 18
                      updateInvestmentInputs({ currentAge: age })
                      updateSocialSecurityInputs({ currentAge: age })
                      updateBudgetInputs({ currentAge: age })
                    }}
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
                    value={investmentProjection.inputs.retirementAge}
                    onChange={(e) => {
                      const age = parseInt(e.target.value) || 65
                      updateInvestmentInputs({ retirementAge: age })
                      updateWithdrawalInputs({ retirementAge: age })
                      updateBudgetInputs({ retirementAge: age })
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                  />
                </div>
                <div className="md:col-span-2">
                  <CurrencyInput
                    label="Final Salary (for Social Security)"
                    id="final-salary"
                    value={socialSecurity.inputs.finalSalary}
                    onChange={(value) => updateSocialSecurityInputs({ finalSalary: value })}
                    helperText="Used to estimate Social Security benefits"
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Section 2: Investment & Savings */}
        <Card className="mb-6">
          <button
            onClick={() => toggleSection('investment')}
            className="w-full text-left flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-2xl font-bold text-primary">Investment & Savings</h2>
            <span className="text-3xl text-primary">
              {expandedSections.investment ? '−' : '+'}
            </span>
          </button>

          {expandedSections.investment && (
            <CardContent className="border-t border-gray-200">
              <div className="space-y-4">
                <CurrencyInput
                  label="Current Investment Balance"
                  id="current-balance"
                  value={investmentProjection.inputs.currentBalance}
                  onChange={(value) => updateInvestmentInputs({ currentBalance: value })}
                  helperText="Total value of your current retirement accounts"
                />
                <CurrencyInput
                  label="Annual Investment Contribution"
                  id="annual-investment"
                  value={investmentProjection.inputs.annualInvestment}
                  onChange={(value) => updateInvestmentInputs({ annualInvestment: value })}
                  helperText="How much you contribute each year"
                />
                <CurrencyInput
                  label="Annual Employer Match"
                  id="employer-match"
                  value={investmentProjection.inputs.employerMatchAmount}
                  onChange={(value) => updateInvestmentInputs({ employerMatchAmount: value })}
                  helperText="Total annual dollar amount your employer contributes"
                />

                <div className="pt-4">
                  <LinkedSliders
                    values={{
                      equities: investmentProjection.inputs.equitiesPercent,
                      bonds: investmentProjection.inputs.bondsPercent,
                      cash: investmentProjection.inputs.cashPercent,
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
              </div>
            </CardContent>
          )}
        </Card>

        {/* Section 3: Retirement Withdrawal Strategy */}
        <Card className="mb-6">
          <button
            onClick={() => toggleSection('retirement')}
            className="w-full text-left flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-2xl font-bold text-primary">Retirement Withdrawal</h2>
            <span className="text-3xl text-primary">
              {expandedSections.retirement ? '−' : '+'}
            </span>
          </button>

          {expandedSections.retirement && (
            <CardContent className="border-t border-gray-200">
              <div className="space-y-4">
                <PercentageInput
                  label="Annual Withdrawal Rate"
                  id="withdrawal-rate"
                  value={retirementWithdrawal.inputs.withdrawalRate}
                  onChange={(value) => updateWithdrawalInputs({ withdrawalRate: value })}
                  max={10}
                  helperText="The 4% rule is considered safe"
                />
                <PercentageInput
                  label="Expected Inflation Rate"
                  id="inflation-rate"
                  value={retirementWithdrawal.inputs.inflationRate}
                  onChange={(value) => updateWithdrawalInputs({ inflationRate: value })}
                  max={10}
                  helperText="Withdrawals increase each year to maintain purchasing power"
                />
                <div>
                  <label htmlFor="years-in-retirement" className="block text-sm font-medium text-gray-700 mb-1">
                    Years in Retirement
                  </label>
                  <input
                    id="years-in-retirement"
                    type="number"
                    min="1"
                    max="50"
                    value={retirementWithdrawal.inputs.yearsInRetirement}
                    onChange={(e) => updateWithdrawalInputs({ yearsInRetirement: parseInt(e.target.value) || 30 })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                  />
                  <p className="text-xs text-gray-500 mt-1">How many years to plan for</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Section 4: Income Sources */}
        <Card className="mb-6">
          <button
            onClick={() => toggleSection('income')}
            className="w-full text-left flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-2xl font-bold text-primary">Income Sources</h2>
            <span className="text-3xl text-primary">
              {expandedSections.income ? '−' : '+'}
            </span>
          </button>

          {expandedSections.income && (
            <CardContent className="border-t border-gray-200">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <strong>Social Security:</strong> Estimated based on your final salary
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Set your final salary in the Personal Information section above
                  </p>
                </div>

                <CurrencyInput
                  label="Annual Pension Benefit"
                  id="pension-benefit"
                  value={pension.inputs.annualBenefit}
                  onChange={(value) => updatePensionInputs({ annualBenefit: value })}
                  helperText="Enter 0 if you don't have a pension"
                />
                <div>
                  <label htmlFor="pension-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Pension Type
                  </label>
                  <select
                    id="pension-type"
                    value={pension.inputs.pensionType}
                    onChange={(e) => updatePensionInputs({ pensionType: e.target.value as 'lifetime' | 'fixed-term' })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                  >
                    <option value="lifetime">Lifetime</option>
                    <option value="fixed-term">Fixed Term</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Lifetime pensions continue for your entire life
                  </p>
                </div>

                {pension.inputs.pensionType === 'fixed-term' && (
                  <div>
                    <label htmlFor="pension-term-years" className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Years
                    </label>
                    <input
                      id="pension-term-years"
                      type="number"
                      min="1"
                      max="50"
                      value={pension.inputs.termYears || 20}
                      onChange={(e) => updatePensionInputs({ termYears: parseInt(e.target.value) || 20 })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How many years the pension will pay out
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Section 5: Expenses */}
        <Card className="mb-6">
          <button
            onClick={() => toggleSection('expenses')}
            className="w-full text-left flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-2xl font-bold text-primary">Annual Expenses</h2>
            <span className="text-3xl text-primary">
              {expandedSections.expenses ? '−' : '+'}
            </span>
          </button>

          {expandedSections.expenses && (
            <CardContent className="border-t border-gray-200">
              <CurrencyInput
                label="Annual Living Expenses"
                id="annual-expenses"
                value={budget.inputs.annualExpenses}
                onChange={(value) => updateBudgetInputs({ annualExpenses: value })}
                helperText="Your expected total annual spending in retirement"
              />
            </CardContent>
          )}
        </Card>

        {/* Calculate All Button */}
        <div className="text-center mb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCalculateAll}
            disabled={isCalculating}
            className="px-8 py-4 text-lg min-w-[300px]"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Complete Financial Plan'}
          </Button>
        </div>

        {/* Results Summary */}
        {hasResults && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl">Your Financial Plan Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {investmentProjection.results && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Retirement Portfolio</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatCurrency(investmentProjection.results.finalBalance, { showCents: false })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      At age {investmentProjection.inputs.retirementAge}
                    </p>
                  </div>
                )}

                {retirementWithdrawal.results && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Annual Withdrawal</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatCurrency(retirementWithdrawal.results.annualWithdrawal, { showCents: false })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      First year (inflation-adjusted thereafter)
                    </p>
                  </div>
                )}

                {retirementWithdrawal.results && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Final Balance</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatCurrency(
                        retirementWithdrawal.results.yearByYear[retirementWithdrawal.results.yearByYear.length - 1].remainingBalance,
                        { showCents: false }
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      After {retirementWithdrawal.inputs.yearsInRetirement} years
                    </p>
                  </div>
                )}
              </div>

              {retirementWithdrawal.results?.balanceDepletionYear !== null && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                  <p className="text-sm font-semibold text-red-800">⚠️ Warning</p>
                  <p className="text-sm text-red-700 mt-1">
                    Your portfolio is projected to deplete in year {retirementWithdrawal.results?.balanceDepletionYear}.
                    Consider reducing expenses, increasing savings, or adjusting your withdrawal rate.
                  </p>
                </div>
              )}

              <div className="border-t border-blue-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">View Detailed Reports:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Link
                    href="/calculators/income-analysis"
                    className="text-accent hover:text-accent/80 font-semibold underline text-sm flex items-center"
                  >
                    <span>→ Income & Expense Analysis (Table + Chart)</span>
                  </Link>
                  <Link
                    href="/calculators/investment-projection"
                    className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
                  >
                    <span>→ Investment Projection Details</span>
                  </Link>
                  <Link
                    href="/calculators/retirement-withdrawal"
                    className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
                  >
                    <span>→ Withdrawal Analysis Details</span>
                  </Link>
                  <Link
                    href="/calculators/social-security"
                    className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
                  >
                    <span>→ Social Security Details</span>
                  </Link>
                  <Link
                    href="/calculators/budget"
                    className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
                  >
                    <span>→ Budget & Cash Flow Details</span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-xs text-gray-600">
              <strong>Disclaimer:</strong> This unified financial plan is for educational and
              informational purposes only. Projections are based on historical averages and
              assumptions provided. Actual results will vary based on market conditions, personal
              circumstances, and other factors. This is not financial advice. Consult with a
              qualified financial professional before making investment or retirement decisions.
            </p>
          </CardContent>
        </Card>

        {/* Custom Navigation for Unified Plan */}
        <div className="max-w-4xl mx-auto mt-8 border-t-4 border-red-500 bg-yellow-100 p-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h4>
          <p className="text-sm text-gray-600 mb-4">
            You've completed the unified financial planning calculator! Continue your analysis with:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Back to Home</span>
            </Link>
            <Link
              href="/calculators/monte-carlo"
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex-1"
            >
              <span>🎲 Run Monte Carlo Simulation</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/calculators/strategy-narrative"
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors flex-1"
            >
              <span>📝 Generate Strategy Narrative</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
