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

Technical grid, scan line, node/edge pulses, HMI panels with status LEDs
(`src/components/GridBackdrop.tsx`, `StatusLed.tsx`, `Panel.tsx`).

## Motion rules

- Every animated element has a complete, correct static first frame.
- `prefers-reduced-motion: reduce` disables CSS keyframe animation
  (`src/index.css`) and skips the GSAP reveal entirely
  (`src/hooks/useScrollReveal.ts`, `src/hooks/useReducedMotion.ts`).
- The 3D mount point (`src/three/EngineeringCoreMount.tsx`) additionally
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
