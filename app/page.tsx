import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'

export default function Home() {
  const calculators = [
    {
      title: 'Complete Financial Plan',
      description: 'All-in-one unified calculator - enter all your financial data on a single page.',
      icon: '🎯',
      href: '/calculators/unified',
      status: 'available',
      featured: true,
    },
    {
      title: 'Investment Projection',
      description: 'Project your investment growth from now until retirement with asset allocation analysis.',
      icon: '📈',
      href: '/calculators/investment-projection',
      status: 'available',
    },
    {
      title: 'Retirement Withdrawal',
      description: 'Calculate sustainable withdrawal rates and plan your retirement income stream.',
      icon: '💰',
      href: '/calculators/retirement-withdrawal',
      status: 'available',
    },
    {
      title: 'Social Security',
      description: 'Estimate your Social Security benefits based on salary and claiming age.',
      icon: '🏛️',
      href: '/calculators/social-security',
      status: 'available',
    },
    {
      title: 'Pension & Annuity',
      description: 'Calculate lifetime value of pension and annuity income streams.',
      icon: '📊',
      href: '/calculators/pension',
      status: 'available',
    },
    {
      title: 'Budget & Cash Flow',
      description: 'Analyze total income vs expenses throughout retirement with all sources.',
      icon: '💵',
      href: '/calculators/budget',
      status: 'available',
    },
    {
      title: 'Income & Expense Analysis',
      description: 'Year-by-year breakdown table and stacked chart of all income sources and expenses.',
      icon: '📊',
      href: '/calculators/income-analysis',
      status: 'available',
    },
    {
      title: 'Monte Carlo Simulation',
      description: 'Stress test your retirement plan with 1,000,000 market scenarios.',
      icon: '🎲',
      href: '/calculators/monte-carlo',
      status: 'available',
    },
    {
      title: 'Strategy Narrative',
      description: 'Generate comprehensive retirement strategy report with personalized recommendations.',
      icon: '📝',
      href: '/calculators/strategy-narrative',
      status: 'available',
    },
  ]

  return (
    <>
      <Header />

      <main className="min-h-screen">
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-20">
          <div id="main-content" className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 animate-fade-in">
                Plan Your Financial Future
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                Comprehensive tools to model your retirement, analyze investments,
                and build a sustainable financial strategy.
              </p>
              <p className="text-lg text-white/80 mb-8">
                Choose your planning approach:
              </p>
            </div>
          </div>
        </section>

        {/* Two Path Options */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Path 1: Unified All-in-One */}
              <div className="group relative bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/20 rounded-xl p-8 hover:shadow-2xl transition-all duration-300 hover:border-accent">
                <div className="absolute top-4 right-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                  FASTEST
                </div>
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-2xl font-serif font-bold text-primary mb-3">
                  All-in-One Planner
                </h2>
                <p className="text-gray-600 mb-6">
                  Complete your entire financial plan on a single page. Perfect for those who
                  want a quick, comprehensive overview.
                </p>

                <div className="mb-6">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">What's included:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-accent mr-2">✓</span>
                      <span>Investment & asset allocation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">✓</span>
                      <span>Retirement withdrawals & timeline</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">✓</span>
                      <span>Social Security & pension income</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">✓</span>
                      <span>Budget & cash flow analysis</span>
                    </li>
                  </ul>
                </div>

                <div className="mb-6 p-4 bg-white/50 rounded-lg border border-accent/20">
                  <p className="text-sm text-gray-700">
                    <strong className="text-accent">Time:</strong> 10-15 minutes •
                    <strong className="text-accent ml-2">Next step:</strong> Monte Carlo simulation
                  </p>
                </div>

                <Link
                  href="/calculators/unified"
                  className="block w-full text-center bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105"
                >
                  Start All-in-One Plan →
                </Link>
              </div>

              {/* Path 2: Step-by-Step Guided */}
              <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-8 hover:shadow-2xl transition-all duration-300 hover:border-blue-500">
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  DETAILED
                </div>
                <div className="text-5xl mb-4">📊</div>
                <h2 className="text-2xl font-serif font-bold text-primary mb-3">
                  Step-by-Step Workflow
                </h2>
                <p className="text-gray-600 mb-6">
                  Build your plan gradually with guided navigation through each calculator.
                  Detailed analysis and insights at every step.
                </p>

                <div className="mb-6">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">7-step workflow:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 font-bold">1.</span>
                      <span>Investment projection & growth</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 font-bold">2.</span>
                      <span>Retirement withdrawal strategy</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 font-bold">3.</span>
                      <span>Social Security benefits</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 font-bold">4.</span>
                      <span>Pension & annuity income</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 font-bold">5.</span>
                      <span>Budget & cash flow → 6. Monte Carlo → 7. Narrative</span>
                    </li>
                  </ul>
                </div>

                <div className="mb-6 p-4 bg-white/50 rounded-lg border border-blue-300">
                  <p className="text-sm text-gray-700">
                    <strong className="text-blue-600">Time:</strong> 20-30 minutes •
                    <strong className="text-blue-600 ml-2">Benefit:</strong> Comprehensive insights
                  </p>
                </div>

                <Link
                  href="/calculators/investment-projection"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105"
                >
                  Start Step 1: Investment →
                </Link>
              </div>
            </div>

            {/* Or browse all */}
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                Or browse individual calculators below
              </p>
              <a
                href="#calculators"
                className="inline-flex items-center gap-2 text-primary hover:text-accent font-semibold transition-colors"
              >
                <span>View All Calculators</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="bg-section py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="font-semibold text-lg mb-2 text-primary">100% Private</h3>
                <p className="text-gray-600 text-sm">
                  All calculations run in your browser. No data is stored or transmitted.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-semibold text-lg mb-2 text-primary">Precision Calculations</h3>
                <p className="text-gray-600 text-sm">
                  Using industry-standard formulas with decimal precision (no rounding errors).
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">💡</div>
                <h3 className="font-semibold text-lg mb-2 text-primary">Free & Open</h3>
                <p className="text-gray-600 text-sm">
                  No sign-up required. Professional-grade tools, completely free.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Calculators Grid */}
        <section id="calculators" className="py-16 px-4 bg-section">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-primary mb-4">
                All Financial Calculators
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Browse and jump to any individual calculator, or use our guided workflows above
                for a structured approach.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calculators.map((calc, index) => (
                <Card
                  key={index}
                  hover={calc.status === 'available'}
                  className={`relative ${calc.status === 'coming-soon' ? 'opacity-60' : ''} ${calc.featured ? 'ring-2 ring-accent' : ''}`}
                >
                  {calc.featured && (
                    <div className="absolute top-4 right-4 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Recommended
                    </div>
                  )}
                  {calc.status === 'coming-soon' && (
                    <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Coming Soon
                    </div>
                  )}

                  <div className="flex flex-col h-full">
                    <div className="text-5xl mb-4">{calc.icon}</div>
                    <h3 className="text-xl font-serif font-bold text-primary mb-2">
                      {calc.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex-grow">
                      {calc.description}
                    </p>
                    {calc.status === 'available' ? (
                      <Link
                        href={calc.href}
                        className="inline-block bg-accent hover:bg-accent/90 text-white font-medium px-4 py-2 rounded-md transition-colors text-center"
                      >
                        Open Calculator →
                      </Link>
                    ) : (
                      <div className="inline-block bg-gray-300 text-gray-500 font-medium px-4 py-2 rounded-md text-center cursor-not-allowed">
                        Coming Soon
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-primary text-white py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-4xl font-serif font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Enter Your Data</h3>
                <p className="text-white/80">
                  Input your current savings, income, age, and retirement goals.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Run Calculations</h3>
                <p className="text-white/80">
                  Our tools use industry-standard formulas to project your financial future.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Insights</h3>
                <p className="text-white/80">
                  View detailed charts, projections, and personalized recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-section py-8 px-4 border-t border-gray-200">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                <strong>Disclaimer:</strong> These calculators are for educational and
                informational purposes only. Not financial, legal, or tax advice.
                Consult with qualified professionals before making financial decisions.
              </p>
              <p className="text-xs text-gray-500">
                © 2026 Financial Planning Hub. All calculations are estimates based
                on assumptions provided.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
