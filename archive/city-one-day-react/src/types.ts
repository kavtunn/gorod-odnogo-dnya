export type ModuleId =
  | 'road'
  | 'school'
  | 'health'
  | 'ecology'
  | 'digital'
  | 'professions'

export type PhaseId = 'morning' | 'school' | 'afternoon' | 'evening'

export type ChoiceOutcome = 'safe' | 'risky' | 'learn'

export type UserRole = 'student' | 'teacher' | null

export interface Choice {
  id: string
  label: string
  outcome: ChoiceOutcome
  consequence: string
  tip: string
}

export interface SceneStep {
  id: string
  kind: 'narration' | 'hotspot' | 'choice' | 'chat' | 'sort' | 'checklist'
  text: string
  choices?: Choice[]
  hotspots?: { id: string; label: string; x: number; y: number; correct: boolean; tip: string }[]
  chat?: {
    npcName: string
    messages: { from: 'npc' | 'system'; text: string }[]
    replies: Choice[]
  }
  sort?: {
    items: { id: string; label: string; bin: 'paper' | 'plastic' | 'glass' | 'mixed' }[]
    bins: { id: 'paper' | 'plastic' | 'glass' | 'mixed'; label: string }[]
  }
  checklist?: { id: string; label: string; required: boolean }[]
}

export interface Scene {
  id: string
  locationId: string
  module: ModuleId
  phase: PhaseId
  title: string
  summary: string
  handbookId: string
  steps: SceneStep[]
}

export interface Location {
  id: string
  name: string
  short: string
  phase: PhaseId
  module: ModuleId
  x: number
  y: number
  sceneId: string
}

export interface HandbookEntry {
  id: string
  title: string
  module: ModuleId
  bullets: string[]
}

export interface QuizQuestion {
  id: string
  module: ModuleId
  question: string
  options: string[]
  correctIndex: number
  explain: string
}

export interface DecisionRecord {
  sceneId: string
  stepId: string
  choiceId: string
  label: string
  outcome: ChoiceOutcome
  tip: string
  at: string
}

export interface ProgressState {
  playerName: string
  role: UserRole
  onboarded: boolean
  demoMode: boolean
  soundEnabled: boolean
  dayFinished: boolean
  phase: PhaseId
  completedScenes: string[]
  decisions: DecisionRecord[]
  unlockedLocations: string[]
  teacherFilter: ModuleId | 'all'
  quizScore: number | null
}
