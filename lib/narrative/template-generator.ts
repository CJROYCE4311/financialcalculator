import Decimal from 'decimal.js'
import type {
  CalculatorStore,
  NarrativeInputs,
  NarrativeResults,
} from '@/types/calculator.types'
import { formatCurrency } from '@/lib/formatters/currency'
import { formatPercentage } from '@/lib/formatters/percentage'

/**
 * Helper to format percentages stored as whole numbers (60 = 60%)
 */
function formatPct(value: Decimal | number): string {
  return formatPercentage(value, { isAlreadyPercent: true })
}

/**
 * Generate a comprehensive financial strategy narrative based on all calculator data
 */
export function generateStrategyNarrative(
  store: CalculatorStore,
  options: NarrativeInputs
): NarrativeResults {
  const sections: NarrativeResults['sections'] = {}
  const narrativeParts: string[] = []

  // Extract data from all calculators
  const investment = store.investmentProjection
  const withdrawal = store.retirementWithdrawal
  const socialSecurity = store.socialSecurity
  const pension = store.pension
  const budget = store.budget
  const monteCarlo = store.monteCarlo

  // Generate Executive Summary
  if (options.includeExecutiveSummary) {
    const executiveSummary = generateExecutiveSummary({
      investment,
      withdrawal,
      socialSecurity,
      pension,
      budget,
    })
    sections.executiveSummary = executiveSummary
    narrativeParts.push('## Executive Summary\n\n' + executiveSummary)
  }

  // Generate Asset Analysis
  if (options.includeAssetAnalysis && investment.results) {
    const assetAnalysis = generateAssetAnalysis(investment)
    sections.assetAnalysis = assetAnalysis
    narrativeParts.push('\n\n## Asset Allocation & Growth Analysis\n\n' + assetAnalysis)
  }

  // Generate Income Analysis
  if (options.includeIncomeAnalysis) {
    const incomeAnalysis = generateIncomeAnalysis({
      withdrawal,
      socialSecurity,
      pension,
      budget,
    })
    sections.incomeAnalysis = incomeAnalysis
    narrativeParts.push('\n\n## Retirement Income Analysis\n\n' + incomeAnalysis)
  }

  // Generate Success Evaluation (if Monte Carlo is available)
  if (options.includeSuccessEvaluation && monteCarlo.results) {
    const successEvaluation = generateSuccessEvaluation(monteCarlo)
    sections.successEvaluation = successEvaluation
    narrativeParts.push('\n\n## Plan Success Evaluation\n\n' + successEvaluation)
  }

  // Generate Recommendations
  if (options.includeRecommendations) {
    const recommendations = generateRecommendations({
      investment,
      withdrawal,
      socialSecurity,
      pension,
      budget,
      monteCarlo,
    })
    sections.recommendations = recommendations
    narrativeParts.push('\n\n## Strategic Recommendations\n\n' + recommendations.join('\n\n'))
  }

  // Add Disclaimer
  if (options.includeDisclaimer) {
    const disclaimer = generateDisclaimer()
    sections.disclaimer = disclaimer
    narrativeParts.push('\n\n## Important Disclaimer\n\n' + disclaimer)
  }

  const fullNarrative = narrativeParts.join('')
  const wordCount = fullNarrative.split(/\s+/).length

  return {
    fullNarrative,
    sections,
    wordCount,
    generatedAt: new Date(),
  }
}

/**
 * Generate Executive Summary section
 */
