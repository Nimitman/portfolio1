/** Surface = what users see. Structure = decisions, constraints, trade-offs over the same frame. */
export function initLens() {
  const html = document.documentElement;
  const group = document.querySelector<HTMLElement>('.lens');
  if (!group) return;
  const buttons = [...group.querySelectorAll<HTMLButtonElement>('[data-lens-set]')];
  const thumb = group.querySelector<HTMLElement>('.lens-thumb')!;

  const apply = (lens: string) => {
    html.dataset.lens = lens;
    buttons.forEach((b) => {
      const on = b.dataset.lensSet === lens;
      b.setAttribute('aria-pressed', String(on));
      if (on) {
        thumb.style.width = `${b.offsetWidth}px`;
        thumb.style.transform = `translateX(${b.offsetLeft - 3}px)`;
      }
    });
    try {
      localStorage.setItem('altitude:lens', lens);
    } catch {}
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.lensSet!)));
  apply(html.dataset.lens || 'surface');
  document.fonts?.ready.then(() => apply(html.dataset.lens || 'surface'));
}
