# Eval methodology

Independent concept by Ayo Ahmed. Not affiliated with Saturn. All data is synthetic.

## What is measured
How well this repository’s checker (`src/engine/checker.ts`, `predictDefects`) detects defects seeded into synthetic drafted reports. It does **not** measure drafting quality, real advice files, or any Saturn product.

## Golden set
`src/data/golden.ts`: 24 cases, G01–G24, derived from six base cases B1–B6 (`src/data/bases.ts`). Each derived case applies one or more mutations to a deep copy of its base: transposed digits, removed evidence, dropped section, contradicted figure, inserted vulnerability disclosure, older risk-profile date. Five cases are clean (G01, G05, G09, G13, G21); 19 carry 21 seeded defects across six types.

| Defect type | Seeded | How it is seeded |
|---|---|---|
| Unsupported claim | 4 | Sentence with evidence removed or invented |
| Wrong figure | 4 | Figure or arithmetic changed away from the fact-find |
| Missed vulnerability | 4 | Client disclosure inserted while the draft says none identified |
| Stale risk profile | 3 | Risk questionnaire date moved outside the 12-month window |
| Missing section | 3 | Required section removed |
| Contradicted statement | 3 | Sentence states a value the transcript or fact-find contradicts |

## Scoring
- Each case is scored on each of the six types: 24 × 6 = **144 decisions**.
- TP: type seeded and predicted. FN: seeded, not predicted. FP: predicted, not seeded. TN: neither.
- **Defect recall** = TP ÷ (TP + FN). **False-positive rate** = FP ÷ (FP + TN).
- **Unsupported-claim catch rate** is per seeded sentence: share of sentences seeded as unsupported that fail EVID-001/002/003.
- **Vulnerability recall** is per seeded disclosure line: share of seeded lines (`seededSignalLines`) that produce at least one signal. This is stricter than case-level recall, which can be rescued by an unrelated signal in the same case (G15 shows this).
- **Vulnerability flag precision**: share of all signals raised across the set that sit on a seeded or base-known true disclosure line.

## Running it
- Browser: [Eval lab](https://cashpointsoulja.github.io/saturn-suitability-evidence-desk/#/eval), recomputed on load and on “Run checker”.
- Terminal: `npm run eval` (`scripts/run-eval.ts`).
- Tests assert the set’s size and that the eval runs (`tests/system.test.ts`). They do not assert the headline numbers, so a change in the checker shows up as a change in results, not a broken build.

## Known biases
1. **Same author.** The fixtures and the checker were written by the same person. Recall on seeded defects of known shapes overstates recall on unknown ones.
2. **Lexicon coverage.** Seeded vulnerability phrasing mostly uses words the lexicon knows; G15 is deliberately outside it and is missed.
3. **Small n.** 21 defects. One case flipping moves recall by about 5 points.
4. **No time data.** The review-time model is assumption-driven and shown as such. Saturn’s 4 hours to 20 minutes is Saturn’s published claim ([ledger](SOURCE_LEDGER.md) S6), not reproduced here.

## What a real eval would add
Real, consented, de-identified files; defects labelled by a second reviewer blind to the checker; inter-rater agreement; a held-out set the checker author never sees; and per-firm slices.