function generateExecutiveSummary(data: {
  investment: any
  withdrawal: any
  socialSecurity: any
  pension: any
  budget: any
}): string {
  const parts: string[] = []

  // Investment projection summary
  if (data.investment.results) {
    const finalBalance = data.investment.results.finalBalance
    const years = data.investment.inputs.retirementAge - data.investment.inputs.currentAge
    const currentAge = data.investment.inputs.currentAge
    const retirementAge = data.investment.inputs.retirementAge

    parts.push(
      `You are currently **${currentAge} years old** with a projected retirement age of **${retirementAge}**. ` +
        `Over the next **${years} years**, your portfolio is projected to grow to **${formatCurrency(finalBalance, { showCents: false })}**, ` +
        `assuming consistent contributions and average market returns.`
    )
  }

  // Withdrawal strategy summary
  if (data.withdrawal.results) {
    const annualWithdrawal = data.withdrawal.results.annualWithdrawal
    const withdrawalRate = data.withdrawal.inputs.withdrawalRate
    const yearsInRetirement = data.withdrawal.inputs.yearsInRetirement

    parts.push(
      `\n\nYour retirement withdrawal strategy is based on a **${formatPct(withdrawalRate)}** withdrawal rate, ` +
        `providing approximately **${formatCurrency(annualWithdrawal, { showCents: false })}** in annual income from your portfolio ` +
        `over a **${yearsInRetirement}-year** retirement period.`
    )

    if (data.withdrawal.results.balanceDepletionYear) {
      parts.push(
        ` ⚠️ **Important:** Based on current projections, your portfolio may be depleted in year ${data.withdrawal.results.balanceDepletionYear}.`
      )
    }
  }

  // Income sources summary
  const incomeSources: string[] = []
  let totalAnnualIncome = new Decimal(0)

  if (data.withdrawal.results) {
    incomeSources.push(
      `Portfolio Withdrawals (${formatCurrency(data.withdrawal.results.annualWithdrawal, { showCents: false })})`
    )
    totalAnnualIncome = totalAnnualIncome.plus(data.withdrawal.results.annualWithdrawal)
  }

  if (data.socialSecurity.results) {
    incomeSources.push(
      `Social Security (${formatCurrency(data.socialSecurity.results.annualBenefit, { showCents: false })})`
    )
    totalAnnualIncome = totalAnnualIncome.plus(data.socialSecurity.results.annualBenefit)
  }

  if (data.pension.results) {
    incomeSources.push(
      `Pension/Annuity (${formatCurrency(data.pension.results.annualIncome, { showCents: false })})`
    )
    totalAnnualIncome = totalAnnualIncome.plus(data.pension.results.annualIncome)
  }

  if (incomeSources.length > 0) {
    parts.push(
      `\n\nYour diversified retirement income comes from **${incomeSources.length} source${incomeSources.length > 1 ? 's' : ''}**: ` +
        `${incomeSources.join(', ')}. ` +
        `This provides a **total estimated annual income of ${formatCurrency(totalAnnualIncome, { showCents: false })}** in your first year of retirement.`
    )
  }

  // Budget summary
  if (data.budget.results) {
    const avgSurplus = data.budget.results.averageSurplus
    const yearsWithDeficit = data.budget.results.yearsWithDeficit

    if (avgSurplus.greaterThan(0)) {
      parts.push(
        `\n\n✅ **Positive outlook:** Your projected income exceeds expenses by an average of **${formatCurrency(avgSurplus, { showCents: false })}** per year, ` +
          `providing a comfortable financial cushion throughout retirement.`
      )
    } else {
      parts.push(
        `\n\n⚠️ **Attention needed:** Your current plan shows an average annual deficit of **${formatCurrency(avgSurplus.abs(), { showCents: false })}**, ` +
          `with **${yearsWithDeficit} years** experiencing shortfalls. Strategic adjustments are recommended.`
      )
    }
  }

  return parts.join('')
}

/**
 * Generate Asset Allocation Analysis section
 */
