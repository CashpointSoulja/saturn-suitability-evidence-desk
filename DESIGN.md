# Design system

Tokens live in `src/styles/tokens.css`. Derived from [BRAND_SHEET.md](BRAND_SHEET.md).

## Tokens
```css
--page: #FAFAFA;   --surface: #FFFFFF;  --ink: #000000;   --ink-70: rgba(0,0,0,.7);
--ink-2: #666666;  --ink-3: #888888;    --line: #E1E1E1;  --line-strong: #CFCFCF;
--btn-2: #F0F0F0;  --primary: #0202D5;  --primary-tint: #F2F2FD;
--pass: #1D7A46;   --pass-tint: #F1F8F4;
--review: #A15C07; --review-tint: #FBF6EE;
--fail: #B42318;   --fail-tint: #FCF3F2;
--radius: 4px;     --frame-max: 1240px (app), 1140px (content pages)
--serif: "Newsreader", Georgia, serif;   --sans: "Geist", system-ui, sans-serif;   --mono: "Geist Mono", ui-monospace, monospace;
```
Spacing scale: 4, 8, 12, 16, 24, 32, 48, 72, 96px.

## Type scale
| Token | Font | Size/line | Weight | Use |
|---|---|---|---|---|
| display | serif | 56/62 (mobile 38/44) | 300 | page titles |
| h2 | serif | 32/40 (mobile 26/32) | 400 | section heads |
| h3 | sans | 18/26 | 600 | card titles |
| body | sans | 15/24 | 400 | prose, report text |
| small | sans | 13/20 | 400 | meta, tables |
| eyebrow | mono | 12/16, uppercase, +1px | 400 | labels above headings, rule ids |
| mono-data | mono | 12-13 | 400 | rule ids, evidence ids, timestamps |

## Components
- **Frame**: 1px `--line` box, centred, with 8px black corner ticks (CSS pseudo-elements). Every page sits in it.
- **TopBar**: inside the frame, 64px, wordmark left (22px high), section links centred (14px sans, ink-70, active ink with 1px underline), grey "Reviewer" chip right (`--btn-2`, radius 4) showing the synthetic reviewer name. Collapses to wordmark + menu button under 900px.
- **Button**: primary (`--primary`, white, 40px, radius 4, 500 weight), secondary (`--btn-2`, ink), ghost (text in primary). Disabled: 40% opacity, `not-allowed`, plus an inline reason.
- **Eyebrow**: mono 12px uppercase +1px, `--ink-3`.
- **Grid card**: no shadow, no gap; cells separated by 1px lines (like the Journal grid).
- **State pill**: 1px border + tint + coloured text, radius 4, mono 11px uppercase: READY, NEEDS JUDGEMENT, BLOCKED, UNSUPPORTED, PASS, FAIL.
- **Evidence chip**: mono 11px, 1px border, radius 4; `T 04:12` (transcript) or `FF risk_profile.date` (fact-find); clicking selects the source.
- **Claim kind tag**: `DETERMINISTIC` (outlined ink, shows rule id + pass/fail) or `PROBABILISTIC` (outlined primary, shows strength Direct quote / Inferred / Weak, always "Adviser judgement required"). No percentages.
- **Banner**: 1px line box on `--surface`, small sans: "Independent concept. Not affiliated with Saturn. Synthetic data."
- **Footer**: every page: "Independent concept by Ayo Ahmed. Not affiliated with Saturn. All client data is synthetic."

## Layout
- Review desk: three columns 1fr / 1.25fr / 1fr inside a 1240px frame divided by 1px lines; each column scrolls independently at desktop; under 1100px they become tabs (Transcript / Draft / Checks).
- Content pages: single 760px reading column for prose, tables full-width with horizontal scroll on mobile.

## Motion
Only 150ms colour/background transitions and a 600ms highlight fade on the selected transcript line. No gradients, no shadows beyond none, no emoji.
