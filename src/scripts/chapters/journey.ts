import { gsap } from 'gsap';
import type { ChapterFactory } from './types';

/** Badge stickers peel off on scroll (or click) until one trust signal remains. */
const journey: ChapterFactory = (section, env) => {
  const stickers = [...section.querySelectorAll<HTMLButtonElement>('.jr-sticker')];
  const trust = section.querySelector<HTMLElement>('.jr-trust')!;
  const peeled = new Set<HTMLButtonElement>();
  const manual = new Set<HTMLButtonElement>();
  const base = new Map<HTMLButtonElement, number>();
  stickers.forEach((el) => {
    const r = parseFloat(el.style.getPropertyValue('--r')) || 0;
    base.set(el, r);
    gsap.set(el, { rotation: r });
  });

  const peel = (el: HTMLButtonElement, instant = false) => {
    if (peeled.has(el)) return;
    peeled.add(el);
    el.disabled = true;
    const dir = Math.random() > 0.5 ? 1 : -1;
    gsap.to(el, {
      rotation: `+=${dir * (40 + Math.random() * 40)}`,
      skewX: dir * 12,
      x: dir * (60 + Math.random() * 80),
      y: 360 + Math.random() * 140,
      opacity: 0,
      duration: instant ? 0 : 0.75,
      ease: 'power2.in',
    });
  };
  const restore = (el: HTMLButtonElement) => {
    if (!peeled.has(el) || manual.has(el)) return;
    peeled.delete(el);
    el.disabled = false;
    gsap.to(el, { rotation: base.get(el), skewX: 0, x: 0, y: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.6)' });
  };

  stickers.forEach((el) =>
    el.addEventListener('click', () => {
      manual.add(el);
      peel(el);
      update();
    }),
  );

  const update = () => {
    const done = peeled.size === stickers.length;
    trust.style.background = done ? 'var(--signal)' : '';
    trust.style.transform = done ? 'scale(1.08)' : '';
    trust.style.transition = 'background .4s, transform .4s var(--ease-out)';
  };

  // Peel order is fixed so scrolling back restores the same stack.
  const order = stickers.map((_, i) => i).sort((a, b) => ((a * 5) % stickers.length) - ((b * 5) % stickers.length));

  return {
    progress(p) {
      const n = stickers.length;
      // Back at the start of the chapter: the full stack returns.
      if (p <= 0) manual.clear();
      order.forEach((idx, k) => {
        const threshold = 0.08 + (k / n) * 0.78;
        const el = stickers[idx];
        if (p >= threshold) peel(el, env.rm);
        else restore(el);
      });
      update();
    },
  };
};

export default journey;
