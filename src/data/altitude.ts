export type CursorState = 'caret' | 'inspector' | 'peel' | 'magnet' | 'grab' | 'light';

export interface SoundMix {
  keys: number;
  murmur: number;
  hum: number;
}

export interface Chapter {
  id: string;
  index: number;
  label: string;
  /** Altitude in metres. Readout interpolates in log space between chapters. */
  metres: number;
  cursor: CursorState;
  sound: SoundMix;
}

export const chapters: Chapter[] = [
  { id: 'pixel', index: 1, label: 'pixel', metres: 3e-4, cursor: 'caret', sound: { keys: 1, murmur: 0, hum: 0 } },
  { id: 'component', index: 2, label: 'component', metres: 3e-2, cursor: 'inspector', sound: { keys: 0.7, murmur: 0.15, hum: 0 } },
  { id: 'journey', index: 3, label: 'journey', metres: 0.3, cursor: 'peel', sound: { keys: 0.3, murmur: 0.6, hum: 0 } },
  { id: 'business', index: 4, label: 'business', metres: 300, cursor: 'magnet', sound: { keys: 0.1, murmur: 0.8, hum: 0.2 } },
  { id: 'people', index: 5, label: 'people', metres: 3e4, cursor: 'grab', sound: { keys: 0, murmur: 0.7, hum: 0.5 } },
  { id: 'market', index: 6, label: 'market', metres: 3.2e6, cursor: 'light', sound: { keys: 0, murmur: 0.1, hum: 1 } },
  { id: 'return', index: 7, label: 'pixel', metres: 3e-4, cursor: 'caret', sound: { keys: 0, murmur: 0, hum: 0 } },
];

export function formatAltitude(m: number): string {
  if (m < 0.01) return `${(m * 1000).toFixed(1)} mm`;
  if (m < 1) return `${(m * 100).toFixed(m < 0.1 ? 1 : 0)} cm`;
  if (m < 1000) return `${Math.round(m)} m`;
  const km = m / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km).toLocaleString('en-IN')} km`;
}

export const hero = 'Most problems are solved at the wrong altitude.';
