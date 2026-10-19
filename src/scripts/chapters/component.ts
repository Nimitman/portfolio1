import { gsap } from 'gsap';
import { cssVar, rng, smooth } from '../util';
import type { ChapterFactory } from './types';

const LABELS = ['Contact', 'CALL NOW', 'Contact agent', 'Get details', 'Enquire', 'Send', 'View number', 'Contact Seller', 'Submit', 'Connect'];
const FINAL = 'Contact agent';
const KINDS = ['primary', 'secondary', 'ghost'] as const;
const STATES = ['default', 'hover', 'disabled'] as const;
const COUNT = 36;

/** 36 one-off buttons → one component, 3 kinds × 3 states. */
const component: ChapterFactory = (section, env) => {
  const field = section.querySelector<HTMLElement>('.cmp-field')!;
  const legend = section.querySelector<HTMLElement>('.cmp-legend')!;
  const rand = rng(2016);
  const ink = cssVar('--ink');
  const paper = cssVar('--paper');
  const paper2 = cssVar('--paper-2');
  const signal = cssVar('--signal');
  const chaos = ['#ff4f1f', '#2f5bff', '#19c37d', '#ffd23f', '#8a2be2', '#e91e63', '#00a6a6', ink, '#f5a623', '#4a4a4a'];

  const mobile = () => window.matchMedia('(max-width: 820px)').matches;
  const tl = gsap.timeline({ paused: true });
  const buttons: { el: HTMLButtonElement; orig: string; chaosTip: string; tokenTip: string }[] = [];

  for (let i = 0; i < COUNT; i++) {
    const slot = i % 9;
    const kind = KINDS[slot % 3];
    const state = STATES[Math.floor(slot / 3)];
    const el = document.createElement('button');
    el.type = 'button';
    el.tabIndex = -1;
    el.className = 'cmp-btn';
    const orig = LABELS[Math.floor(rand() * LABELS.length)];
    el.textContent = orig;
    field.appendChild(el);

    const radius = Math.round(rand() * 22);
    const padY = 4 + Math.round(rand() * 12);
    const padX = 8 + Math.round(rand() * 22);
    const fs = 11 + Math.round(rand() * 7);
    const bg = chaos[Math.floor(rand() * chaos.length)];
    const from = {
      x: (rand() - 0.5) * 520,
      y: (rand() - 0.5) * 460,
      rotation: (rand() - 0.5) * 40,
      borderRadius: radius,
      paddingTop: padY,
      paddingBottom: padY,
      paddingLeft: padX,
      paddingRight: padX,
      fontSize: fs,
      fontWeight: rand() > 0.5 ? 700 : 400,
      backgroundColor: bg,
      color: rand() > 0.3 ? '#ffffff' : ink,
      borderColor: rand() > 0.5 ? bg : ink,
      borderWidth: rand() > 0.6 ? 2 : 1,
      opacity: 1,
    };

    const final: Record<string, string> = {
      primary: `fill    color.ink\ntext    color.paper`,
      secondary: `fill    transparent\nborder  color.ink / 1`,
      ghost: `fill    transparent\nborder  none`,
    };
    const stateLine = state === 'hover' ? (kind === 'primary' ? 'fill    color.signal' : 'fill    color.paper-2') : state === 'disabled' ? 'opacity 0.4' : '';
    const tokenTip = `button/${kind}/${state}\nradius  radius.full\npadding space.1.5 · space.2.5\ntype    label.md 14/500\n${final[kind]}${stateLine ? '\n' + stateLine : ''}`;
    const chaosTip = `one-off ✕\nradius  ${radius}px\npadding ${padY}px ${padX}px\ntype    ${fs}px\nfill    ${bg}`;

    el.style.borderStyle = 'solid';
    gsap.set(el, { xPercent: -50, yPercent: -50, ...from });

    const pos = () => {
      const colW = mobile() ? 100 : 132;
      const rowH = mobile() ? 50 : 60;
      const col = slot % 3;
      const row = Math.floor(slot / 3);
      return { x: (col - 1) * colW, y: (row - 1) * rowH + 16 };
    };
    const fill = kind === 'primary' ? (state === 'hover' ? signal : ink) : state === 'hover' ? paper2 : 'rgba(0,0,0,0)';
    tl.to(
      el,
      {
        x: () => pos().x,
        y: () => pos().y,
        rotation: 0,
        borderRadius: 999,
        paddingTop: mobile() ? 8 : 10,
        paddingBottom: mobile() ? 8 : 10,
        paddingLeft: mobile() ? 10 : 18,
        paddingRight: mobile() ? 10 : 18,
        fontSize: mobile() ? 12 : 14,
        fontWeight: 500,
        backgroundColor: fill,
        color: kind === 'primary' ? (state === 'hover' ? '#ffffff' : paper) : ink,
        borderColor: kind === 'ghost' ? 'rgba(0,0,0,0)' : kind === 'primary' && state === 'hover' ? signal : ink,
        borderWidth: 1,
        opacity: state === 'disabled' ? 0.4 : 1,
        duration: 1,
        ease: 'power3.inOut',
      },
      rand() * 0.35,
    );

    el.addEventListener('pointerenter', () => env.cursor.tip(tl.progress() > 0.95 ? tokenTip : chaosTip));
    el.addEventListener('pointerleave', () => env.cursor.tip(null));
    buttons.push({ el, orig, chaosTip, tokenTip });
  }

  let labelled = false;
  window.addEventListener('resize', () => tl.invalidate());

  return {
    progress(p) {
      const t = smooth(0.05, 0.85, p);
      tl.progress(t);
      const settle = t > 0.62;
      if (settle !== labelled) {
        labelled = settle;
        buttons.forEach((b) => (b.el.textContent = settle ? FINAL : b.orig));
      }
      legend.style.opacity = String(smooth(0.85, 1, t));
    },
    leave() {
      env.cursor.tip(null);
    },
  };
};

export default component;
