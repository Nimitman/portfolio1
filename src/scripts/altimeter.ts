import { formatAltitude } from '../data/altitude';

export interface Altimeter {
  set(metres: number, label: string): void;
  setActive(id: string): void;
  setProgress(p: number): void;
}

export function createAltimeter(onNav: (id: string) => void): Altimeter {
  const root = document.getElementById('altimeter')!;
  const button = root.querySelector<HTMLButtonElement>('.alt-button')!;
  const nav = root.querySelector<HTMLElement>('.alt-nav')!;
  const value = root.querySelector<HTMLElement>('.alt-value')!;
  const label = root.querySelector<HTMLElement>('.alt-label')!;
  const bar = root.querySelector<HTMLElement>('.alt-progress span')!;
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a')];

  const toggle = (open: boolean) => {
    nav.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  };
  button.addEventListener('click', () => toggle(nav.hidden));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && toggle(false));
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target as Node)) toggle(false);
  });
  links.forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      toggle(false);
      onNav(a.dataset.target!);
    }),
  );

  let lastText = '';
  let lastLabel = '';
  return {
    set(m, l) {
      const t = formatAltitude(m);
      if (t !== lastText) value.textContent = lastText = t;
      if (l !== lastLabel) label.textContent = lastLabel = l;
    },
    setActive(id) {
      links.forEach((a) => a.setAttribute('aria-current', String(a.dataset.target === id)));
    },
    setProgress(p) {
      bar.style.transform = `scaleY(${p})`;
    },
  };
}
