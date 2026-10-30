import type { PhaseId, ProgressState } from '../types'

export const STORAGE_KEY = 'gorod-odnogo-dnya-v1'

export const initialProgress: ProgressState = {
  playerName: '',
  onboarded: false,
  dayFinished: false,
  phase: 'morning',
  completedScenes: [],
  decisions: [],
  unlockedLocations: ['home'],
  quizScore: null,
}

export function loadProgress(): ProgressState {
  try {
    return {
      ...initialProgress,
      ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'),
    }
  } catch {
    return { ...initialProgress }
  }
}

export function saveProgress(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function isPhaseId(value: string): value is PhaseId {
  return (
    value === 'morning' ||
    value === 'school' ||
    value === 'afternoon' ||
    value === 'evening'
  )
}
