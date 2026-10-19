import { cities } from '../../data/cities';
import { easeInOut, fitCanvas, lerp, pointer, rng, smooth } from '../util';
import type { ChapterFactory } from './types';

const LON0 = 68;
const LON1 = 97.5;
const LAT0 = 6.5;
const LAT1 = 35.5;
const LIGHT = 150;

/** Scattered lights resolve into India at night. The cursor is a soft light. */
const market: ChapterFactory = (section, env) => {
  const canvas = section.querySelector<HTMLCanvasElement>('.mk-canvas')!;
  const rand = rng(2026);
  let ctx: CanvasRenderingContext2D;
  let w = 0;
  let h = 0;
  let t = 0;
  let raf = 0;

  const pts = cities.map(([name, lat, lon, tier]) => ({
    name,
    lat,
    lon,
    tier,
    sx: rand(),
    sy: rand(),
    tw: rand() * Math.PI * 2,
    x: 0,
    y: 0,
    glow: 0,
  }));

  const measure = () => {
    ({ ctx, w, h } = fitCanvas(canvas));
    // Equirectangular, corrected for latitude, fitted to the box.
    const kx = Math.cos((22 * Math.PI) / 180);
    const spanX = (LON1 - LON0) * kx;
    const spanY = LAT1 - LAT0;
    const s = Math.min((w * 0.9) / spanX, (h * 0.92) / spanY);
    const ox = (w - spanX * s) / 2;
    const oy = (h - spanY * s) / 2;
    for (const p of pts) {
      p.x = ox + (p.lon - LON0) * kx * s;
      p.y = oy + (LAT1 - p.lat) * s;
    }
  };

  const draw = (time: number) => {
    ctx.clearRect(0, 0, w, h);
    const r = canvas.getBoundingClientRect();
    const mx = pointer.x - r.left;
    const my = pointer.y - r.top;
    const k = easeInOut(t);

    ctx.globalCompositeOperation = 'lighter';
    for (const p of pts) {
      const x = lerp(p.sx * w, p.x, k);
      const y = lerp(p.sy * h, p.y, k);
      const d = pointer.active ? Math.hypot(mx - x, my - y) : 1e9;
      const lit = Math.max(0, 1 - d / LIGHT);
      p.glow = lerp(p.glow, lit, 0.12);
      const twinkle = env.rm ? 1 : 0.8 + 0.2 * Math.sin(time * 0.002 + p.tw);
      const base = p.tier === 1 ? 3.2 : p.tier === 2 ? 2 : 1.2;
      const rad = base * (1 + p.glow * 1.4) * (0.6 + 0.4 * k);
      const alpha = (0.35 + 0.65 * k) * twinkle * (0.55 + 0.45 * p.glow + (p.tier === 1 ? 0.3 : 0));

      const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 6);
      g.addColorStop(0, `rgba(255, 214, 160, ${Math.min(1, alpha)})`);
      g.addColorStop(0.25, `rgba(255, 170, 90, ${alpha * 0.35})`);
      g.addColorStop(1, 'rgba(255, 150, 60, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, rad * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    if (k > 0.95) {
      ctx.font = '11px "JetBrains Mono Variable", monospace';
      ctx.textBaseline = 'middle';
      for (const p of pts) {
        if (p.tier === 3 || p.glow < 0.15) continue;
        ctx.fillStyle = `rgba(237, 234, 227, ${Math.min(1, p.glow * 1.6)})`;
        ctx.fillText(p.name, p.x + 8, p.y);
      }
    }
    if (!env.rm) raf = requestAnimationFrame(draw);
  };

  measure();
  new ResizeObserver(() => {
    measure();
    if (env.rm) draw(0);
  }).observe(canvas);

  return {
    progress(p) {
      t = smooth(0.05, 0.7, p);
      if (env.rm) draw(0);
    },
    enter() {
      if (env.rm || raf) return;
      measure();
      raf = requestAnimationFrame(draw);
    },
    leave() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
};

export default market;
