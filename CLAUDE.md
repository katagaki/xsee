# X Simulator

A static, single-page simulator of the X "For You" feed ranking algorithm. Weights come from the published algorithm at xai-org/x-algorithm (`home-mixer/params/param.rs`).

## Architecture

- Plain HTML/CSS/JS, no build step, no dependencies. Must run as a static page on GitHub Pages.
- `index.html` — markup. `styles.css` — all styling. `app.js` — all logic.
- Static data lives in JSON, not in code: `data.json` (username dictionary, algorithm weights), `strings.json` (localization). Both are fetched at startup, so the site must be served over HTTP, not opened via `file://`.
- Preview locally with `python3 -m http.server` (see `.claude/launch.json`).

## Design system

The UI follows a specific industrial design language. Do not name the design system it resembles anywhere in code, comments, or copy — no references to its vendor or brand.

- Sans-serif only: `"Helvetica Neue", Helvetica, Arial, sans-serif`.
- Sharp corners everywhere; no border-radius except circular slider thumbs.
- All colors are CSS custom properties on `:root`, with a dark palette override under `@media (prefers-color-scheme: dark)`. Light and dark must both work; never hardcode a themed color in a component rule.
- Interactive blue `#0f62fe`, error red `#da1e28` (light) / `#fa4d56` (dark), layered gray surfaces (`--bg`, `--layer`, `--field`).
- Inputs: filled field with a single bottom border. Buttons: rectangular, left-aligned text, 48px tall.
- No decorative elements: no eyebrows, pills, badges, or leading-edge color bars. Every visual element must carry information.
- No `cursor: pointer` anywhere; anchors get `cursor: default` explicitly.
- `user-select: none` on the body; only editable inputs re-enable selection.
- Keep the UI light on prose. Prefer numbers, labels, and bars over sentences.

## Localization

- English and Japanese, auto-detected from `navigator.language`, switchable via the header picker, persisted in `localStorage`.
- All user-facing strings go through `t(key)` and live in `strings.json` under `en` and `ja`. Static markup uses `data-i18n` attributes; dynamic renders re-run on language switch.
- Japanese terminology: "weights" is ウエイト (not 重み), "report" is 報告, follow X's own JP vocabulary for actions (いいね, リポスト, 引用).

## Code style

- Vanilla JS, `"use strict"`, no frameworks. DOM building via `document.createElement`, not innerHTML.
- Seeded RNG (mulberry32) so a run is reproducible while on screen; Poisson sampling for realized engagement counts.
- Comments only for constraints the code can't show (e.g. why a scale is sqrt, where weights come from).
- No em-dashes or en-dashes in code or copy; plain hyphens only. The Unicode minus sign (−) is allowed for rendering negative numbers.

## Git

- Single-line commit messages only, imperative mood, no trailing attribution of any kind.
- Commit continuously as work progresses; push only when asked.
