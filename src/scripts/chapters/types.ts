import type { Altimeter } from '../altimeter';
import type { Cursor } from '../cursor';

export interface Env {
  rm: boolean;
  cursor: Cursor;
  altimeter: Altimeter;
}

export interface ChapterCtl {
  /** Hold progress, 0 = noise, 1 = order. */
  progress(p: number): void;
  /** Raw section progress, for chapters that act on entry. */
  raw?(p: number): void;
  /** Stage became visible / hidden. Start and stop loops here. */
  enter?(): void;
  leave?(): void;
}

export type ChapterFactory = (section: HTMLElement, env: Env) => ChapterCtl;