function generateAssetAnalysis(investment: any): string {
  if (!investment.results) {
    return 'No investment data available for analysis.'
  }

  const parts: string[] = []
  const inputs = investment.inputs
  const results = investment.results

  // Asset allocation breakdown
  const equitiesPercent = inputs.equitiesPercent
  const bondsPercent = inputs.bondsPercent
  const cashPercent = inputs.cashPercent

  parts.push(
    `Your portfolio is allocated across three asset classes: ` +
      `**${formatPct(equitiesPercent)}** in equities (stocks), ` +
      `**${formatPct(bondsPercent)}** in bonds, and ` +
      `**${formatPct(cashPercent)}** in cash equivalents.`
  )

  // Risk assessment
  if (equitiesPercent.greaterThan(70)) {
    parts.push(
      `\n\n⚠️ Your allocation is **equity-heavy** (${formatPct(equitiesPercent)}), which provides strong growth potential but also exposes you to higher market volatility. ` +
        `This aggressive strategy may be suitable if you have a long time horizon and high risk tolerance.`
    )
  } else if (equitiesPercent.lessThan(40)) {
    parts.push(
      `\n\nYour allocation is **conservative** (${formatPct(equitiesPercent)} equities), with lower equity exposure. ` +
        `This provides greater stability but may limit long-term growth potential. ` +
        `Consider whether this aligns with your retirement timeline and financial goals.`
    )
  } else {
    parts.push(
      `\n\n✅ Your allocation represents a **balanced approach** between growth and stability, ` +
        `appropriate for most investors approaching or in retirement.`
    )
  }

  // Growth projection
  const totalGrowth = results.totalReturns
  const totalContributions = results.totalContributions
  const years = inputs.retirementAge - inputs.currentAge

  parts.push(
    `\n\nOver the **${years}-year** accumulation period, you're projected to contribute **${formatCurrency(totalContributions, { showCents: false })}** ` +
      `and earn approximately **${formatCurrency(totalGrowth, { showCents: false })}** in investment returns, ` +
      `growing your portfolio to **${formatCurrency(results.finalBalance, { showCents: false })}**.`
  )

  // Final allocation breakdown
  const finalEquities = results.assetAllocation.equities
  const finalBonds = results.assetAllocation.bonds
  const finalCash = results.assetAllocation.cash

  parts.push(
    `\n\nAt retirement, your portfolio will be distributed as: ` +
      `**${formatCurrency(finalEquities, { showCents: false })}** in equities, ` +
      `**${formatCurrency(finalBonds, { showCents: false })}** in bonds, and ` +
      `**${formatCurrency(finalCash, { showCents: false })}** in cash.`
  )

  return parts.join('')
}

/**
 * Generate Income Analysis section
 */
