import type { DecisionRecord, ModuleId, PhaseId, ProgressState, UserRole } from '../types'

const KEY = 'city-one-day-progress-v2'

export const DEMO_LOCATION_IDS = ['road', 'school', 'net'] as const
export const DEMO_SCENE_IDS = ['scene-road', 'scene-evac', 'scene-chat'] as const

export const initial: ProgressState = {
  playerName: '',
  role: null,
  onboarded: false,
  demoMode: false,
  soundEnabled: true,
  dayFinished: false,
  phase: 'morning',
  completedScenes: [],
  decisions: [],
  unlockedLocations: ['home'],
  teacherFilter: 'all',
  quizScore: null,
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...initial }
    return { ...initial, ...JSON.parse(raw) as ProgressState }
  } catch {
    return { ...initial }
  }
}

export function saveProgress(state: ProgressState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function resetProgress(): ProgressState {
  localStorage.removeItem(KEY)
  return { ...initial }
}

export function addDecision(state: ProgressState, decision: DecisionRecord): ProgressState {
  return {
    ...state,
    decisions: [...state.decisions, decision],
  }
}

export function completeScene(
  state: ProgressState,
  sceneId: string,
  nextUnlocks: string[],
  nextPhase: PhaseId,
  dayFinished = false,
): ProgressState {
  const completedScenes = state.completedScenes.includes(sceneId)
    ? state.completedScenes
    : [...state.completedScenes, sceneId]
  const unlockedLocations = Array.from(new Set([...state.unlockedLocations, ...nextUnlocks]))

  return {
    ...state,
    completedScenes,
    unlockedLocations,
    phase: nextPhase,
    dayFinished: dayFinished || state.dayFinished,
  }
}

export function setTeacherFilter(state: ProgressState, filter: ModuleId | 'all'): ProgressState {
  return { ...state, teacherFilter: filter }
}

export function setPlayerName(state: ProgressState, playerName: string): ProgressState {
  return { ...state, playerName }
}

export function setQuizScore(state: ProgressState, quizScore: number): ProgressState {
  return { ...state, quizScore }
}

export function setRole(state: ProgressState, role: UserRole): ProgressState {
  return { ...state, role }
}

export function finishOnboarding(state: ProgressState): ProgressState {
  return { ...state, onboarded: true }
}

export function setSoundEnabled(state: ProgressState, soundEnabled: boolean): ProgressState {
  return { ...state, soundEnabled }
}

export function startDemo(state: ProgressState): ProgressState {
  return {
    ...state,
    onboarded: true,
    demoMode: true,
    dayFinished: false,
    role: state.role ?? 'teacher',
    phase: 'morning',
    completedScenes: [],
    decisions: [],
    unlockedLocations: [...DEMO_LOCATION_IDS],
    teacherFilter: 'all',
    quizScore: null,
  }
}

export function startFullDay(state: ProgressState, role: UserRole): ProgressState {
  return {
    ...initial,
    onboarded: true,
    demoMode: false,
    soundEnabled: state.soundEnabled,
    playerName: state.playerName,
    role,
  }
}
