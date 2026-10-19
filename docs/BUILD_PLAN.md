# Altitude — Build Plan v0.1

Implements `Portfolio Plan — "Altitude"` (Draft v0.1). This document records what the code does, what it deliberately does not do yet, and where each plan item lives.

## 1. Stack decisions

| Plan proposal | Built with | Reason |
|---|---|---|
| Astro or Next.js static | **Astro 5** (static output) | Zero JS by default; case studies and one-pager are plain pages. Pinned to 5.x (stable, known API). |
| GSAP ScrollTrigger + Lenis | **GSAP 3 + ScrollTrigger + Lenis** | As proposed. Lenis disabled under reduced motion. |
| Rive for cursor, stickers, face | **Inline SVG + CSS + DOM** | No `.riv` assets exist yet. Each state is isolated in `cursor.ts` / chapter scripts, so a Rive file can replace any one of them without touching the scroll system. |
| OGL / Canvas 2D | **Canvas 2D** | Particles (ch. 4) and night map (ch. 6). WebGL not needed at this density. |
| Howler.js | **Web Audio API, synthesized** | No audio files to license or ship. Layers are generated (keystroke clicks, filtered-noise murmur, low city hum). Muted by default. |

## 2. Architecture

```
src/
  data/altitude.ts        Chapter table: id, label, metres, cursor, sound mix. Single source of truth.
  data/cases.ts           Case studies, six-beat structure, placeholders flagged.
  layouts/Base.astro      Tokens, fonts, theme (system dark mode), lens attribute.
  components/             Chrome (Loader, Altimeter, LensSwitch, SoundToggle, Cursor) + one file per chapter.
  scripts/
    main.ts               Boot order: reduced-motion check → loader → Lenis → chapters → chrome.
    scroll.ts             Lenis + ScrollTrigger bridge; stepped "hold, cut" transitions.
    altimeter.ts          Log-space interpolation between chapter altitudes; nav.
    cursor.ts             Cursor state machine (caret → inspector → peel → magnet → grab → light).
    lens.ts               Surface / Structure switch.
    sound.ts              Web Audio layers, crossfaded by chapter.
    chapters/*.ts         One noise→order timeline per chapter.
  pages/
    index.astro           The ascent.
    brief.astro           "30-second version".
    work/[slug].astro     Case studies.
```

## 3. Altitude scale

Roughly powers of ten. Readout interpolates in log space between anchors, so scroll position maps to a continuous altitude.

| # | Chapter | Altitude | Cursor | Sound |
|---|---|---|---|---|
| 1 | Pixel | 0.3 mm | caret | keystrokes |
| 2 | Component | 3 cm | inspector crosshair | keystrokes |
| 3 | Journey | 30 cm | peeling hand | studio murmur |
| 4 | Business | 300 m | magnet | studio murmur |
| 5 | People | 30 km | grab hand | murmur + hum |
| 6 | Market | 3,200 km | soft light | city hum |
| 7 | Return | 0.3 mm | caret | silence |

## 4. Scroll rhythm

Each chapter = tall section (≈260vh) with a sticky 100vh stage. Internal timeline scrubs **noise → order** over the hold. The last ~15% of each section is the **cut**: the stage shrinks toward the centre and fades as the next stage arrives from slightly larger scale. Rhythm: hold, cut, hold, cut. Not a continuous zoom.

Chapter 7 is the exception: a **timed** (not scrubbed) 1.2 s dive through six nested frames, country → pixel.

## 5. Effects implemented

| Device | Implementation |
|---|---|
| Loader | Blinking caret, "2013", types one CSS line, collapses into one pixel. Skippable; skipped on reduced motion and on repeat visits in the same session. |
| Hero | Caret + "Most problems are solved at the wrong altitude." |
| Cursor metamorphosis | Fixed SVG cursor, state set by the chapter in view. Hidden on coarse pointers; mobile gets tap ripple + altimeter progress bar. |
| Altimeter | Top-left monogram + live readout. Click opens chapter nav. |
| Noise → order | Ch1 grid snap · Ch2 button collapse · Ch3 sticker peel · Ch4 particle flow · Ch5 crowd → structure · Ch6 scattered lights → India. |
| Lens switch | `html[data-lens]`. Structure reveals annotations (decision / constraint / trade-off) and layout scaffolding over the same frames. |
| Pronoun shift | Scrubbed "I → we" morph at end of Business; People onward uses "we". |
| Sound | Muted toggle; gains follow chapter table. |
| Reduced motion | No Lenis, no scrub, no loader, no dive. Chapters render in resolved state, stacked. Altimeter still updates. |

## 6. Content policy for v0.1

- Copy is drawn only from the plan document. Nothing is invented about outcomes.
- Every unknown is a visible placeholder (`.tbd`, dashed underline) with the parked question it depends on.
- No metrics anywhere until Q14 (publishable numbers) is answered.
- Face interaction uses a monogram placeholder until Q18 (photo/video consent) is answered.
- Chapter 2 ownership line is flagged as a placeholder (risk: ownership overlap).

## 7. Out of scope for v0.1 (next iterations)

1. "Trust or Noise" 20-second game (Journey) — optional per plan.
2. Rive replacements for cursor states, stickers, face.
3. Real portrait sprite for face-follow.
4. Case study artefacts (sketches, rejected directions, workshop photos).
5. Deployment target and domain (Q16–Q18).
6. Analytics.

## 8. Verification

- `npm run build` produces static output in `dist/`.
- Headless Chromium screenshots of each chapter, light/dark, Surface/Structure, reduced motion, mobile width.
