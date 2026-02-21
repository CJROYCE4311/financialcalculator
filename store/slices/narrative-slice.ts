import { StateCreator } from 'zustand'
import type { CalculatorStore, NarrativeState } from '@/types/calculator.types'

export interface NarrativeSlice {
  narrative: NarrativeState
  updateNarrativeInputs: (inputs: Partial<NarrativeState['inputs']>) => void
  generateNarrative: () => void
  resetNarrative: () => void
}

const initialState: NarrativeState = {
  inputs: {
    includeExecutiveSummary: true,
    includeAssetAnalysis: true,
    includeIncomeAnalysis: true,
    includeSuccessEvaluation: true,
    includeRecommendations: true,
    includeDisclaimer: true,
  },
  results: null,
  lastCalculated: null,
}

export const createNarrativeSlice: StateCreator<
  CalculatorStore,
  [],
  [],
  NarrativeSlice
> = (set, get) => ({
  narrative: initialState,

  updateNarrativeInputs: (inputs) => {
    set((state) => ({
      narrative: {
        ...state.narrative,
        inputs: {
          ...state.narrative.inputs,
          ...inputs,
        },
      },
    }))
  },

  generateNarrative: () => {
    const state = get()

    // Import the template generator
    const { generateStrategyNarrative } = require('@/lib/narrative/template-generator')

    // Generate the narrative using all calculator data
    const results = generateStrategyNarrative(state, state.narrative.inputs)

    set((stateToUpdate) => ({
      narrative: {
        ...stateToUpdate.narrative,
        results,
        lastCalculated: new Date(),
      },
    }))
  },

  resetNarrative: () => {
    set({ narrative: initialState })
  },
})
