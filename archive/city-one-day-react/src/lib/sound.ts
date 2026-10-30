let ctx: AudioContext | null = null

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  gainValue: number,
) {
  const audio = getCtx()
  if (!audio) return
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.value = gainValue
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + duration)
}

export function playSound(
  kind: 'click' | 'safe' | 'risky' | 'learn' | 'done',
  enabled: boolean,
) {
  if (!enabled) return
  try {
    if (kind === 'click') tone(420, 0.06, 'triangle', 0.04)
    if (kind === 'safe') {
      tone(523, 0.1, 'sine', 0.05)
      setTimeout(() => tone(659, 0.12, 'sine', 0.045), 80)
    }
    if (kind === 'risky') tone(180, 0.22, 'sawtooth', 0.035)
    if (kind === 'learn') tone(392, 0.14, 'triangle', 0.045)
    if (kind === 'done') {
      tone(523, 0.1, 'sine', 0.05)
      setTimeout(() => tone(659, 0.1, 'sine', 0.045), 90)
      setTimeout(() => tone(784, 0.16, 'sine', 0.04), 180)
    }
  } catch {
    /* ignore autoplay / AudioContext errors */
  }
}