function generateIncomeAnalysis(data: {
  withdrawal: any
  socialSecurity: any
  pension: any
  budget: any
}): string {
  const parts: string[] = []
  const incomeSources: Array<{ name: string; amount: Decimal; details: string }> = []

  // Portfolio withdrawals
  if (data.withdrawal.results) {
    const withdrawalRate = data.withdrawal.inputs.withdrawalRate
    incomeSources.push({
      name: 'Portfolio Withdrawals',
      amount: data.withdrawal.results.annualWithdrawal,
      details: `Based on a ${formatPct(withdrawalRate)} withdrawal rate from your investment portfolio, ` +
        `adjusted annually for inflation.`,
    })
  }

  // Social Security
  if (data.socialSecurity.results) {
    const claimingAge = data.socialSecurity.inputs.retirementAge
    const monthlyBenefit = data.socialSecurity.results.monthlyBenefit
    incomeSources.push({
      name: 'Social Security',
      amount: data.socialSecurity.results.annualBenefit,
      details: `Claiming at age ${claimingAge}, providing ${formatCurrency(monthlyBenefit, { showCents: false })} per month. ` +
        (claimingAge < 67
          ? '⚠️ Early claiming results in permanently reduced benefits.'
          : claimingAge >= 70
          ? '✅ Delayed claiming maximizes your lifetime benefit.'
          : ''),
    })
  }

  // Pension/Annuity
  if (data.pension.results) {
    const pensionType = data.pension.inputs.pensionType
    const monthlyAmount = data.pension.results.annualIncome.dividedBy(12)
    incomeSources.push({
      name: 'Pension/Annuity',
      amount: data.pension.results.annualIncome,
      details: `${pensionType === 'lifetime' ? 'Lifetime' : 'Fixed-term'} pension providing ${formatCurrency(monthlyAmount, { showCents: false })} per month.`,
    })
  }

  if (incomeSources.length === 0) {
    return 'No retirement income sources have been calculated yet. Complete the relevant calculators to see your income analysis.'
  }

  // Calculate total
  const totalIncome = incomeSources.reduce((sum, source) => sum.plus(source.amount), new Decimal(0))

  parts.push(
    `Your retirement income strategy relies on **${incomeSources.length} income stream${incomeSources.length > 1 ? 's' : ''}**, ` +
      `providing a total of **${formatCurrency(totalIncome, { showCents: false })}** annually in your first year of retirement.`
  )

  // Breakdown each source
  parts.push('\n\n### Income Source Breakdown:\n')
  incomeSources.forEach((source) => {
    const percentage = source.amount.dividedBy(totalIncome).times(100)
    parts.push(
      `\n**${source.name}** (${formatPct(percentage)}): ${formatCurrency(source.amount, { showCents: false })} annually\n` +
        `${source.details}`
    )
  })

  // Compare to expenses
  if (data.budget.results) {
    const firstYearExpenses = data.budget.inputs.annualExpenses
    const coverage = totalIncome.dividedBy(firstYearExpenses).times(100)

    parts.push(
      `\n\n### Income vs. Expenses:\n\n` +
        `Your total income of **${formatCurrency(totalIncome, { showCents: false })}** covers **${formatPct(coverage)}** ` +
        `of your estimated annual expenses of **${formatCurrency(firstYearExpenses, { showCents: false })}**.`
    )

    if (coverage.greaterThanOrEqualTo(100)) {
      parts.push(` ✅ Your income fully covers your planned expenses.`)
    } else {
      const shortfall = firstYearExpenses.minus(totalIncome)
      parts.push(
        ` ⚠️ There is a potential shortfall of **${formatCurrency(shortfall, { showCents: false })}** annually that needs to be addressed.`
      )
    }
  }

  return parts.join('')
}

/**
 * Generate Success Evaluation section (Monte Carlo results)
 */
function generateSuccessEvaluation(monteCarlo: any): string {
  if (!monteCarlo.results) {
    return 'Monte Carlo simulation has not been run yet. Complete the simulation to see success probability analysis.'
  }

  const parts: string[] = []
  const successRate = monteCarlo.results.successRate
  const medianBalance = monteCarlo.results.medianFinalBalance
  const worstCase = monteCarlo.results.worstCase
  const bestCase = monteCarlo.results.bestCase

  parts.push(
    `Based on **${monteCarlo.inputs.iterations.toLocaleString()} Monte Carlo simulations**, ` +
      `your retirement plan has a **${formatPct(successRate)} success rate**. ` +
      `This means that in ${formatPct(successRate)} of scenarios, your portfolio successfully funds your retirement without running out of money.`
  )

  // Interpret success rate
  if (successRate.greaterThanOrEqualTo(90)) {
    parts.push(
      `\n\n✅ **Excellent:** A ${formatPct(successRate)} success rate indicates a highly robust plan with strong resilience against market volatility.`
    )
  } else if (successRate.greaterThanOrEqualTo(75)) {
    parts.push(
      `\n\n✓ **Good:** A ${formatPct(successRate)} success rate is generally acceptable, though there's room for improvement to increase confidence.`
    )
  } else if (successRate.greaterThanOrEqualTo(50)) {
    parts.push(
      `\n\n⚠️ **Moderate Risk:** A ${formatPct(successRate)} success rate suggests significant risk. Consider adjustments to improve your plan's resilience.`
    )
  } else {
    parts.push(
      `\n\n🚨 **High Risk:** A ${formatPct(successRate)} success rate indicates substantial risk of running out of money. Immediate strategic changes are recommended.`
    )
  }

  // Outcome ranges
  parts.push(
    `\n\n### Scenario Analysis:\n\n` +
      `- **Best Case (95th percentile):** ${formatCurrency(bestCase, { showCents: false })} final balance\n` +
      `- **Median (50th percentile):** ${formatCurrency(medianBalance, { showCents: false })} final balance\n` +
      `- **Worst Case (5th percentile):** ${formatCurrency(worstCase, { showCents: false })} final balance`
  )

  return parts.join('')
}

