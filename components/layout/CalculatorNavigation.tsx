'use client'

import React from 'react'
import Link from 'next/link'
import { useCalculatorStore } from '@/store/calculator-store'

interface CalculatorStep {
  id: string
  title: string
  path: string
  checkComplete: (store: any) => boolean
}

const CALCULATOR_FLOW: CalculatorStep[] = [
  {
    id: 'investment',
    title: 'Investment Projection',
    path: '/calculators/investment-projection',
    checkComplete: (store) => !!store.investmentProjection.results,
  },
  {
    id: 'withdrawal',
    title: 'Retirement Withdrawal',
    path: '/calculators/retirement-withdrawal',
    checkComplete: (store) => !!store.retirementWithdrawal.results,
  },
  {
    id: 'social-security',
    title: 'Social Security',
    path: '/calculators/social-security',
    checkComplete: (store) => !!store.socialSecurity.results,
  },
  {
    id: 'pension',
    title: 'Pension & Annuity',
    path: '/calculators/pension',
    checkComplete: (store) => !!store.pension.results,
  },
  {
    id: 'budget',
    title: 'Budget & Cash Flow',
    path: '/calculators/budget',
    checkComplete: (store) => !!store.budget.results,
  },
  {
    id: 'monte-carlo',
    title: 'Monte Carlo Simulation',
    path: '/calculators/monte-carlo',
    checkComplete: (store) => !!store.monteCarlo.results,
  },
  {
    id: 'narrative',
    title: 'Strategy Narrative',
    path: '/calculators/strategy-narrative',
    checkComplete: (store) => !!store.narrative.results,
  },
]

interface CalculatorNavigationProps {
  currentPath: string
  showWorkflow?: boolean
}

export function CalculatorNavigation({
  currentPath,
  showWorkflow = true,
}: CalculatorNavigationProps) {
  const store = useCalculatorStore()

  const currentIndex = CALCULATOR_FLOW.findIndex((step) => step.path === currentPath)
  const currentStep = CALCULATOR_FLOW[currentIndex]
  const prevStep = currentIndex > 0 ? CALCULATOR_FLOW[currentIndex - 1] : null
  const nextStep = currentIndex < CALCULATOR_FLOW.length - 1 ? CALCULATOR_FLOW[currentIndex + 1] : null

  const isCurrentComplete = currentStep ? currentStep.checkComplete(store) : false

  return (
    <div className="border-t border-gray-200 bg-white mt-8 pt-6">
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Previous Button */}
        {prevStep ? (
          <Link
            href={prevStep.path}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>{prevStep.title}</span>
          </Link>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Home</span>
          </Link>
        )}

        {/* Next Button */}
        {nextStep ? (
          <Link
            href={nextStep.path}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors ml-auto"
          >
            <span>{nextStep.title}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors ml-auto"
          >
            <span>Back to Home</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </Link>
        )}
      </div>

      {/* Workflow Progress (Optional) */}
      {showWorkflow && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Calculator Workflow</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {CALCULATOR_FLOW.map((step, index) => {
              const isComplete = step.checkComplete(store)
              const isCurrent = step.path === currentPath

              return (
                <Link
                  key={step.id}
                  href={step.path}
                  className={`relative p-3 rounded-lg border-2 text-center transition-all ${
                    isCurrent
                      ? 'border-accent bg-accent/10 ring-2 ring-accent/50'
                      : isComplete
                      ? 'border-green-500 bg-green-50 hover:bg-green-100'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Step Number */}
                  <div
                    className={`text-xs font-bold mb-1 ${
                      isCurrent
                        ? 'text-accent'
                        : isComplete
                        ? 'text-green-700'
                        : 'text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Step Title */}
                  <div
                    className={`text-xs font-medium leading-tight ${
                      isCurrent
                        ? 'text-accent'
                        : isComplete
                        ? 'text-green-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {step.title}
                  </div>

                  {/* Checkmark */}
                  {isComplete && !isCurrent && (
                    <div className="absolute top-1 right-1">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Current Indicator */}
                  {isCurrent && (
                    <div className="absolute top-1 right-1">
                      <svg
                        className="w-4 h-4 text-accent"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Progress Summary */}
          <div className="mt-4 text-xs text-gray-600 text-center">
            {CALCULATOR_FLOW.filter((step) => step.checkComplete(store)).length} of{' '}
            {CALCULATOR_FLOW.length} calculators completed
          </div>
        </div>
      )}

      {/* Next Step Suggestion */}
      {isCurrentComplete && nextStep && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Great! {currentStep?.title} Complete
              </h4>
              <p className="text-sm text-green-800 mb-3">
                Ready to move to the next step in your financial plan.
              </p>
              <Link
                href={nextStep.path}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                <span>Continue to {nextStep.title}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
