# Financial Planning Hub

Comprehensive financial planning web application with 7 interconnected calculators for retirement planning, investment analysis, and cash flow modeling.

## Features

- **Investment Projection Calculator**: Project investment growth with asset allocation
- **Retirement Withdrawal Calculator**: Calculate sustainable withdrawal rates (4% rule)
- **Social Security Estimator**: Estimate benefits using SSA bend point formula
- **Pension & Annuity Calculator**: Calculate lifetime value of pension income
- **Budget & Cash Flow Analysis**: Aggregate all income sources vs expenses
- **Monte Carlo Simulation**: Stress test with 1,000,000 market scenarios (coming soon)
- **Strategy Narrative**: AI-powered retirement strategy report (coming soon)

## Technology Stack

- **Framework**: Next.js 15 with TypeScript and App Router
- **Styling**: Tailwind CSS 3.x with custom design system
- **State Management**: Zustand with LocalStorage persistence
- **Financial Calculations**: Decimal.js for precision (no floating-point errors)
- **Charts**: Recharts for interactive visualizations
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Static export for Netlify

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### First Time Setup

**Important**: If you've tested this app before, clear your browser's LocalStorage to avoid Decimal serialization issues:

```javascript
// Open browser console and run:
localStorage.clear()
// Then refresh the page
```

## Usage

1. **Start with Investment Projection**: Enter your current savings, age, and asset allocation
2. **Calculate Retirement Withdrawal**: Auto-filled with your projected balance
3. **Add Income Sources**: Calculate Social Security and/or Pension benefits
4. **Analyze Cash Flow**: See if income covers expenses throughout retirement
5. **Run Monte Carlo**: Stress test your plan with market volatility (coming soon)
6. **Generate Strategy**: Get personalized recommendations (coming soon)

## Calculator Data Flow

```
Investment Projection
         ↓ (final balance)
Retirement Withdrawal
         ↓ (annual withdrawal)
  Social Security →
  Pension        →  Budget & Cash Flow → Monte Carlo → Strategy Narrative
         ↓ (annual benefits)
```

## Project Structure

```
/app                    # Next.js App Router pages
/components
  /calculators          # Calculator-specific components
  /charts               # Recharts visualizations
  /forms                # Reusable form inputs
  /layout               # Header, Footer
  /ui                   # Button, Card components
/lib
  /calculations         # Financial formulas (FV, PV, PMT, etc.)
  /formatters           # Currency and percentage formatting
  /utils                # Helper utilities
/store
  /slices               # Zustand calculator slices
  calculator-store.ts   # Main store with persistence
/types                  # TypeScript definitions
/constants              # Financial constants (rates, bend points)
```

## Key Features

### Precise Financial Calculations
All calculations use Decimal.js to avoid JavaScript floating-point errors:
- ✅ `0.1 + 0.2 = 0.3` (not 0.30000000000000004)
- Perfect for money calculations

### LocalStorage Persistence
Your data is saved locally and persists across sessions. All processing happens in your browser - no data is sent to servers.

### Interconnected Calculators
Calculators auto-populate from each other:
- Investment final balance → Withdrawal starting balance
- All income sources → Budget aggregation

### Professional Design
Fisher Investments-inspired color scheme:
- Primary: Deep Sherwood Green (#004A3D)
- Accent: Mountain Meadow Teal (#15c18f)

## Deployment

### Netlify

The app is configured for static export to Netlify:

```bash
# Build static export
npm run build

# Output directory: ./out
```

Deploy the `out` folder to Netlify. All calculations run client-side for privacy and performance.

## Disclaimers

**Important**: This application is for educational and informational purposes only.

- ❌ Not financial, legal, or tax advice
- ❌ Not a substitute for professional financial planning
- ✅ Estimates based on historical averages and assumptions
- ✅ Consult qualified professionals before making financial decisions

## Financial Assumptions

- **Equities**: 10% average return, 18% volatility
- **Bonds**: 5% average return, 6% volatility
- **Cash**: 2% average return, 1% volatility
- **Inflation**: 3% default
- **Withdrawal Rate**: 4% (traditional safe withdrawal rate)
- **Social Security**: 2026 bend points ($1,226, $7,391)

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - See LICENSE file for details

## Contributing

This is a personal project, but suggestions and bug reports are welcome via GitHub issues.

## Acknowledgments

- Financial formulas based on industry standards
- SSA benefit calculations from official Social Security Administration guidelines
- 4% withdrawal rule from Trinity Study
- Historical returns from S&P 500, Bloomberg Barclays Aggregate, Treasury Bills
