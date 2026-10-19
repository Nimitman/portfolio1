import { gsap } from 'gsap';
import type { CursorState } from '../data/altitude';

export interface Cursor {
  setState(s: CursorState): void;
  tip(text: string | null): void;
}

/**
 * Signature interaction: the tool in your hand changes as scope grows.
 * Fine pointers get the custom cursor. Coarse pointers get tap ripples instead.
 */
export function createCursor(): Cursor {
  const html = document.documentElement;
  const el = document.getElementById('cursor')!;
  const tipEl = el.querySelector<HTMLElement>('.cursor-tip')!;
  const ripples = document.getElementById('ripples')!;
  const fine = window.matchMedia('(pointer: fine)').matches && !html.classList.contains('rm');

  if (!fine) {
    window.addEventListener(
      'pointerdown',
      (e) => {
        if (html.classList.contains('rm')) return;
        const r = document.createElement('span');
        r.style.left = `${e.clientX}px`;
        r.style.top = `${e.clientY}px`;
        ripples.appendChild(r);
        r.addEventListener('animationend', () => r.remove());
      },
      { passive: true },
    );
    return { setState() {}, tip() {} };
  }

  const xTo = gsap.quickTo(el, 'x', { duration: 0.18, ease: 'power3.out' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.18, ease: 'power3.out' });

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!html.classList.contains('has-cursor')) {
        gsap.set(el, { x: e.clientX, y: e.clientY });
        html.classList.add('has-cursor');
      }
      xTo(e.clientX);
      yTo(e.clientY);
      const t = e.target as Element | null;
      el.classList.toggle('is-link', !!t?.closest('a, button, [role="button"]'));
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => html.classList.remove('has-cursor'));
  window.addEventListener('pointerdown', () => el.classList.add('is-down'));
  window.addEventListener('pointerup', () => el.classList.remove('is-down'));

  return {
    setState(s) {
      if (el.dataset.state !== s) el.dataset.state = s;
      if (s !== 'inspector') tipEl.classList.remove('on');
    },
    tip(text) {
      if (text) {
        tipEl.textContent = text;
        tipEl.classList.add('on');
      } else tipEl.classList.remove('on');
    },
  };
}
