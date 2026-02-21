/**
 * localStorage initialization and validation
 * This runs early to catch and clear corrupt data before it can cause issues
 */

const STORAGE_KEY = 'financial-calculator-storage'

export function initializeStorage() {
  // Only run on client
  if (typeof window === 'undefined') return

  try {
    const item = localStorage.getItem(STORAGE_KEY)
    if (!item) return // No data, nothing to validate

    // Try to parse the data
    const parsed = JSON.parse(item)

    // Basic validation
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid storage format')
    }

    console.log('✅ localStorage validated successfully')
  } catch (error) {
    console.error('❌ Corrupt localStorage detected:', error)
    console.log('🧹 Clearing corrupt data...')

    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('✅ Storage cleared - app will start with fresh state')
    } catch (clearError) {
      console.error('❌ Failed to clear storage:', clearError)
    }
  }
}

// Run immediately when this module loads (client-side only)
if (typeof window !== 'undefined') {
  initializeStorage()
}
