export type ModuleId =
  | 'road'
  | 'school'
  | 'health'
  | 'ecology'
  | 'digital'
  | 'professions'
  | 'all'

export type PhaseId = 'morning' | 'school' | 'afternoon' | 'evening'

export type ChoiceOutcome = 'safe' | 'risky' | 'learn'

export type ViewId = 'welcome' | 'map' | 'scene' | 'quiz'

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
  hotspots?: {
    id: string
    label: string
    x: number
    y: number
    correct: boolean
    tip: string
  }[]
  chat?: {
    npcName: string
    messages: { from: 'npc' | 'system'; text: string }[]
    replies: Choice[]
  }
  sort?: {
    items: { id: string; label: string; bin: string }[]
    bins: { id: string; label: string }[]
  }
  checklist?: { id: string; label: string; required: boolean }[]
}

export interface Scene {
  locationId: string
  module: ModuleId
  title: string
  summary: string
  steps: SceneStep[]
}

export interface Location {
  id: string
  name: string
  short: string
  module: ModuleId
  sceneId: string
  image: string
}

export interface Phase {
  id: PhaseId
  label: string
  clock: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct: number
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
  onboarded: boolean
  dayFinished: boolean
  phase: PhaseId
  completedScenes: string[]
  decisions: DecisionRecord[]
  unlockedLocations: string[]
  quizScore: number | null
}

export interface CityData {
  phases: Phase[]
  moduleLabels: Record<string, string>
  unlockAfter: Record<string, { unlock: string[]; phase: PhaseId }>
  locations: Location[]
  artTitles: Record<string, string>
  quiz: QuizQuestion[]
  scenes: Record<string, Scene>
}
