# X Simulator

A static, single-page simulator of the X "For You" feed ranking algorithm. Weights come from the published algorithm at xai-org/x-algorithm (`home-mixer/params/param.rs`).

## Architecture

- Plain HTML/CSS/JS, no build step, no dependencies. Must run as a static page on GitHub Pages.
- `index.html` — markup. `styles.css` — all styling. `app.js` — all logic.
- Static data lives in JSON, not in code: `data.json` (username dictionary, algorithm weights), `strings.json` (localization). Both are fetched at startup, so the site must be served over HTTP, not opened via `file://`.
- Preview locally with `python3 -m http.server` (see `.claude/launch.json`).

## Design system

The UI mirrors X's own web client.

- System font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. Bold names and section titles (700/800), 15px body, 13px secondary text.
- Layout: 600px center column with side borders and a sticky blurred header holding the title and X-style tabs (equal width, bold active label, rounded blue underline). A 350px right sidebar holds the timeline during a run and drops below the column at 1000px. No navigation rail.
- All colors are CSS custom properties on `:root`, with a dark ("Lights out", pure black) override under `@media (prefers-color-scheme: dark)`. Light and dark must both work; never hardcode a themed color in a component rule.
- Accent blue `#1d9bf0`, error red `#f4212e`, like pink `#f91880`, repost green `#00ba7c`.
- Buttons are pills: primary is inverted (black in light, white in dark), secondary is outlined, danger is red.
- Inputs: outlined field with the label inside, blue border and label on focus.
- Media, link cards, and sidebar cards use 16px radius.
- No decorative elements beyond what X itself shows; every visual element must carry information.
- No `cursor: pointer` anywhere; anchors get `cursor: default` explicitly.
- `user-select: none` on the body; only editable inputs re-enable selection.
- Keep the UI light on prose. Prefer numbers, labels, and bars over sentences.

## Localization

- English and Japanese, chosen from `navigator.language` only. There is no language picker.
- All user-facing strings go through `t(key)` and live in `strings.json` under `en` and `ja`. Static markup uses `data-i18n` attributes.
- Japanese terminology: "weights" is ウエイト (not 重み), "report" is 報告, follow X's own JP vocabulary for actions (いいね, リポスト, 引用).

## Code style

- Vanilla JS, `"use strict"`, no frameworks. DOM building via `document.createElement`, not innerHTML.
- Seeded RNG (mulberry32) so a run is reproducible while on screen; Poisson sampling for realized engagement counts.
- Comments only for constraints the code can't show (e.g. why a scale is sqrt, where weights come from).
- No em-dashes or en-dashes in code or copy; plain hyphens only. The Unicode minus sign (−) is allowed for rendering negative numbers.

## Git

- Single-line commit messages only, imperative mood, no trailing attribution of any kind.
- Commit continuously as work progresses; push only when asked.
