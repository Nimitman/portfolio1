import { gsap } from 'gsap';
import { clamp, easeInOut, lerp, pointer, rng, smooth } from '../util';
import type { ChapterFactory } from './types';

/**
 * Crowd → structure. Figures scatter, then form a ring around the face.
 * Dragging a figure reveals its role. The face follows the cursor.
 */
const people: ChapterFactory = (section) => {
  const scene = section.querySelector<HTMLElement>('.pp-scene')!;
  const face = section.querySelector<HTMLElement>('.pp-face')!;
  const faceInner = section.querySelector<HTMLElement>('.pp-face-inner')!;
  const pupils = [...section.querySelectorAll<HTMLElement>('.pp-eye i')];
  const rand = rng(2021);

  const figs = [...section.querySelectorAll<HTMLElement>('.pp-fig')].map((el, i, all) => ({
    el,
    seed: { x: rand(), y: rand(), r: (rand() - 0.5) * 50 },
    angle: (i / all.length) * Math.PI * 2 - Math.PI / 2,
    drag: { x: 0, y: 0 },
  }));

  let w = 0;
  let h = 0;
  let t = 0;
  let raf = 0;
  const measure = () => {
    w = scene.clientWidth;
    h = scene.clientHeight;
  };
  measure();
  new ResizeObserver(() => {
    measure();
    layout();
  }).observe(scene);

  const layout = () => {
    const rx = Math.min(w * 0.4, 300);
    const ry = Math.min(h * 0.38, 240);
    const k = easeInOut(t);
    for (const f of figs) {
      const sx = f.seed.x * (w - 44);
      const sy = f.seed.y * (h - 76);
      const ox = w / 2 + Math.cos(f.angle) * rx - 22;
      const oy = h / 2 + Math.sin(f.angle) * ry - 38;
      const x = lerp(sx, ox, k) + f.drag.x;
      const y = lerp(sy, oy, k) + f.drag.y;
      f.el.style.transform = `translate(${x}px, ${y}px) rotate(${f.seed.r * (1 - k)}deg)`;
    }
    const fo = smooth(0.55, 0.85, t);
    face.style.opacity = String(fo);
    face.style.transform = `scale(${0.6 + 0.4 * fo})`;
  };

  // Drag to reveal
  for (const f of figs) {
    let start = { x: 0, y: 0, dx: 0, dy: 0 };
    f.el.addEventListener('pointerdown', (e) => {
      f.el.setPointerCapture(e.pointerId);
      f.el.classList.add('dragging');
      start = { x: e.clientX, y: e.clientY, dx: f.drag.x, dy: f.drag.y };
    });
    f.el.addEventListener('pointermove', (e) => {
      if (!f.el.hasPointerCapture(e.pointerId)) return;
      f.drag.x = start.dx + e.clientX - start.x;
      f.drag.y = start.dy + e.clientY - start.y;
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) f.el.classList.add('revealed');
      layout();
    });
    const end = (e: PointerEvent) => {
      if (f.el.hasPointerCapture(e.pointerId)) f.el.releasePointerCapture(e.pointerId);
      f.el.classList.remove('dragging');
    };
    f.el.addEventListener('pointerup', end);
    f.el.addEventListener('pointercancel', end);
    f.el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        f.el.classList.toggle('revealed');
      }
    });
  }

  // Face follows the cursor
  const lookX = pupils.map((p) => gsap.quickTo(p, 'x', { duration: 0.3 }));
  const lookY = pupils.map((p) => gsap.quickTo(p, 'y', { duration: 0.3 }));
  const headX = gsap.quickTo(faceInner, 'x', { duration: 0.6 });
  const headY = gsap.quickTo(faceInner, 'y', { duration: 0.6 });
  const track = () => {
    if (pointer.active) {
      const r = faceInner.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = pointer.x - cx;
      const dy = pointer.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const m = clamp(d / 200) * 4;
      lookX.forEach((f) => f((dx / d) * m));
      lookY.forEach((f) => f((dy / d) * m));
      headX(clamp(dx / 40, -14, 14));
      headY(clamp(dy / 40, -14, 14));
    }
    raf = requestAnimationFrame(track);
  };

  return {
    progress(p) {
      t = smooth(0.05, 0.75, p);
      layout();
    },
    enter() {
      if (!raf) raf = requestAnimationFrame(track);
    },
    leave() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
};

export default people;
