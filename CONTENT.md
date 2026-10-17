# Content guide

All copy lives in `content/*.json`. Components read it only through
`src/content/loader.ts` — never import a JSON file from a component.

## Add a project

1. Add one entry to the `projects` array in `content/projects.json`. Required
   fields are listed in `schema/project.schema.json` (`$defs.project`):
   `id`, `title`, `summary`, `domain`, `technologies`, `challenge`,
   `approach`, `architecture` (≥2 nodes), `project_status`,
   `verified_outcomes`, `screenshots`, `repository_url`, `demo_url`,
   `confidentiality_level`, `featured`.
2. `domain` and every id in `technologies` / `secondary_domains` must already
   exist in `content/domains.json` / `content/technologies.json`.
   `npm run validate` checks this and fails the build if not.
3. Optional: add an anonymised illustration SVG under e.g.
   `public/projects/<id>.svg` and reference it from `screenshots` (never a
   capture of a real client system — `anonymised: true` is required).
4. Rules enforced by schema + loader, not just convention:
   - `confidentiality_level: "restricted"` → never rendered anywhere
     (filtered at `src/content/filters.ts`, covered by
     `src/content/loader.test.ts`).
   - `project_status: "requires_verification"` → `featured` must be `false`.
   - `anonymised` / `restricted` projects can't carry a `repository_url` or
     `demo_url`.
5. Run `npm run validate` and `npm run typecheck` before committing.

## Add a domain / technology / AI lab entry

Same idea: edit `content/domains.json`, `content/technologies.json` or
`content/ai-lab.json` directly. For a technology, `evidence` must be one of
`project` / `explored` / `portfolio` — there is no numeric skill level, ever.

## No invented numbers, no client names

Every figure, count or percentage shown on the site must come from the JSON.
Do not add a client/employer product name anywhere (components, alt text,
file names, commit messages) — the content files already avoid this.

## Show a GitHub repo in "GitHub Activity"

1. Add the plain repo name (no owner) to `repos` in
   `content/github-allowlist.json`, e.g. `"repos": ["jakes9na"]`.
2. Only public repos owned by the account in `content/profile.json` are
   published. Private, missing, non-owned, forked and archived repos are
   skipped at build time.
3. The repo's name **and its GitHub description** are published as-is, so
   neither may name a client, employer or client-branded product. Run the
   name check locally (see below) over the allow-list and over the generated
   `dist/data/github.json` before you push.
4. The data is refreshed on every deploy and once a day by the Deploy
   workflow. Nothing is fetched from visitors' browsers.

## Disclosure check

`npm run check:disclosure` fails on IPv4 addresses and internal-looking
hostnames (`*.lan`, `*.internal`, `*.corp`, …) in tracked files. CI runs this.

The name list is not kept in this repo, in any form. Maintainers run the name
check locally with `--names-file` before each push:

```bash
npm run build
node scripts/check-disclosure.mjs --names-file <file> --dir dist --commits origin/main..HEAD
```

The file has one name per line (`#` starts a comment) and lives outside the
repo. Names are matched case-insensitively, and spaces in a name also match
`-`, `_`, `.` or no separator. Without `--names-file` the script prints one
line saying the name check was skipped.
