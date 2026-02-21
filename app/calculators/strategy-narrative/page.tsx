'use client'

import React from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CalculatorNavigation } from '@/components/layout/CalculatorNavigation'

export default function StrategyNarrativePage() {
  const {
    narrative,
    investmentProjection,
    retirementWithdrawal,
    socialSecurity,
    pension,
    budget,
    monteCarlo,
    updateNarrativeInputs,
    generateNarrative,
    resetNarrative,
  } = useCalculatorStore()

  const { inputs, results } = narrative

  const handleGenerate = () => {
    generateNarrative()
  }

  const handleReset = () => {
    resetNarrative()
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyToClipboard = () => {
    if (results?.fullNarrative) {
      navigator.clipboard.writeText(results.fullNarrative)
      alert('Narrative copied to clipboard!')
    }
  }

  // Check which calculators have been completed
  const completedCalculators = {
    investment: !!investmentProjection.results,
    withdrawal: !!retirementWithdrawal.results,
    socialSecurity: !!socialSecurity.results,
    pension: !!pension.results,
    budget: !!budget.results,
    monteCarlo: !!monteCarlo.results,
  }

  const totalCompleted = Object.values(completedCalculators).filter(Boolean).length
  const hasAnyData = totalCompleted > 0

  return (
    <div className="min-h-screen bg-section py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            Strategy Narrative Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Generate a comprehensive written analysis of your complete financial plan with
            personalized recommendations based on your retirement strategy.
          </p>
        </div>

        {!hasAnyData && (
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
                    The Strategy Narrative analyzes data from all calculators. For the most
                    comprehensive narrative, complete the Investment Projection, Retirement
                    Withdrawal, Social Security, Pension, Budget, and Monte Carlo calculators first.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Narrative Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Data Sources Status */}
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="font-semibold text-sm mb-3">Available Data Sources</h4>
                    <div className="space-y-2 text-sm">
                      <DataSourceItem
                        label="Investment Projection"
                        completed={completedCalculators.investment}
                      />
                      <DataSourceItem
                        label="Retirement Withdrawal"
                        completed={completedCalculators.withdrawal}
                      />
                      <DataSourceItem
                        label="Social Security"
                        completed={completedCalculators.socialSecurity}
                      />
                      <DataSourceItem label="Pension/Annuity" completed={completedCalculators.pension} />
                      <DataSourceItem
                        label="Budget & Cash Flow"
                        completed={completedCalculators.budget}
                      />
                      <DataSourceItem
                        label="Monte Carlo Simulation"
                        completed={completedCalculators.monteCarlo}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      {totalCompleted} of 6 calculators completed
                    </p>
                  </div>

                  {/* Section Options */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Include Sections</h4>
                    <div className="space-y-3">
                      <CheckboxOption
                        id="exec-summary"
                        label="Executive Summary"
                        checked={inputs.includeExecutiveSummary}
                        onChange={(checked) => updateNarrativeInputs({ includeExecutiveSummary: checked })}
                      />
                      <CheckboxOption
                        id="asset-analysis"
                        label="Asset Allocation Analysis"
                        checked={inputs.includeAssetAnalysis}
                        onChange={(checked) => updateNarrativeInputs({ includeAssetAnalysis: checked })}
                        disabled={!completedCalculators.investment}
                      />
                      <CheckboxOption
                        id="income-analysis"
                        label="Income Analysis"
                        checked={inputs.includeIncomeAnalysis}
                        onChange={(checked) => updateNarrativeInputs({ includeIncomeAnalysis: checked })}
                      />
                      <CheckboxOption
                        id="success-eval"
                        label="Success Evaluation"
                        checked={inputs.includeSuccessEvaluation}
                        onChange={(checked) => updateNarrativeInputs({ includeSuccessEvaluation: checked })}
                        disabled={!completedCalculators.monteCarlo}
                      />
                      <CheckboxOption
                        id="recommendations"
                        label="Strategic Recommendations"
                        checked={inputs.includeRecommendations}
                        onChange={(checked) => updateNarrativeInputs({ includeRecommendations: checked })}
                      />
                      <CheckboxOption
                        id="disclaimer"
                        label="Legal Disclaimer"
                        checked={inputs.includeDisclaimer}
                        onChange={(checked) => updateNarrativeInputs({ includeDisclaimer: checked })}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleGenerate}
                      type="button"
                      disabled={!hasAnyData}
                    >
                      Generate Narrative
                    </Button>
                    {results && (
                      <>
                        <Button
                          variant="outline"
                          size="md"
                          fullWidth
                          onClick={handlePrint}
                          type="button"
                        >
                          Print
                        </Button>
                        <Button
                          variant="outline"
                          size="md"
                          fullWidth
                          onClick={handleCopyToClipboard}
                          type="button"
                        >
                          Copy to Clipboard
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="md" fullWidth onClick={handleReset} type="button">
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Narrative Display */}
          <div className="lg:col-span-2">
            {results ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Your Financial Strategy Narrative</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Generated on {results.generatedAt.toLocaleDateString()} •{' '}
                        {results.wordCount.toLocaleString()} words
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none narrative-content">
                    <div
                      className="whitespace-pre-wrap leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: formatNarrative(results.fullNarrative),
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Narrative Generated</h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    {hasAnyData
                      ? 'Click "Generate Narrative" to create a comprehensive analysis of your financial plan'
                      : 'Complete at least one calculator, then return here to generate your strategy narrative'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-5xl mx-auto px-4">
          <CalculatorNavigation currentPath="/calculators/strategy-narrative" />
        </div>

        {/* Print-specific styles */}
        <style jsx>{`
          @media print {
            .no-print {
              display: none !important;
            }
            .narrative-content {
              font-size: 12pt;
              line-height: 1.6;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

/**
 * Format narrative markdown to HTML
 */
function formatNarrative(narrative: string): string {
  return narrative
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-serif font-bold text-primary mt-8 mb-4">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/✅/g, '<span class="text-green-600">✅</span>')
    .replace(/⚠️/g, '<span class="text-yellow-600">⚠️</span>')
    .replace(/🚨/g, '<span class="text-red-600">🚨</span>')
    .replace(/📉|📈|💡|⏳|🛡️|💰|🎁|🌐|📅|📊|🎯/g, (emoji) => `<span class="mr-1">${emoji}</span>`)
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(.+)$/gm, (line) => {
      if (line.startsWith('<h') || line.startsWith('<strong')) {
        return line
      }
      return `<p class="mb-4">${line}</p>`
    })
}

/**
 * Data Source Status Item Component
 */
function DataSourceItem({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      {completed ? (
        <span className="text-green-600 text-xs font-semibold">✓ Complete</span>
      ) : (
        <span className="text-gray-400 text-xs">Not completed</span>
      )}
    </div>
  )
}

/**
 * Checkbox Option Component
 */
function CheckboxOption({
  id,
  label,
  checked,
  onChange,
  disabled = false,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-start">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded disabled:opacity-50"
      />
      <label
        htmlFor={id}
        className={`ml-3 text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
      >
        {label}
        {disabled && <span className="text-xs text-gray-400 block">Requires data</span>}
      </label>
    </div>
  )
}
