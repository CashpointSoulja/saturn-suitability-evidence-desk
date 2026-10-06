# Brand sheet: mirroring Saturn

Captured on 6 Oct 2026 from saturnos.com (home, /security, /customer, /about-us, /journal, the Series A journal post and /meeting-notes-2.0) with a headless Chromium at 1366x900 and 390x844. Values below are computed styles read from the live DOM, not guesses. Reference captures are in [docs/brand/reference](docs/brand/reference) and the side-by-side guide is [docs/brand/VISUAL_GUIDE.md](docs/brand/VISUAL_GUIDE.md).

The Saturn wordmark and screenshots belong to Saturn. They are used here only so this independent concept reads as a screen inside their product. Independent concept by Ayo Ahmed. Not affiliated with Saturn.

## Logo
- File: `public/assets/saturn-logo.png`, downloaded unchanged from `https://framerusercontent.com/images/Imr3eloearxoTKGZCBatwk8O9Qs.png` (1462x260 PNG, black wordmark on transparent).
- Placement on saturnos.com: top-left of the framed nav bar, about 113x22 CSS px on desktop, 113x22 on mobile.
- Our use: same position, rendered at 22px high, never recoloured, stretched or recreated.

## Colour (observed)
| Token | Value | Where observed |
|---|---|---|
| Page | `#FAFAFA` (rgb 250,250,250) | `body` background on every page |
| Ink | `#000000` | headings, nav active link, body copy |
| Ink 70 | `rgba(0,0,0,0.7)` | inactive nav links, footer links |
| Secondary text | `#666666` / `#6E6E6E` | hero sub-copy, testimonial meta |
| Tertiary text | `#888888` | mono eyebrow labels, customer intro |
| Line | `#E1E1E1` (≈1px light grey) | framed container, nav bar, card grid dividers |
| Secondary button | `#F0F0F0` bg, black text | "Login" |
| Primary | `#0202D5` (rgb 2,2,213) | "Get in touch with us" button, "Learn more" links |
| Link default | `#0000EE` | anchor colour Framer leaves on wrappers (not visible as a colour) |

No gradients in UI chrome (the only gradients are inside photography and the Meeting Notes illustration). No emoji.

Status colours are not part of Saturn's marketing palette. We add three restrained ones only for check states: pass `#1D7A46`, needs judgement `#A15C07`, fail `#B42318`, each used as text plus a 1px border on a near-white tint, never as large fills.

## Type (observed)
| Role | Saturn | Size / weight / line height |
|---|---|---|
| Display H1 | Beton Light | 56px / 300 / 78.4px, tight optical tracking |
| Section H2 | Beton Roman Variable | 32px / 400 / 44.8px |
| UI and body | Geist | 14-18px / 400-500; hero paragraph 18px/28.8px in `#6E6E6E` |
| Eyebrow labels | Geist Mono | 12px, uppercase, letter-spacing 1px, `#888888` or black |
| Nav links | Geist | 14px, `rgba(0,0,0,0.7)`, active black |
| Buttons | Geist | 14-16px / 500-600 |

Beton is a commercial face. Closest freely licensed substitute chosen: **Newsreader** (SIL Open Font License, via @fontsource) at weight 300 for display and 400 for section heads, with -0.02em letter-spacing to approach Beton's tight setting. Geist and Geist Mono are themselves open (SIL OFL) so we use the real faces via @fontsource. All fonts are self-hosted in the build; no font CDN.

## Layout and components (observed)
- A single framed column, max width about 1140px, centred, bounded by 1px `#E1E1E1` lines with small black corner tick marks at the frame corners (the "crop mark" motif).
- Nav: bar inside the frame, 68px tall; wordmark left, five text links centred (Security, Customers, About us, Journal, Careers), grey Login button right (`#F0F0F0`, radius 4px, padding 8px 16px, 36px tall), optional blue CTA beside it.
- Buttons: radius 4px everywhere; primary blue with white text, 56px tall in heroes, 36px in the nav.
- Cards: flat, no shadow, separated by 1px grid lines rather than gaps (Journal grid), generous inner padding (16-40px).
- Section rhythm: very generous vertical whitespace; centred serif H2 above framed card grids; mono eyebrow above serif heading inside cards.
- Mobile: the frame persists with 20px side margins, nav collapses to wordmark plus a two-line hamburger.

## How we apply it
The app reads as a logged-in Saturn workspace screen: the same framed nav bar (our links are the app's sections), the same off-white page, serif page titles, mono eyebrows, 1px grid dividers, 4px radii, one blue primary action per view. Dense review UI (three columns) keeps the same lines and type, with status colour only on check results.
