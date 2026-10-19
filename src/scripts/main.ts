import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { chapters, type Chapter } from '../data/altitude';
import { createAltimeter } from './altimeter';
import { createCursor } from './cursor';
import { initLens } from './lens';
import { runLoader } from './loader';
import { createSound } from './sound';
import { clamp, easeInOut, logLerp } from './util';
import type { ChapterCtl, ChapterFactory, Env } from './chapters/types';
import pixel from './chapters/pixel';
import component from './chapters/component';
import journey from './chapters/journey';
import business from './chapters/business';
import people from './chapters/people';
import market from './chapters/market';
import ret from './chapters/return';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ overwrite: 'auto' });

const factories: Record<string, ChapterFactory> = { pixel, component, journey, business, people, market, return: ret };

/** Stage cut timings, as fractions of section progress. */
const IN = 0.07;
const OUT = 0.86;

const html = document.documentElement;
const rm = html.classList.contains('rm');

let lenis: Lenis | null = null;

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  // Land just after the cut-in, where the chapter is fully visible.
  const target = el.offsetTop + (rm ? 0 : el.offsetHeight * (IN + 0.01));
  if (lenis) lenis.scrollTo(target, { duration: 1.4 });
  else window.scrollTo({ top: target, behavior: rm ? 'auto' : 'smooth' });
};

const altimeter = createAltimeter(scrollToId);
const cursor = createCursor();
const sound = createSound();
initLens();

const env: Env = { rm, cursor, altimeter };

interface Entry {
  id: string;
  section: HTMLElement;
  stage: HTMLElement;
  meta?: Chapter;
  next?: Chapter;
  ctl?: ChapterCtl;
  visible: boolean;
}

const sections = [...document.querySelectorAll<HTMLElement>('[data-chapter]')];
const entries: Entry[] = sections.map((section) => {
  const id = section.dataset.chapter!;
  const i = chapters.findIndex((c) => c.id === id);
  return {
    id,
    section,
    stage: section.querySelector<HTMLElement>('.stage')!,
    meta: chapters[i],
    next: i >= 0 ? chapters[i + 1] : chapters[0],
    ctl: factories[id]?.(section, env),
    visible: id === 'hero',
  };
});

const setVisible = (e: Entry, v: boolean) => {
  if (e.visible === v) return;
  e.visible = v;
  e.stage.style.visibility = v ? 'visible' : 'hidden';
  v ? e.ctl?.enter?.() : e.ctl?.leave?.();
};

let active = '';
const activate = (e: Entry) => {
  if (active === e.id) return;
  active = e.id;
  html.classList.toggle('night', e.id === 'market');
  const c = e.meta ?? chapters[0];
  cursor.setState((e.section.dataset.cursor as Chapter['cursor']) || c.cursor);
  sound.setMix(c.sound);
  altimeter.setActive(e.id === 'hero' ? 'pixel' : e.id);
};

const updateAltitude = (e: Entry, p: number) => {
  if (e.id === 'return') return; // the dive drives its own readout
  const c = e.meta ?? chapters[0];
  const n = e.next;
  if (p > OUT && n && n.id !== 'return') {
    const t = (p - OUT) / (1 - OUT);
    altimeter.set(logLerp(c.metres, n.metres, t), t < 0.5 ? c.label : n.label);
  } else altimeter.set(c.metres, c.label);
};

/** Hold, cut. Outgoing stage shrinks to a point of the next altitude; incoming settles from larger. */
const applyStage = (e: Entry, p: number, first: boolean, last: boolean) => {
  let scale = 1;
  let opacity = 1;
  if (!first && e.id !== 'return' && p < IN) {
    const t = easeInOut(clamp(p / IN));
    scale = 1.6 - 0.6 * t;
    opacity = t;
  }
  if (!last && p > OUT) {
    const t = easeInOut(clamp((p - OUT) / (1 - OUT)));
    scale = 1 - 0.88 * t;
    opacity = 1 - t;
  }
  const on = opacity > 0.001 && p > (first ? -1 : 0) && p < 1;
  setVisible(e, on);
  if (on) {
    e.stage.style.opacity = String(opacity);
    e.stage.style.transform = scale === 1 ? '' : `scale(${scale})`;
  }
};

const holdProgress = (p: number) => clamp((p - IN) / (OUT - IN - 0.04));

function initMotion() {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  entries.forEach((e, i) => {
    const first = i === 0;
    const last = i === entries.length - 1;
    ScrollTrigger.create({
      trigger: e.section,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (st) => {
        const p = st.progress;
        applyStage(e, p, first, last);
        e.ctl?.progress(holdProgress(p));
        e.ctl?.raw?.(p);
        if (st.isActive) {
          activate(e);
          updateAltitude(e, p);
        }
      },
      onToggle: (st) => {
        if (st.isActive) activate(e);
        else applyStage(e, st.progress, first, last);
      },
      onRefresh: (st) => {
        applyStage(e, st.progress, first, last);
        e.ctl?.progress(holdProgress(st.progress));
      },
    });
  });

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (st) => altimeter.setProgress(st.progress),
  });
}

function initStatic() {
  // Reduced motion: every chapter rendered resolved, stacked. Altimeter still tracks.
  entries.forEach((e) => {
    e.stage.style.visibility = 'visible';
    e.ctl?.progress(1);
  });
  const io = new IntersectionObserver(
    (items) => {
      for (const it of items) {
        if (!it.isIntersecting) continue;
        const e = entries.find((x) => x.section === it.target);
        if (!e) continue;
        activate(e);
        if (e.id === 'return') altimeter.set(3e-4, 'pixel');
        else updateAltitude(e, 0.5);
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  entries.forEach((e) => io.observe(e.section));
}

async function boot() {
  if (rm) {
    initStatic();
    return;
  }
  // Hold scroll while the loader plays.
  html.style.overflow = 'hidden';
  await runLoader(rm, () => sound.key());
  html.style.overflow = '';
  initMotion();
  await document.fonts?.ready;
  ScrollTrigger.refresh();
  // Deep link (e.g. "Back to 03 · Journey"): land inside the hold, not on the cut.
  const hash = location.hash.slice(1);
  if (hash && entries.some((e) => e.id === hash)) {
    const el = document.getElementById(hash)!;
    lenis?.scrollTo(el.offsetTop + el.offsetHeight * (IN + 0.01), { immediate: true });
  }
}

boot();
