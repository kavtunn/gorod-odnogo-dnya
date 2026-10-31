#!/usr/bin/env node
/**
 * Schema checks for web/public/json/city.json.
 * Run: npm run test:city
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'public/json/city.json')

const STEP_KINDS = new Set([
  'narration',
  'hotspot',
  'choice',
  'chat',
  'sort',
  'checklist',
])
const OUTCOMES = new Set(['safe', 'risky', 'learn'])
const PHASES = new Set(['morning', 'school', 'afternoon', 'evening'])

const errors = []

function fail(msg) {
  errors.push(msg)
}

function assertChoice(c, where) {
  if (!c || typeof c !== 'object') {
    fail(`${where}: choice must be object`)
    return
  }
  for (const key of ['id', 'label', 'outcome', 'consequence', 'tip']) {
    if (typeof c[key] !== 'string' || !c[key]) {
      fail(`${where}: missing string "${key}"`)
    }
  }
  if (c.outcome && !OUTCOMES.has(c.outcome)) {
    fail(`${where}: bad outcome "${c.outcome}"`)
  }
}

function assertStep(step, where) {
  if (!step?.id || typeof step.id !== 'string') fail(`${where}: missing id`)
  if (!STEP_KINDS.has(step.kind)) fail(`${where}: unknown kind "${step?.kind}"`)
  if (typeof step.text !== 'string' || !step.text) {
    fail(`${where}: missing text`)
  }

  switch (step.kind) {
    case 'narration':
      break
    case 'choice': {
      if (!Array.isArray(step.choices) || step.choices.length < 2) {
        fail(`${where}: choice needs ≥2 choices`)
      } else {
        step.choices.forEach((c, i) => assertChoice(c, `${where}.choices[${i}]`))
      }
      break
    }
    case 'hotspot': {
      if (!Array.isArray(step.hotspots) || step.hotspots.length < 2) {
        fail(`${where}: hotspot needs ≥2 hotspots`)
      } else {
        const correct = step.hotspots.filter((h) => h.correct).length
        if (correct < 1) fail(`${where}: need ≥1 correct hotspot`)
        step.hotspots.forEach((h, i) => {
          const w = `${where}.hotspots[${i}]`
          for (const key of ['id', 'label', 'tip']) {
            if (typeof h[key] !== 'string' || !h[key]) fail(`${w}: bad "${key}"`)
          }
          if (typeof h.x !== 'number' || typeof h.y !== 'number') {
            fail(`${w}: x/y must be numbers`)
          }
          if (typeof h.correct !== 'boolean') fail(`${w}: correct must be boolean`)
        })
      }
      if (step.hotspotOutcomes) {
        for (const key of ['pass', 'miss', 'wrong']) {
          const o = step.hotspotOutcomes[key]
          if (!o) continue
          if (typeof o.consequence !== 'string' || !o.consequence) {
            fail(`${where}.hotspotOutcomes.${key}: need consequence`)
          }
          if (typeof o.tip !== 'string' || !o.tip) {
            fail(`${where}.hotspotOutcomes.${key}: need tip`)
          }
        }
      }
      break
    }
    case 'sort': {
      const sort = step.sort
      if (!sort || !Array.isArray(sort.bins) || sort.bins.length < 2) {
        fail(`${where}: sort.bins need ≥2`)
      }
      if (!Array.isArray(sort?.items) || sort.items.length < 2) {
        fail(`${where}: sort.items need ≥2`)
      } else {
        const binIds = new Set((sort.bins || []).map((b) => b.id))
        sort.items.forEach((item, i) => {
          const w = `${where}.sort.items[${i}]`
          if (!item.id || !item.label) fail(`${w}: need id/label`)
          if (!binIds.has(item.bin)) fail(`${w}: bin "${item.bin}" not in bins`)
          if (
            item.wrongConsequence != null &&
            typeof item.wrongConsequence !== 'string'
          ) {
            fail(`${w}: wrongConsequence must be string`)
          }
        })
        ;(sort.bins || []).forEach((b, i) => {
          if (!b.id || !b.label) fail(`${where}.sort.bins[${i}]: need id/label`)
        })
      }
      break
    }
    case 'checklist': {
      if (!Array.isArray(step.checklist) || step.checklist.length < 2) {
        fail(`${where}: checklist needs ≥2 items`)
      } else {
        const required = step.checklist.filter((c) => c.required).length
        if (required < 1) fail(`${where}: need ≥1 required checklist item`)
        step.checklist.forEach((c, i) => {
          const w = `${where}.checklist[${i}]`
          if (!c.id || !c.label) fail(`${w}: need id/label`)
          if (typeof c.required !== 'boolean') fail(`${w}: required must be boolean`)
          if (c.consequence != null && typeof c.consequence !== 'string') {
            fail(`${w}: consequence must be string`)
          }
        })
      }
      break
    }
    case 'chat': {
      const chat = step.chat
      if (!chat?.npcName) fail(`${where}: chat.npcName required`)
      if (!Array.isArray(chat?.messages) || chat.messages.length < 1) {
        fail(`${where}: chat.messages need ≥1`)
      }
      if (!Array.isArray(chat?.replies) || chat.replies.length < 2) {
        fail(`${where}: chat.replies need ≥2`)
      } else {
        chat.replies.forEach((c, i) => assertChoice(c, `${where}.chat.replies[${i}]`))
      }
      break
    }
    default: {
      const _exhaustive = step.kind
      fail(`${where}: unhandled kind "${_exhaustive}"`)
    }
  }
}

const raw = readFileSync(path, 'utf8')
let data
try {
  data = JSON.parse(raw)
} catch (e) {
  console.error('Invalid JSON:', e.message)
  process.exit(1)
}

if (!Array.isArray(data.phases) || data.phases.length < 1) fail('phases missing')
if (!Array.isArray(data.locations) || data.locations.length < 1) fail('locations missing')
if (!data.scenes || typeof data.scenes !== 'object') fail('scenes missing')
if (!Array.isArray(data.quiz)) fail('quiz missing')

const locIds = new Set()
for (const loc of data.locations) {
  if (!loc.id || !loc.sceneId || !loc.image) fail(`location bad: ${JSON.stringify(loc)}`)
  if (locIds.has(loc.id)) fail(`duplicate location ${loc.id}`)
  locIds.add(loc.id)
  if (!data.scenes[loc.sceneId]) fail(`location ${loc.id}: missing scene ${loc.sceneId}`)
}

for (const [sceneId, scene] of Object.entries(data.scenes)) {
  if (!locIds.has(scene.locationId)) {
    fail(`scene ${sceneId}: unknown locationId ${scene.locationId}`)
  }
  if (!Array.isArray(scene.steps) || scene.steps.length < 1) {
    fail(`scene ${sceneId}: need ≥1 step`)
  } else {
    scene.steps.forEach((step, i) => assertStep(step, `${sceneId}.steps[${i}]`))
  }
  const meta = data.unlockAfter?.[sceneId]
  if (!meta) fail(`unlockAfter missing for ${sceneId}`)
  else {
    if (!PHASES.has(meta.phase)) fail(`unlockAfter.${sceneId}: bad phase`)
    if (!Array.isArray(meta.unlock)) fail(`unlockAfter.${sceneId}: unlock must be array`)
    for (const id of meta.unlock) {
      if (!locIds.has(id)) fail(`unlockAfter.${sceneId}: unknown unlock "${id}"`)
    }
  }
}

data.quiz.forEach((q, i) => {
  const w = `quiz[${i}]`
  if (!q.id || !q.question) fail(`${w}: need id/question`)
  if (!Array.isArray(q.options) || q.options.length < 2) fail(`${w}: need ≥2 options`)
  if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= q.options.length) {
    fail(`${w}: correct index out of range`)
  }
  if (!q.explain) fail(`${w}: need explain`)
})

if (errors.length) {
  console.error(`city.json: ${errors.length} error(s)`)
  for (const e of errors) console.error(' -', e)
  process.exit(1)
}

console.log(
  `city.json OK · ${data.locations.length} locations · ${Object.keys(data.scenes).length} scenes · ${data.quiz.length} quiz`,
)
