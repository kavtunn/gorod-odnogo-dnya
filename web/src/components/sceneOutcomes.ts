import type { Choice, SceneStep } from '../types'

export function hotspotChoice(
  step: SceneStep,
  good: number,
  need: number,
  badLabels: string[],
  badTips: string,
  foundTips: string,
): Choice {
  const outs = step.hotspotOutcomes

  if (badLabels.length > 0) {
    return {
      id: `${step.id}-wrong`,
      label: `Отмечено с ошибкой (${badLabels.join(', ')})`,
      outcome: 'risky',
      consequence:
        outs?.wrong?.consequence ||
        `Лишняя точка сбила фокус. Верные: ${good} из ${need}.`,
      tip:
        outs?.wrong?.tip ||
        badTips ||
        'Ищи то, что реально мешает безопасности.',
    }
  }

  if (good >= need && need > 0) {
    return {
      id: `${step.id}-pass`,
      label: 'Все нужные риски найдены',
      outcome: 'safe',
      consequence: outs?.pass?.consequence || 'Ты заметил главное на сцене.',
      tip: outs?.pass?.tip || foundTips || 'Так переход становится спокойнее.',
    }
  }

  return {
    id: `${step.id}-miss`,
    label: `Найдено ${good} из ${need}`,
    outcome: 'learn',
    consequence:
      outs?.miss?.consequence || 'Часть важных мест осталась незамеченной.',
    tip: outs?.miss?.tip || 'Можно было отметить больше рисков на фото.',
  }
}

export function checklistChoice(
  step: SceneStep,
  checkedIds: string[],
): Choice {
  const items = step.checklist || []
  const missed = items.filter((c) => c.required && !checkedIds.includes(c.id))
  const extras = items.filter((c) => !c.required && checkedIds.includes(c.id))
  const taken = items.filter((c) => checkedIds.includes(c.id))

  if (checkedIds.length === 0) {
    return {
      id: `${step.id}-empty`,
      label: 'Ничего не отмечено',
      outcome: 'risky',
      consequence: 'Ты ничего не выбрал — ситуация идёт без подготовки.',
      tip: 'Даже короткий список действий лучше пустого.',
    }
  }

  if (missed.length === 0 && extras.length === 0) {
    return {
      id: `${step.id}-pass`,
      label: taken.map((c) => c.label).join('; '),
      outcome: 'safe',
      consequence: 'Нужные действия на месте, лишнего нет.',
      tip: 'Так и держат план: только то, что помогает.',
    }
  }

  const bits: string[] = []
  const tips: string[] = []

  for (const m of missed) {
    bits.push(m.consequence || `Не хватает: «${m.label}».`)
    if (m.tip) tips.push(m.tip)
  }
  for (const e of extras) {
    bits.push(e.consequence || `Лишнее: «${e.label}».`)
    if (e.tip) tips.push(e.tip)
  }

  const labelParts = [
    ...taken.map((c) => c.label),
    ...missed.map((c) => `не взял: ${c.label}`),
  ]

  return {
    id: `${step.id}-mix`,
    label: labelParts.join('; '),
    outcome: extras.length ? 'risky' : 'learn',
    consequence: bits.join(' '),
    tip: tips.join(' ') || 'Исправь набор в следующий раз.',
  }
}

export function sortChoice(
  step: SceneStep,
  placed: Record<string, string>,
): Choice {
  const items = step.sort?.items || []
  const wrong = items.filter((i) => placed[i.id] !== i.bin)

  if (wrong.length === 0) {
    return {
      id: `${step.id}-pass`,
      label: 'Все предметы в нужных баках',
      outcome: 'safe',
      consequence: step.sort?.passConsequence || 'Все на месте.',
      tip: step.sort?.passTip || 'Так и держат сортировку.',
    }
  }

  const tipText =
    wrong
      .map((i) => i.wrongTip)
      .filter(Boolean)
      .join(' ') || 'Не уверен — в смешанные.'

  return {
    id: `${step.id}-wrong`,
    label: wrong.map((i) => i.label).join('; '),
    outcome: wrong.length > items.length / 2 ? 'risky' : 'learn',
    consequence: wrong
      .map(
        (i) => i.wrongConsequence || `«${i.label}» оказался не в том баке.`,
      )
      .join(' '),
    tip: tipText,
  }
}