/**
 * Generate Strategic Recommendations
 */
function generateRecommendations(data: {
  investment: any
  withdrawal: any
  socialSecurity: any
  pension: any
  budget: any
  monteCarlo: any
}): string[] {
  const recommendations: string[] = []

  // Withdrawal rate recommendation
  if (data.withdrawal.results) {
    const withdrawalRate = data.withdrawal.inputs.withdrawalRate
    if (withdrawalRate.greaterThan(4.5)) {
      recommendations.push(
        `📉 **Reduce Withdrawal Rate:** Your current withdrawal rate of ${formatPct(withdrawalRate)} exceeds the traditional 4% "safe withdrawal rate." ` +
          `Consider reducing withdrawals or increasing your portfolio size to improve sustainability. ` +
          `A withdrawal rate above 4.5% significantly increases the risk of depleting your portfolio.`
      )
    } else if (withdrawalRate.lessThan(3)) {
      recommendations.push(
        `💡 **Conservative Withdrawal:** Your ${formatPct(withdrawalRate)} withdrawal rate is very conservative. ` +
          `This provides excellent security, but you may be able to enjoy a higher standard of living in retirement. ` +
          `Consider whether you're leaving money on the table.`
      )
    }
  }

  // Social Security claiming age recommendation
  if (data.socialSecurity.results) {
    const claimingAge = data.socialSecurity.inputs.retirementAge
    const monthlyBenefit = data.socialSecurity.results.monthlyBenefit

    if (claimingAge < 67) {
      const potentialIncrease = monthlyBenefit.times(1.24) // Rough estimate of increase if waiting to 70
      recommendations.push(
        `⏳ **Delay Social Security:** You're planning to claim at age ${claimingAge}. ` +
          `Each year you delay beyond Full Retirement Age (67) increases benefits by ~8% annually. ` +
          `By waiting until age 70, your monthly benefit could increase from ${formatCurrency(monthlyBenefit, { showCents: false })} ` +
          `to approximately ${formatCurrency(potentialIncrease, { showCents: false })}. ` +
          `If you're in good health with longevity in your family, delaying can significantly boost lifetime benefits.`
      )
    } else if (claimingAge >= 70) {
      recommendations.push(
        `✅ **Optimal Social Security Strategy:** Claiming at age ${claimingAge} maximizes your monthly benefit. ` +
          `This strategy pays off if you live into your mid-80s or beyond.`
      )
    }
  }

  // Asset allocation recommendation
  if (data.investment.results) {
    const equitiesPercent = data.investment.inputs.equitiesPercent
    const currentAge = data.investment.inputs.currentAge
    const retirementAge = data.investment.inputs.retirementAge
    const yearsToRetirement = retirementAge - currentAge

    if (yearsToRetirement > 10 && equitiesPercent.lessThan(60)) {
      recommendations.push(
        `📈 **Consider More Growth:** With ${yearsToRetirement} years until retirement, you have time to weather market volatility. ` +
          `Your current ${formatPct(equitiesPercent)} equity allocation is conservative for your timeline. ` +
          `Consider increasing equity exposure to potentially boost long-term growth.`
      )
    } else if (yearsToRetirement <= 5 && equitiesPercent.greaterThan(70)) {
      recommendations.push(
        `🛡️ **Reduce Risk as Retirement Approaches:** With only ${yearsToRetirement} years until retirement, ` +
          `your ${formatPct(equitiesPercent)} equity allocation may be too aggressive. ` +
          `Consider gradually shifting toward bonds and cash to protect against market downturns near your retirement date.`
      )
    }
  }

  // Budget/cash flow recommendations
  if (data.budget.results) {
    const avgSurplus = data.budget.results.averageSurplus
    const yearsWithDeficit = data.budget.results.yearsWithDeficit

    if (yearsWithDeficit > 0) {
      const totalYears = data.budget.inputs.yearsToProject
      recommendations.push(
        `💰 **Address Income Shortfall:** Your plan shows deficits in ${yearsWithDeficit} out of ${totalYears} years. ` +
          `Consider: (1) Reducing planned expenses by ${formatPct(10)}-${formatPct(15)}, ` +
          `(2) Working part-time in early retirement, (3) Delaying retirement by 1-2 years, or ` +
          `(4) Increasing portfolio contributions before retirement.`
      )
    }

    if (avgSurplus.greaterThan(50000)) {
      recommendations.push(
        `🎁 **Excess Capacity:** Your plan shows an average surplus of ${formatCurrency(avgSurplus, { showCents: false })} annually. ` +
          `You have room for: (1) Earlier retirement, (2) Higher quality of life in retirement, ` +
          `(3) Leaving a larger legacy to heirs, or (4) Increased charitable giving.`
      )
    }
  }

  // Monte Carlo success rate recommendations
  if (data.monteCarlo.results) {
    const successRate = data.monteCarlo.results.successRate

    if (successRate.lessThan(75)) {
      recommendations.push(
        `⚠️ **Improve Plan Robustness:** Your ${formatPct(successRate)} success rate is below the recommended 75-80% threshold. ` +
          `To improve: (1) Reduce initial withdrawal rate, (2) Work 1-2 years longer, ` +
          `(3) Delay Social Security to increase guaranteed income, or (4) Reduce planned expenses.`
      )
    }
  }

  // General diversification recommendation
  const hasMultipleIncomeSources =
    (data.withdrawal.results ? 1 : 0) + (data.socialSecurity.results ? 1 : 0) + (data.pension.results ? 1 : 0)

  if (hasMultipleIncomeSources === 1) {
    recommendations.push(
      `🌐 **Diversify Income Sources:** Your retirement relies on a single income source. ` +
        `Multiple income streams provide greater financial security and flexibility. ` +
        `Consider how Social Security, part-time work, rental income, or annuities could diversify your income.`
    )
  } else if (hasMultipleIncomeSources >= 2) {
    recommendations.push(
      `✅ **Well-Diversified Income:** Your ${hasMultipleIncomeSources} income sources provide good diversification, ` +
        `reducing reliance on any single stream and providing more financial resilience.`
    )
  }

  // If no specific recommendations, add general advice
  if (recommendations.length === 0) {
    recommendations.push(
      `✅ **Solid Foundation:** Your current plan appears well-structured. ` +
        `Continue to review annually, adjust for life changes, and stay diversified. ` +
        `Consider working with a fee-only financial advisor for personalized guidance.`
    )
  }

  // Always add review recommendation
  recommendations.push(
    `📅 **Regular Review:** Financial planning is not "set and forget." Review your plan annually, ` +
      `especially after major life events (job changes, health issues, market volatility). ` +
      `Adjust your strategy as your circumstances and goals evolve.`
  )

  return recommendations
}

/**
 * Generate standard disclaimer
 */
function generateDisclaimer(): string {
  return (
    '⚠️ **This strategy narrative is for educational and informational purposes only.** ' +
    'It is not financial, legal, tax, or investment advice. ' +
    'The projections and recommendations are based on assumptions about future market returns, inflation, and personal circumstances, ' +
    'which may not materialize as expected.\n\n' +
    'Past performance does not guarantee future results. Market conditions, tax laws, and personal situations can change significantly. ' +
    'All financial decisions carry risk.\n\n' +
    '**Before making any financial decisions, consult with qualified professionals** including a fiduciary financial advisor, ' +
    'tax professional, and estate planning attorney who can provide personalized guidance based on your complete financial picture.\n\n' +
    'This analysis does not account for taxes, healthcare costs, long-term care needs, or unexpected life events, ' +
    'all of which can materially impact your retirement security.'
  )
}
