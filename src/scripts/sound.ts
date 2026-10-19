import type { SoundMix } from '../data/altitude';

/**
 * Ambience thickens with altitude: keystrokes → studio murmur → city hum → silence.
 * Fully synthesized; muted by default; nothing loads until the visitor opts in.
 */
export interface Sound {
  setMix(m: SoundMix): void;
  key(): void;
}

export function createSound(): Sound {
  const btn = document.querySelector<HTMLButtonElement>('.sound');
  let ac: AudioContext | null = null;
  let master: GainNode, murmur: GainNode, hum: GainNode;
  let keysLevel = 0;
  let on = false;
  let mix: SoundMix = { keys: 1, murmur: 0, hum: 0 };
  let keyTimer = 0;

  const noise = (ctx: AudioContext, brown = false) => {
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      } else d[i] = w;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  };

  const build = () => {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    ac = new AC() as AudioContext;
    master = ac.createGain();
    master.gain.value = 0;
    master.connect(ac.destination);

    // Studio murmur: band-limited noise with a slow swell.
    murmur = ac.createGain();
    murmur.gain.value = 0;
    const mSrc = noise(ac);
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 520;
    bp.Q.value = 0.9;
    const swell = ac.createGain();
    swell.gain.value = 0.05;
    const lfo = ac.createOscillator();
    lfo.frequency.value = 0.13;
    const lfoAmt = ac.createGain();
    lfoAmt.gain.value = 0.025;
    lfo.connect(lfoAmt).connect(swell.gain);
    mSrc.connect(bp).connect(swell).connect(murmur).connect(master);
    mSrc.start();
    lfo.start();

    // City hum: brown noise, low-passed, with a faint 55 Hz bed.
    hum = ac.createGain();
    hum.gain.value = 0;
    const hSrc = noise(ac, true);
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 220;
    const hLevel = ac.createGain();
    hLevel.gain.value = 0.22;
    hSrc.connect(lp).connect(hLevel).connect(hum);
    const osc = ac.createOscillator();
    osc.frequency.value = 55;
    const oLevel = ac.createGain();
    oLevel.gain.value = 0.012;
    osc.connect(oLevel).connect(hum);
    hum.connect(master);
    hSrc.start();
    osc.start();
  };

  const click = (vol: number) => {
    if (!ac || !on || vol <= 0) return;
    const t = ac.currentTime;
    const len = Math.floor(ac.sampleRate * 0.03);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 2200 + Math.random() * 2400;
    f.Q.value = 2;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.18 * vol * (0.5 + Math.random() * 0.5), t);
    src.connect(f).connect(g).connect(master);
    src.start(t);
  };

  const scheduleKeys = () => {
    window.clearTimeout(keyTimer);
    if (!on) return;
    click(keysLevel);
    // Typing rhythm: bursts and pauses.
    const gap = Math.random() < 0.12 ? 380 + Math.random() * 600 : 70 + Math.random() * 140;
    keyTimer = window.setTimeout(scheduleKeys, gap);
  };

  const applyMix = () => {
    if (!ac) return;
    const t = ac.currentTime;
    keysLevel = mix.keys;
    murmur.gain.setTargetAtTime(mix.murmur, t, 0.8);
    hum.gain.setTargetAtTime(mix.hum, t, 0.8);
  };

  btn?.addEventListener('click', async () => {
    on = !on;
    if (on && !ac) build();
    if (ac?.state === 'suspended') await ac.resume();
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
    if (ac) master.gain.setTargetAtTime(on ? 0.6 : 0, ac.currentTime, 0.3);
    applyMix();
    scheduleKeys();
  });

  return {
    setMix(m) {
      mix = m;
      applyMix();
    },
    key() {
      click(1);
    },
  };
}
