import type { ProgressState } from '../types'

export const STORAGE_KEY = 'gorod-odnogo-dnya-v2'

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
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...initialProgress }
    return { ...initialProgress, ...JSON.parse(raw) }
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
