# Financial Website & Calculator Project

## Project Overview
This project is a comprehensive financial planning website featuring calculators for retirement planning, investment analysis, budgeting, and other personal finance tools.

## Core Features

### Financial Calculators
- **Retirement Planning Calculator**: Estimate retirement savings needs, account for inflation, investment returns, and withdrawal strategies
- **Compound Interest Calculator**: Calculate growth of investments over time
- **Mortgage Calculator**: Monthly payments, amortization schedules, early payoff scenarios
- **Loan Calculator**: Personal loans, auto loans, payment schedules
- **Investment Portfolio Analyzer**: Asset allocation, risk assessment, projected returns
- **Budget Planner**: Income vs expenses, savings goals, financial health metrics
- **Tax Calculator**: Estimate tax liability, deductions, effective tax rates
- **Net Worth Tracker**: Assets vs liabilities over time

## Development Guidelines

### Code Quality
- Write clean, modular, and well-documented code
- Use TypeScript for type safety in financial calculations
- Include comprehensive unit tests for all calculation functions
- Validate all user inputs (handle edge cases, negative numbers, unrealistic values)
- Use decimal/precision libraries (like decimal.js) for accurate financial calculations
- Never use floating-point arithmetic directly for money calculations

### Financial Calculations Best Practices
- **Accuracy**: Use precise decimal arithmetic for all monetary calculations
- **Validation**: Validate inputs (e.g., interest rates 0-100%, positive principal amounts)
- **Edge Cases**: Handle zero values, very large numbers, negative returns
- **Rounding**: Round currency to 2 decimal places, percentages appropriately
- **Time Value of Money**: Use proper formulas (PV, FV, PMT, NPV, IRR)
- **Inflation Adjustment**: Account for inflation in long-term projections
- **Tax Considerations**: Include tax-advantaged accounts (401k, IRA, Roth IRA)

### Key Financial Formulas

#### Future Value (FV)
```
FV = PV × (1 + r)^n
FV = PMT × [((1 + r)^n - 1) / r]  // for regular contributions
```

#### Present Value (PV)
```
PV = FV / (1 + r)^n
```

#### Monthly Loan Payment (PMT)
```
PMT = P × [r(1 + r)^n] / [(1 + r)^n - 1]
where P = principal, r = monthly rate, n = number of payments
```

#### Compound Annual Growth Rate (CAGR)
```
CAGR = (Ending Value / Beginning Value)^(1/years) - 1
```

#### Retirement Withdrawal (4% Rule)
```
Safe Annual Withdrawal = Portfolio Value × 0.04
```

### Security & Privacy
- Never store sensitive financial data without encryption
- Don't require users to create accounts unless necessary
- Keep all calculations client-side when possible
- Don't log financial inputs or results
- Include privacy policy and disclaimers

### UI/UX Principles
- Clean, professional design suitable for financial topics
- Mobile-responsive layouts
- Clear labeling of all inputs and outputs
- Tooltips/help text for complex financial terms
- Visual charts and graphs for results (use libraries like Chart.js, Recharts)
- Printable/exportable results
- Dark mode support for extended use

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- Sufficient color contrast
- Clear error messages

### User Input Handling
- Provide sensible default values
- Support both comma and period as decimal separators
- Allow currency symbols in input (strip before calculation)
- Real-time calculation updates
- Input validation with helpful error messages
- Min/max bounds on realistic values

### Disclaimers
Always include appropriate disclaimers:
- "For educational and informational purposes only"
- "Not financial, legal, or tax advice"
- "Consult with a qualified professional before making financial decisions"
- "Results are estimates based on assumptions provided"
- "Past performance does not guarantee future results"

## Technical Stack Recommendations

### Frontend
- React or Next.js for UI
- TypeScript for type safety
- Tailwind CSS or styled-components for styling
- Chart.js, Recharts, or D3.js for visualizations
- React Hook Form or Formik for form handling
- Zod for schema validation

### Libraries
- **decimal.js** or **big.js**: Precise decimal arithmetic
- **date-fns** or **Luxon**: Date manipulation
- **numeral.js** or **Intl.NumberFormat**: Number formatting
- **React Query**: Data fetching/caching (if using APIs)

### Testing
- Jest for unit tests
- React Testing Library for component tests
- Test all calculation functions with edge cases
- Snapshot tests for UI components

## Project Structure
```
/src
  /components
    /calculators
      RetirementCalculator.tsx
      MortgageCalculator.tsx
      CompoundInterestCalculator.tsx
    /common
      InputField.tsx
      ResultDisplay.tsx
      Chart.tsx
  /utils
    /calculations
      retirement.ts
      mortgage.ts
      compound-interest.ts
    /formatters
      currency.ts
      percentage.ts
  /constants
    financialConstants.ts  // default rates, limits, etc.
  /types
    calculator.types.ts
  /hooks
    useCalculator.ts
```

## Testing Requirements
- All calculation functions must have unit tests
- Test edge cases: zero, negative, very large numbers
- Verify rounding and precision
- Test formula accuracy against known values
- Validate error handling

## Performance
- Optimize calculations for real-time updates
- Debounce input changes if needed
- Lazy load calculator components
- Minimize re-renders with React.memo
- Use Web Workers for complex calculations if needed

## Documentation
- Include inline comments for complex formulas
- Document assumptions (inflation rates, return rates, etc.)
- Provide references to financial formulas used
- Create user guides for each calculator

## Compliance
- Include appropriate legal disclaimers
- Follow financial content guidelines
- Ensure calculations match industry standards
- Cite sources for default values (e.g., historical market returns)

## Future Enhancements
- Save/load scenarios
- Compare multiple scenarios side-by-side
- PDF export of results
- Email results functionality
- Integration with real financial APIs
- Multi-currency support
- Historical data visualization
