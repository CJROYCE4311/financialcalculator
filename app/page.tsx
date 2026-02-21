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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/calculators/unified"
                  className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start Complete Planning
                </Link>
                <a
                  href="#calculators"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 border-2 border-white/30"
                >
                  Explore Individual Tools
                </a>
              </div>
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
        <section id="calculators" className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-primary mb-4">
                Financial Calculators
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Nine interconnected tools that work together to create your complete
                retirement plan.
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
