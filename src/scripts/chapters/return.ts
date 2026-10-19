import { gsap } from 'gsap';
import { clamp, logLerp } from '../util';
import type { ChapterFactory } from './types';

const ZOOM = 8;
const FROM_M = 3.2e6;
const TO_M = 3e-4;

/**
 * One uninterrupted dive, country → pixel, ~1.2s. Timed, not scrubbed.
 * Frame i has scale ZOOM^(z - i): a single proxy value drives every layer,
 * so the zoom is continuous in log space.
 */
const ret: ChapterFactory = (section, env) => {
  const frames = [...section.querySelectorAll<HTMLElement>('.rt-frame')];
  const line = section.querySelector<HTMLElement>('.rt-line')!;
  const off = section.querySelector<HTMLElement>('.rt-off')!;
  const labels = frames.map((f) => f.querySelector('.rt-tag')?.textContent || '');
  const last = frames.length - 1;
  const state = { z: 0 };
  let played = false;
  let fixTimer = 0;

  const render = (readout = true) => {
    frames.forEach((f, i) => {
      const d = state.z - i;
      const o = clamp(1 - Math.abs(d) * 1.1);
      f.style.opacity = String(o);
      f.style.transform = `scale(${Math.pow(ZOOM, d)})`;
      // Never force 'visible': it would override the hidden stage.
      f.style.visibility = o > 0 ? '' : 'hidden';
    });
    if (!readout) return;
    const nearest = Math.round(state.z);
    env.altimeter.set(logLerp(FROM_M, TO_M, state.z / last), labels[nearest]);
  };

  const tl = gsap.timeline({ paused: true });
  tl.to(state, { z: last, duration: 1.2, ease: 'power2.inOut', onUpdate: () => render() })
    .to(line, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '+=0.15')
    .call(() => {
      fixTimer = window.setTimeout(() => off.classList.add('fixed'), 900);
    });
  gsap.set(line, { y: 16 });

  const reset = () => {
    played = false;
    window.clearTimeout(fixTimer);
    off.classList.remove('fixed');
    tl.pause(0);
    state.z = 0;
    render(false);
  };

  if (env.rm) {
    state.z = last;
    off.classList.add('fixed');
  } else render(false);

  return {
    progress() {},
    raw(p) {
      if (env.rm) return;
      if (p > 0.02 && !played) {
        played = true;
        tl.play(0);
      } else if (p <= 0 && played) reset();
      else if (played && !tl.isActive() && tl.progress() === 1) {
        env.altimeter.set(TO_M, 'pixel');
      }
    },
  };
};

export default ret;
