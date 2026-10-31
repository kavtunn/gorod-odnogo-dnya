const MUTE_KEY = 'gorod-odnogo-dnya-mute'

let audioCtx: AudioContext | null = null

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    // localStorage может быть недоступен
  }
}

function getAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  if (isMuted()) return null

  if (!audioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtxClass) return null
    audioCtx = new AudioCtxClass()
  }

  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }

  return audioCtx
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
): void {
  const audio = getAudio()
  if (!audio) return

  const now = audio.currentTime
  const osc = audio.createOscillator()
  const gain = audio.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

export function playPinClick(): void {
  playTone(520, 0.07, 'triangle', 0.045)
  playTone(780, 0.05, 'sine', 0.02)
}

export function playPhaseChange(): void {
  playTone(392, 0.12, 'sine', 0.035)
  setTimeout(() => playTone(523, 0.14, 'sine', 0.028), 70)
}

export function playOutcome(kind: 'safe' | 'risky' | 'learn'): void {
  if (kind === 'safe') {
    playTone(440, 0.1, 'sine', 0.03)
    setTimeout(() => playTone(660, 0.12, 'sine', 0.025), 60)
    return
  }

  if (kind === 'risky') {
    playTone(220, 0.14, 'sawtooth', 0.022)
    setTimeout(() => playTone(180, 0.1, 'triangle', 0.018), 80)
    return
  }

  playTone(349, 0.1, 'triangle', 0.028)
  setTimeout(() => playTone(415, 0.1, 'sine', 0.022), 70)
}

export function playPlace(): void {
  playTone(600, 0.05, 'triangle', 0.03)
}
