# Changelog

All notable changes to the Financial Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-02-21

### 🔧 Fixed - Critical Production Issues

#### Decimal.js Persistence & Hydration
- **Fixed**: Production error `TypeError: t.equities.plus is not a function`
- **Root Cause**: Old localStorage format stored Decimals as plain strings/numbers instead of proper Decimal objects
- **Solution**:
  - Implemented custom storage serialization (`{__decimal: "123"}` format)
  - Bumped storage version to v2 to trigger automatic migration
  - Added old format detection and automatic data clearing
  - Removed `createJSONStorage` wrapper to prevent double-serialization

#### LocalStorage Quota Exceeded
- **Fixed**: `QuotaExceededError` when running Monte Carlo simulations
- **Root Cause**: Storing 1M+ Decimal objects in `allFinalBalances` array (~30MB)
- **Solution**:
  - Exclude `allFinalBalances` from persistence (saves ~95% storage space)
  - Keep essential summary statistics (percentiles, median, success rate)
  - UI only needs percentile data for charts, not raw distribution
  - Reduced storage size from ~30MB to <2MB

### 🎯 Technical Improvements

#### Storage Implementation
- Custom `serializeDecimals()` and `deserializeDecimals()` functions
- Direct storage interface implementation (not wrapped in `createJSONStorage`)
- Proactive localStorage validation and corruption recovery
- Storage size logging for debugging (`💾 Saving to localStorage: X.XX MB`)
- Better error messages for quota exceeded scenarios

#### Migration System
- Version-based storage migrations (v1 → v2)
- Automatic detection and clearing of incompatible data formats
- User-friendly migration messages explaining what's happening
- Safety net in rehydration callback to catch any remaining issues

#### Code Quality
- Simplified rehydration validation logic
- Removed unnecessary in-place state mutation
- Added comprehensive error handling
- Better TypeScript types for storage functions

### 📝 Files Changed
- `store/calculator-store.ts` - Complete storage system rewrite
- `lib/utils/storage-init.ts` - Proactive validation
- `lib/utils/decimal-helpers.ts` - Helper utilities

### 🚀 User Impact
- **Breaking Change**: Users' saved calculator data will be cleared on first load after update
- **Benefit**: All calculations now work correctly with proper Decimal precision
- **UX**: Friendly migration messages explain the one-time data clearing
- **Performance**: 95% reduction in localStorage usage

### 📊 Commits
- `327b992` - Fix Decimal persistence and localStorage quota issues
- `0475042` - Fix production Decimal hydration by bumping storage version

---

## [1.0.0] - Previous versions

### Features
- Investment projection calculator
- Retirement withdrawal calculator
- Social Security calculator
- Pension calculator
- Budget planner
- Monte Carlo simulation (1M iterations)
- Strategy narrative generator
- Unified calculator view
- Dark mode support
- LocalStorage persistence

### Technical Stack
- Next.js 15.5.12
- TypeScript
- Zustand for state management
- Decimal.js for precise financial calculations
- Recharts for data visualization
- Tailwind CSS for styling

---

## Version History Notes

### Storage Version History
- **v2** (2025-02-21): Proper Decimal serialization with `{__decimal: "123"}` format
- **v1** (Previous): Initial persistence implementation (had serialization issues)
- **v0** (Initial): No persistence

### Migration Guide

If you need to restore old data:
1. Data from v1 cannot be automatically migrated due to type incompatibility
2. Users should re-enter their calculator inputs after the v2 update
3. This is a one-time migration required to fix calculation errors

### Known Issues Resolved
- ✅ Monte Carlo QuotaExceededError
- ✅ "plus is not a function" production errors
- ✅ Decimal hydration failures
- ✅ Double-serialization issues
- ✅ LocalStorage corruption recovery

### Developer Notes

#### Testing Production Builds
Always test production builds locally before deploying:
```bash
npm run build
npm start  # Or use your hosting platform's preview
```

#### Clearing LocalStorage for Testing
Console command:
```javascript
localStorage.removeItem('financial-calculator-storage')
location.reload()
```

Or use the exposed function:
```javascript
window.clearCalculatorStorage()
```

#### Storage Size Monitoring
Watch console for storage size logs:
```
💾 Saving to localStorage: 1.23 MB
```

If approaching 5MB, consider excluding more data from `partialize()`.

---

## Future Improvements

### Planned
- [ ] IndexedDB migration for larger storage capacity
- [ ] Optional cloud sync for data backup
- [ ] Import/export functionality for calculator scenarios
- [ ] Historical data comparison
- [ ] PDF export of results

### Under Consideration
- [ ] Multi-currency support
- [ ] Real-time market data integration
- [ ] Collaborative planning (shared scenarios)
- [ ] Mobile app version
