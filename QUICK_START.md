# Quick Start Guide

## 🚀 First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open browser to http://localhost:3000

# 4. Clear localStorage (in browser console - F12)
localStorage.clear(); location.reload();
```

## 🧪 Testing Calculators

**Test Flow** (5-10 minutes):
1. **Investment Projection** → Enter $100k, age 30, retire 65, click Calculate
2. **Retirement Withdrawal** → Should auto-fill balance, click Calculate
3. **Social Security** → Enter $75k salary, age 67, click Calculate
4. **Pension** → Enter $24k annual, click Calculate
5. **Budget & Cash Flow** → Enter $50k expenses, click Analyze

**Expected Result**: All charts render, no errors in console

## 🐛 If Something Breaks

```javascript
// In browser console (F12):
localStorage.clear()
location.reload()
```

## 📊 Current Status (65% Complete)

✅ **Working** (15/25 tasks):
- 5 calculators fully functional
- Charts rendering correctly
- Data persistence working
- Decimal.js serialization fixed

❌ **Not Built Yet** (10/25 tasks):
- Monte Carlo simulation
- Strategy narrative
- Unit tests
- Full accessibility audit

## 🔧 Common Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm test             # Run tests (not set up yet)
npm run lint         # ESLint check
```

## 📁 Important Files

- **PROJECT_STATUS.md** - Full status tracking
- **README.md** - Documentation
- **CLAUDE.md** - Project guidelines
- **store/calculator-store.ts** - Main state management
- **types/calculator.types.ts** - TypeScript definitions

## 🎯 Next Phase

**Phase 4**: Monte Carlo Simulation + Strategy Narrative
- Estimated time: 8-10 hours
- See PROJECT_STATUS.md for details

## 💡 Pro Tips

1. Always clear localStorage after code changes to store
2. Check browser console (F12) for errors
3. Test calculator flow after each change
4. Build often: `npm run build`
5. Read PROJECT_STATUS.md for detailed tracking

---

**Need Help?** Check PROJECT_STATUS.md for:
- Detailed task list
- Recent bug fixes
- File structure
- Testing checklist
