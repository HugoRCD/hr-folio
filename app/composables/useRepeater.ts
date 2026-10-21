// The sound of the chime under the page: two gongs struck one after the other, the high one then
// the low one, the same two notes every time. Made in the browser, no audio files. Each chime plays
// through its own gain, so stopping one silences what it had already scheduled, and two never overlap.
type Gong = 'low' | 'high'

let ctx: AudioContext | null = null
let master: AudioNode | null = null
let run: GainNode | null = null
let timers: ReturnType<typeof setTimeout>[] = []

// a major third apart, E then C. Each note is a soft bell: the note, a twin a hair off it so it
// shimmers as it fades, its octave, and two faint inharmonic partials that die first
const GONG: Record<Gong, number> = { high: 659.25, low: 523.25 }
const PARTIALS: [number, number, number][] = [[1, 0.7, 3.4], [1.003, 0.35, 3], [2, 0.16, 1.4], [2.76, 0.05, 0.6], [4.07, 0.015, 0.3]]
const BLOWS: { at: number, gong: Gong }[] = [{ at: 0, gong: 'high' }, { at: 0.62, gong: 'low' }]
const LEAD = 0.3 // the slide is pushed home before the first blow

// a short room for the notes to ring in: decaying noise, mixed in low
function room(c: AudioContext) {
  const len = Math.round(c.sampleRate * 1.8)
  const ir = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3
  }
  const verb = c.createConvolver()
  verb.buffer = ir
  return verb
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    const soft = ctx.createBiquadFilter()
    soft.type = 'lowpass'
    soft.frequency.value = 3200
    const limit = ctx.createDynamicsCompressor()
    const verb = room(ctx)
    const wet = ctx.createGain()
    wet.gain.value = 0.22
    soft.connect(limit)
    soft.connect(verb).connect(wet).connect(limit)
    limit.connect(ctx.destination)
    master = soft
  }
  return ctx
}

function strike(c: AudioContext, out: AudioNode, t: number, gong: Gong) {
  for (const [ratio, level, decay] of PARTIALS) {
    const o = c.createOscillator()
    o.frequency.value = GONG[gong] * ratio
    const env = c.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(level, t + 0.006)
    env.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    o.connect(env).connect(out)
    o.start(t)
    o.stop(t + decay + 0.05)
  }
}

export function useRepeater() {
  // for the drawing: which hammer is down, and whether the slide is pushed in
  const hammer = useState<Gong | null>('repeater-hammer', () => null)
  const striking = useState<boolean>('repeater-striking', () => false)
  const length = useState<number>('repeater-length', () => BLOWS.at(-1)!.at) // seconds, first blow to last

  function stop() {
    timers.forEach(clearTimeout)
    timers = []
    hammer.value = null
    striking.value = false
    if (run && ctx) {
      const r = run
      r.gain.cancelScheduledValues(ctx.currentTime)
      r.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
      setTimeout(() => r.disconnect(), 500)
    }
    run = null
  }

  /** Start the sound, from a click or a key press: browsers only let a page make sound after one. */
  function unlock() {
    const c = audio()
    if (c?.state === 'suspended') void c.resume()
  }

  /**
   * Strike the two notes. Silent, it is only seen. `ifStarted` (the quarter hours): heard only if the
   * sound was already started by a click on this visit, never held back and played late.
   */
  function chime(silent = false, ifStarted = false) {
    stop()
    const c = silent || (ifStarted && ctx?.state !== 'running') ? null : audio()
    const go = (heard: boolean) => {
      if (heard && c && master) {
        run = c.createGain()
        run.gain.value = 0.07
        run.connect(master)
        const t0 = c.currentTime + LEAD
        for (const b of BLOWS) strike(c, run, t0 + b.at, b.gong)
      }
      striking.value = true
      for (const b of BLOWS) {
        timers.push(setTimeout(() => (hammer.value = b.gong), (LEAD + b.at) * 1000))
        timers.push(setTimeout(() => (hammer.value = null), (LEAD + b.at) * 1000 + 110))
      }
      timers.push(setTimeout(() => (striking.value = false), (LEAD + length.value) * 1000 + 300))
    }
    // the first time, the sound is started before anything is scheduled, so no note is cut short.
    // If the browser won't start it, the chime is only seen, and never heard late
    if (c && c.state !== 'running') {
      let done = false
      const once = (heard: boolean) => {
        if (done) return
        done = true
        go(heard)
      }
      c.resume().then(() => once(true), () => once(false))
      timers.push(setTimeout(() => once(false), 400))
    } else go(Boolean(c))
  }

  return { hammer, striking, length, lead: LEAD, chime, unlock, stop }
}
