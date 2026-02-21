#chris notes and change requests

## Progress Log

### 2026-02-19 - Netlify Deployment Fixes
- ✅ Fixed TypeScript null-safety error in `income-analysis/page.tsx` (line 78)
  - Added optional chaining and nullish coalescing for `retirementWithdrawal.results?.yearByYear`
- ✅ Added missing `Decimal` import in `retirement-withdrawal/page.tsx`
- ✅ Manually pushed site to Netlify for now
- 🔄 TODO: Establish git repository and connect to Netlify site for automatic deployments
- 🔄 TODO: Complete Monte Carlo simulations
- 🔄 TODO: Add narrative sections
- Status: Taking a break

overall - create a data entry page where you can input all of your inputs on one page rather than going to each calculator seperately.  

## investment projection calculator
change  employer match to be an annual dollar amount

asset allocation sliders are difficult to adjust because of the way they move inrelation to each other - lets make it so the stocks and bonds are adjustable and the cash is just waht is left over.  make it so you can adjust the stocks first and the ramainder will be bonds then adjust bonds that will adjust the amount of cash the bond slider should not flow up to the stocks - just down to cash.

investment projection shoud state the growth rate used to project

## retirement withdrawal calculator
balance over time should take earnings into consideration, not just withdraw from principal

