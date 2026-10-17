# Design tokens & motion rules

Source of truth: `tailwind.config.js`. Never hardcode a hex value in a
component — use the named token.

## Colour tokens

| Token          | Hex       | Use                                    |
|----------------|-----------|-----------------------------------------|
| `bg`           | `#05070A` | Page background                        |
| `panel`        | `#11161D` | Card / HMI panel surface                |
| `line`         | `#1F2A36` | Borders, grid lines                     |
| `text`         | `#A9B7C6` | Body text                               |
| `text-strong`  | `#E6EDF3` | Headings, emphasis                      |
| `crimson`      | `#DA3633` | Accent / alert LED, large text          |
| `teal`         | `#49D7B1` | Accent / positive LED, large text       |
| `crimson-text` | `#E8534A` | Crimson used as small/body-size text — see comment in `tailwind.config.js` for the AA contrast math |

`text` and `text-strong` already clear WCAG 2.2 AA (≥4.5:1) at body size on
both `bg` and `panel`. `crimson` alone does not at small sizes — that's why
`crimson-text` exists; `crimson` stays canonical for large text, icons and
LEDs (3:1 non-text minimum).

## Type

- JetBrains Mono — labels, telemetry, status, anything "HMI".
- Inter — body copy.
- Both self-hosted via `@fontsource/*` (no CDN, `font-display: swap`).

## Motifs

Technical grid, scan line, node/edge pulses, instrument panels with corner
registration ticks and status LEDs (`src/components/GridBackdrop.tsx`,
`StatusLed.tsx`, `Panel.tsx`, `.surface` / `.ticks` in `src/index.css`).

## Illustrations

`src/illustrations/` holds the authored SVG set: `HeroSchematic` (signal
chain), `ProjectIllustrations` (one 320x140 banner per case study),
`DomainIcon` (24px, 1.5 stroke glyphs for domains and pipeline layers) and
the shared `primitives` (Trace, Packet, Led, DotGrid). All are schematic
and labelled as such — never screenshots of client systems. Wrap animated
illustrations in `LiveRegion` so their loops pause off-screen.

## Profile README assets

`npm run export:readme` renders the GitHub profile SVGs (hero, terminal,
domains, matrix, pipeline, AI lab, eight case-study cards; dark + light)
from the same content JSON and illustration components into
`../EnZo1826/assets`. Re-run it after any content change, then commit in
the profile repo. Light variants map dark tokens to the light set in
`EnZo1826/tokens.json`.

## Motion rules

- Every animated element has a complete, correct static first frame.
- Scroll reveal is CSS (`[data-reveal]`), armed only when `html.motion-ok`
  is set by `src/hooks/useScrollReveal.ts`; content is visible without JS.
- `prefers-reduced-motion: reduce` disables CSS keyframe animation
  (`src/index.css`), never arms the reveal, skips the GSAP hero boot
  sequence and does not render SMIL packets (`useReducedMotion`).
- Decorative loops pause when off-screen or the tab is hidden
  (`src/components/LiveRegion.tsx`; the WebGL loop does the same).
- The 3D mount point (`src/three/EngineeringCoreMount.tsx`) shows the SVG
  core (`CoreFallback.tsx`) by default and only swaps in WebGL when it
  gates on WebGL support, `hardwareConcurrency <= 4`, and
  `navigator.connection?.saveData` — see `src/three/capability.ts`.

## CSP note

`index.html` ships a strict `<meta>` Content-Security-Policy (self-only for
every fetch directive, `connect-src 'self'` documented for the same-origin
`public/data/github.json` fetch). `frame-ancestors` is intentionally **not**
set there — browsers ignore that directive entirely when delivered via
`<meta>` (it only works as an HTTP response header). Clickjacking protection
(`frame-ancestors` / `X-Frame-Options`) needs an HTTP response header.
GitHub Pages cannot set custom headers, so this stays open until a CDN or
custom host sits in front of the site (a separate decision that needs owner approval).

## Base path

The site is served from `/jakes9na/` (Vite `base`). Any runtime URL in
components (fetches, images under `public/`) must be built from
`import.meta.env.BASE_URL`, never a bare `/path`. Absolute URLs in
`index.html` meta tags (canonical, Open Graph) use the full Pages URL.
