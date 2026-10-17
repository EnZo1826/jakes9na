# Jakes9NA

Engineering portfolio site for Jakes9NA, Windhoek, Namibia. Vite + React 18 +
TypeScript + Tailwind CSS + GSAP, with a lazy-loaded React Three Fiber scene
(`src/three/`). Static build, served from GitHub Pages at
`https://enzo1826.github.io/jakes9na/`.

## Setup

Requires Node 22 and npm.

```
npm ci
npm run dev                # local dev server at http://localhost:5173/jakes9na/
```

## Scripts

```
npm run typecheck          # tsc --noEmit, strict
npm run lint               # eslint (flat config), incl. jsx-a11y
npm run validate           # schema + cross-reference checks on content/*.json
npm run test               # vitest (content filter unit tests)
npm run check:disclosure   # IPv4 / internal hostnames (names with --names-file)
npm run data:github        # writes public/data/github.json from the public GitHub API
npm run build              # typecheck + vite build + 180 KB gz initial-JS budget
npm run preview            # serve dist/ at http://localhost:4173/jakes9na/
npm run check:links        # request every external URL in content, docs and dist
npm run lighthouse         # Lighthouse CI against `vite preview` (needs Chrome)
```

`check:disclosure` also takes `--dir dist` (scan build output) and
`--commits <base>..HEAD` (scan commit messages). CI runs both.

The name list is not kept in this repo. Maintainers run the name check locally
with `--names-file` before each push; CI runs the IPv4 and hostname checks only.

## Editing content

All copy lives in `content/*.json` and is read only through
`src/content/loader.ts`. See `CONTENT.md` for how to add a project or a
GitHub repo, and `DESIGN.md` for the design tokens and motion rules. Run
`npm run validate && npm run check:disclosure` before you commit.

## GitHub data

`scripts/fetch-github-data.mjs` runs in CI before the build. It reads the
public profile of `content/profile.json` → `github.username` and the repos in
`content/github-allowlist.json` (empty by default), using the workflow's
default `GITHUB_TOKEN`, and writes `public/data/github.json` (git-ignored).
It publishes only live API values: profile URL, public repo count, and name,
description, URL and language of each allow-listed public repo. Private or
non-owned repos are skipped.

Visitors' browsers never call the GitHub API; the page fetches the
same-origin `github.json`. If the API call fails, no file is written and the
GitHub Activity section shows its static fallback panel; the build continues.

## CI

`.github/workflows/ci.yml` runs on every pull request with `contents: read`
only:

1. **verify**: `npm ci`, typecheck, lint, schema validation, unit tests,
   disclosure check (files + PR commit messages), GitHub data job, build,
   disclosure check on `dist/`.
2. **lighthouse**: 3 mobile runs against `vite preview`; scores go to the job
   summary and the `lighthouse-report` artifact. Report only, never fails on
   scores.
3. **links**: every external link must answer < 400. LinkedIn blocks bots
   (HTTP 999) and is reported, not failed.

All actions are pinned to a full commit SHA, with the tag in a comment.

## Deploy

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages using
`actions/configure-pages`, `actions/upload-pages-artifact` and
`actions/deploy-pages`. It runs only for `main`: on push, on a daily schedule
(06:17 Africa/Windhoek, refreshes `github.json`) and on manual dispatch.
Permissions: `contents: read` for the workflow; `pages: write` and
`id-token: write` on the `deploy` job only.

The workflow does not enable Pages. Pages must be switched on once in the
repo settings with **Source: GitHub Actions**. That step needs owner approval,
as does every merge to `main`.

Vite `base` is `/jakes9na/`. Runtime URLs must use `import.meta.env.BASE_URL`;
URLs in `index.html` are rewritten by Vite at build time.

## Rollback

1. On a branch, `git revert <bad-commit>` (or the merge commit, with `-m 1`).
2. Open a PR, let CI pass, and merge to `main` with owner approval.
3. The push to `main` triggers **Deploy**, which publishes the reverted build.

Never force-push `main`. To redeploy the current `main` unchanged (for example
after a failed run), use **Actions → Deploy → Run workflow** on `main`.

## Structure

- `content/`: JSON copy/data (truth-tagged; see `schema/project.schema.json`)
- `src/components/`: presentational components, no hardcoded copy
- `src/sections/`: one file per page section
- `src/three/`: lazy 3D scene, gated by `src/three/capability.ts`
- `scripts/`: content validation, disclosure, GitHub data, link check,
  bundle budget, Lighthouse summary
- `schema/`: JSON Schema for `content/projects.json`
- `.github/workflows/`: `ci.yml` (PR gate), `deploy.yml` (Pages, `main` only)
