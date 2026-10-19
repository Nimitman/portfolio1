import { cssVar, fitCanvas, lerp, pointer, rng, smooth } from '../util';
import type { ChapterFactory } from './types';

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  target: number;
  phase: number;
  size: number;
  kind: 0 | 1; // 0 credit, 1 slot
}

/**
 * Credits and slots. Noise: brownian drift. Order: a flow from the left edge into
 * seller actions. The magnet cursor bends the flow. Pronoun shift fires at the end.
 */
const business: ChapterFactory = (section, env) => {
  const canvas = section.querySelector<HTMLCanvasElement>('.bz-canvas')!;
  const scene = section.querySelector<HTMLElement>('.bz-scene')!;
  const actions = [...section.querySelectorAll<HTMLElement>('.bz-action')];
  const bar = section.querySelector<HTMLElement>('.bz-bar span')!;
  const slots = [...section.querySelectorAll<HTMLElement>('.bz-grid i')];
  const pnI = section.querySelector<HTMLElement>('.pn-i')!;
  const pnWe = section.querySelector<HTMLElement>('.pn-we')!;
  const pn = pnI.parentElement!;

  const rand = rng(2019);
  let ctx: CanvasRenderingContext2D;
  let w = 0;
  let h = 0;
  let order = 0;
  let raf = 0;
  let targets: { x: number; y: number }[] = [];
  const ps: P[] = [];
  const N = 150;

  const measure = () => {
    ({ ctx, w, h } = fitCanvas(canvas));
    const sr = scene.getBoundingClientRect();
    targets = actions.map((a) => {
      const r = a.getBoundingClientRect();
      return { x: r.left - sr.left - 6, y: r.top - sr.top + r.height / 2 };
    });
  };

  const spawn = (p: P, edge: boolean) => {
    p.x = edge ? -10 - rand() * 60 : rand() * w;
    p.y = edge ? h * (0.15 + rand() * 0.5) : rand() * h * 0.78;
    p.vx = (rand() - 0.5) * 0.6;
    p.vy = (rand() - 0.5) * 0.6;
    p.target = Math.floor(rand() * Math.max(1, targets.length));
  };

  measure();
  for (let i = 0; i < N; i++) {
    const p: P = { x: 0, y: 0, vx: 0, vy: 0, target: 0, phase: rand() * Math.PI * 2, size: 1.5 + rand() * 2, kind: rand() > 0.75 ? 1 : 0 };
    spawn(p, false);
    ps.push(p);
  }

  let ink = cssVar('--ink');
  let signal = cssVar('--signal');
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  scheme.addEventListener('change', () => {
    ink = cssVar('--ink');
    signal = cssVar('--signal');
  });

  const step = (t: number) => {
    const sr = scene.getBoundingClientRect();
    const mx = pointer.x - sr.left;
    const my = pointer.y - sr.top;
    ctx.clearRect(0, 0, w, h);

    for (const p of ps) {
      // Noise
      p.phase += 0.02;
      const nx = Math.cos(p.phase * 1.3 + p.y * 0.01) * 0.35;
      const ny = Math.sin(p.phase + p.x * 0.01) * 0.35;
      // Order: seek target
      const tg = targets[p.target] || { x: w, y: h / 2 };
      const dx = tg.x - p.x;
      const dy = tg.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      const sx = (dx / d) * 2.2;
      const sy = (dy / d) * 2.2;
      let ax = lerp(nx, sx, order);
      let ay = lerp(ny, sy, order);
      // Magnet
      if (pointer.active) {
        const mdx = mx - p.x;
        const mdy = my - p.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 170 && md > 1) {
          const f = (1 - md / 170) * 2.6;
          ax += (mdx / md) * f;
          ay += (mdy / md) * f;
        }
      }
      p.vx = lerp(p.vx, ax, 0.08);
      p.vy = lerp(p.vy, ay, 0.08);
      p.x += p.vx;
      p.y += p.vy;

      if (order > 0.3 && d < 10) spawn(p, true);
      if (p.x < -80 || p.x > w + 20 || p.y < -20 || p.y > h + 20) spawn(p, order > 0.3);

      ctx.globalAlpha = 0.35 + order * 0.5;
      ctx.fillStyle = p.kind ? ink : signal;
      if (p.kind) ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (t >= 0) raf = requestAnimationFrame(step);
  };

  let last = 0;
  const redrawStatic = () => {
    for (let i = 0; i < 400; i++) step(-1);
  };
  const ro = new ResizeObserver(() => {
    measure();
    if (env.rm && last >= 1) redrawStatic();
  });
  ro.observe(scene);

  return {
    progress(p) {
      order = smooth(0.05, 0.6, p);
      bar.style.transform = `scaleX(${0.12 + 0.88 * smooth(0.2, 0.75, p)})`;
      const filled = Math.round(slots.length * smooth(0.3, 0.8, p));
      slots.forEach((s, i) => s.classList.toggle('on', i < filled));
      actions.forEach((a, i) => a.classList.toggle('on', order > 0.4 + i * 0.12));

      // I → we
      const t = smooth(0.82, 0.97, p);
      pnI.style.opacity = String(1 - t);
      pnI.style.transform = `translateY(${-t * 0.35}em)`;
      pnI.style.filter = `blur(${t * 6}px)`;
      pnWe.style.opacity = String(t);
      pnWe.style.transform = `translateY(${(1 - t) * 0.35}em)`;
      pnWe.style.filter = `blur(${(1 - t) * 6}px)`;
      pn.style.width = `${lerp(pnI.offsetWidth, pnWe.offsetWidth, t)}px`;
      last = p;
      if (env.rm) {
        measure();
        redrawStatic();
      }
    },
    enter() {
      if (env.rm || raf) return;
      measure();
      raf = requestAnimationFrame(step);
    },
    leave() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
};

export default business;
