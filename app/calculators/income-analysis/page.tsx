'use client'

import React from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/formatters/currency'
import Decimal from 'decimal.js'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function IncomeAnalysisPage() {
  const {
    retirementWithdrawal,
    socialSecurity,
    pension,
    budget,
  } = useCalculatorStore()

  // Check if we have the necessary data
  const hasData = retirementWithdrawal.results && retirementWithdrawal.results.yearByYear.length > 0

  if (!hasData) {
    return (
      <div className="min-h-screen bg-section py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
              Income & Expense Analysis
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Year-by-year breakdown of all income sources, expenses, and net cash flow throughout retirement.
            </p>
          </div>

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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-600 mb-4">
                Please run the Complete Financial Plan calculator first to see your income analysis.
              </p>
              <a
                href="/calculators/unified"
                className="inline-block bg-accent hover:bg-accent/90 text-white font-medium px-6 py-3 rounded-md transition-colors"
              >
                Go to Complete Financial Plan →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Build comprehensive year-by-year data
  const yearByYearData = (retirementWithdrawal.results?.yearByYear ?? []).map((withdrawal, index) => {
    const year = withdrawal.year
    const age = withdrawal.age

    // Get withdrawal amount
    const withdrawalAmount = new Decimal(withdrawal.inflationAdjusted)

    // Get Social Security (starts at retirement age or claim age)
    let socialSecurityAmount = new Decimal(0)
    if (socialSecurity.results) {
      const claimAge = socialSecurity.inputs.retirementAge
      if (age >= claimAge) {
        socialSecurityAmount = new Decimal(socialSecurity.results.annualBenefit)
      }
    }

    // Get Pension (check if active for this year)
    let pensionAmount = new Decimal(0)
    if (pension.results && pension.results.yearByYear) {
      const pensionYear = pension.results.yearByYear.find((p) => p.age === age)
      if (pensionYear) {
        pensionAmount = new Decimal(pensionYear.income)
      }
    }

    // Get Expenses
    let expensesAmount = new Decimal(budget.inputs.annualExpenses)
    // Apply inflation to expenses
    const inflationRate = new Decimal(retirementWithdrawal.inputs.inflationRate).div(100)
    if (year > 0) {
      const inflationFactor = new Decimal(1).plus(inflationRate).pow(year)
      expensesAmount = expensesAmount.mul(inflationFactor)
    }

    // Calculate totals
    const totalIncome = withdrawalAmount.plus(socialSecurityAmount).plus(pensionAmount)
    const netCashFlow = totalIncome.minus(expensesAmount)

    return {
      year,
      age,
      withdrawal: withdrawalAmount,
      socialSecurity: socialSecurityAmount,
      pension: pensionAmount,
      totalIncome,
      expenses: expensesAmount,
      netCashFlow,
    }
  })

  // Calculate grand totals
  const grandTotals = yearByYearData.reduce(
    (acc, row) => ({
      withdrawal: acc.withdrawal.plus(row.withdrawal),
      socialSecurity: acc.socialSecurity.plus(row.socialSecurity),
      pension: acc.pension.plus(row.pension),
      totalIncome: acc.totalIncome.plus(row.totalIncome),
      expenses: acc.expenses.plus(row.expenses),
      netCashFlow: acc.netCashFlow.plus(row.netCashFlow),
    }),
    {
      withdrawal: new Decimal(0),
      socialSecurity: new Decimal(0),
      pension: new Decimal(0),
      totalIncome: new Decimal(0),
      expenses: new Decimal(0),
      netCashFlow: new Decimal(0),
    }
  )

  // Prepare chart data
  const chartData = yearByYearData.map((row) => ({
    year: row.year,
    age: row.age,
    Withdrawals: row.withdrawal.toNumber(),
    'Social Security': row.socialSecurity.toNumber(),
    Pension: row.pension.toNumber(),
    Expenses: -row.expenses.toNumber(), // Negative for visual separation
  }))

  return (
    <div className="min-h-screen bg-section py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            Income & Expense Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Comprehensive year-by-year breakdown of all income sources, expenses, and net cash flow throughout retirement.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Income (All Sources)</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(grandTotals.totalIncome, { showCents: false })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Over {yearByYearData.length} years
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(grandTotals.expenses, { showCents: false })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Inflation-adjusted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Net Cash Flow</p>
              <p className={`text-2xl font-bold mt-1 ${grandTotals.netCashFlow.greaterThan(0) ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(grandTotals.netCashFlow, { showCents: false })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {grandTotals.netCashFlow.greaterThan(0) ? 'Surplus' : 'Deficit'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stacked Area Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Income & Expenses Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorSocialSecurity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorPension" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="age"
                  label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(Math.abs(value), { showCents: false })}
                  labelFormatter={(label) => `Age ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Withdrawals"
                  stackId="1"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorWithdrawals)"
                />
                <Area
                  type="monotone"
                  dataKey="Social Security"
                  stackId="1"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorSocialSecurity)"
                />
                <Area
                  type="monotone"
                  dataKey="Pension"
                  stackId="1"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#colorPension)"
                />
                <Area
                  type="monotone"
                  dataKey="Expenses"
                  stackId="2"
                  stroke="#EF4444"
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 text-center mt-4">
              Income sources are stacked (blue + green + purple). Expenses shown in red below baseline.
            </p>
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Year-by-Year Income & Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Withdrawals
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Social Security
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pension
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Income
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expenses
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Cash Flow
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {yearByYearData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {row.year}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {row.age}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-600">
                        {formatCurrency(row.withdrawal, { showCents: false })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">
                        {formatCurrency(row.socialSecurity, { showCents: false })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-purple-600">
                        {formatCurrency(row.pension, { showCents: false })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                        {formatCurrency(row.totalIncome, { showCents: false })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">
                        {formatCurrency(row.expenses, { showCents: false })}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-semibold ${row.netCashFlow.greaterThanOrEqualTo(0) ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(row.netCashFlow, { showCents: false })}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-primary text-white font-bold">
                    <td colSpan={2} className="px-4 py-3 text-sm">
                      TOTALS
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {formatCurrency(grandTotals.withdrawal, { showCents: false })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {formatCurrency(grandTotals.socialSecurity, { showCents: false })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {formatCurrency(grandTotals.pension, { showCents: false })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {formatCurrency(grandTotals.totalIncome, { showCents: false })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {formatCurrency(grandTotals.expenses, { showCents: false })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {formatCurrency(grandTotals.netCashFlow, { showCents: false })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-primary mb-2">Notes:</h4>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>All amounts are inflation-adjusted</li>
              <li>Withdrawals include investment growth during retirement</li>
              <li>Social Security benefits start at your specified claim age</li>
              <li>Pension payments depend on your pension type (lifetime or fixed-term)</li>
              <li>Positive net cash flow indicates surplus; negative indicates you're drawing down savings</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
