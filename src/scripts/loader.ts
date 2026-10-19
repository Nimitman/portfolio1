import { gsap } from 'gsap';

const LINE = '.pixel { width: 1px; height: 1px; }';
const KEY = 'altitude:loaded';

/** Chapter 0. Resolves when the page is ready to scroll. */
export function runLoader(rm: boolean, onKey?: () => void): Promise<void> {
  const root = document.getElementById('loader');
  const html = document.documentElement;
  let seen = false;
  try {
    seen = sessionStorage.getItem(KEY) === '1';
  } catch {}

  if (!root || rm || seen) {
    html.classList.add('loaded');
    return Promise.resolve();
  }

  const typed = root.querySelector<HTMLElement>('.loader-typed')!;
  const line = root.querySelector<HTMLElement>('.loader-line')!;
  const pixel = root.querySelector<HTMLElement>('.loader-pixel')!;
  const year = root.querySelector<HTMLElement>('.loader-year')!;
  const skip = root.querySelector<HTMLButtonElement>('.loader-skip')!;

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      delay: 0.5,
      onComplete: () => {
        html.classList.add('loaded');
        try {
          sessionStorage.setItem(KEY, '1');
        } catch {}
        resolve();
      },
    });

    const state = { n: 0 };
    tl.to(state, {
      n: LINE.length,
      duration: LINE.length * 0.038,
      ease: 'none',
      onUpdate: () => {
        const n = Math.round(state.n);
        if (typed.textContent!.length !== n) {
          typed.textContent = LINE.slice(0, n);
          onKey?.();
        }
      },
    })
      .to({}, { duration: 0.35 })
      // Compile: the line collapses into the one pixel it describes.
      .to(line, { scaleX: 0, scaleY: 0.05, duration: 0.45, ease: 'power3.in' })
      .to(year, { opacity: 0, duration: 0.3 }, '<')
      .to(pixel, { opacity: 1, duration: 0.05 })
      .to({}, { duration: 0.55 })
      .to(pixel, { scale: 6, opacity: 0, duration: 0.5, ease: 'power2.in' })
      .to(root, { opacity: 0, duration: 0.4, ease: 'power1.out' }, '-=0.25');

    skip.addEventListener('click', () => tl.progress(1));
  });
}
