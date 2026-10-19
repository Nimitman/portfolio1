import { easeInOut, smooth } from '../util';
import type { ChapterFactory } from './types';

/** Misaligned fragment → 8px grid. Offsets are whole pixels, so motion steps like a nudge tool. */
const pixel: ChapterFactory = (section) => {
  const parts = [...section.querySelectorAll<HTMLElement>('.px-part')].map((el) => ({
    el,
    dx: Number(el.dataset.dx),
    dy: Number(el.dataset.dy),
    r: Number(el.dataset.r),
  }));
  const readout = section.querySelector<HTMLElement>('.px-off')!;
  const maxOff = Math.max(...parts.map((p) => Math.hypot(p.dx, p.dy)));

  return {
    progress(p) {
      const t = smooth(0.05, 0.8, p);
      // Last 10% is a snap, not a glide.
      const k = t > 0.9 ? 0 : 1 - easeInOut(t / 0.9) * 0.85;
      for (const { el, dx, dy, r } of parts) {
        el.style.transform = `translate(${Math.round(dx * k)}px, ${Math.round(dy * k)}px) rotate(${(r * k).toFixed(2)}deg)`;
      }
      const off = Math.round(maxOff * k);
      readout.textContent = off === 0 ? 'Δ 0px · on grid' : `Δ ${off}px`;
    },
  };
};

export default pixel;
