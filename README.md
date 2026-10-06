<img src="public/assets/saturn-logo.png" alt="Saturn" height="28">

# Suitability Evidence Desk

**Live:** https://cashpointsoulja.github.io/saturn-suitability-evidence-desk/  
**Demo video:** see the latest [release](https://github.com/CashpointSoulja/saturn-suitability-evidence-desk/releases) and [`demo/`](demo)

Independent concept by Ayo Ahmed. Not affiliated with Saturn. All client data is synthetic.

## What it is
A review desk where an adviser or paraplanner checks a drafted suitability report against the meeting transcript and fact-find it came from, then signs it off. Every sentence in the draft carries evidence chips. Figures, dates, percentages, charges arithmetic, required sections and risk-profile age are checked by code. Reasons, objectives, tone and vulnerability readings are shown with an evidence-strength label and left to the adviser. Nothing is approved without a named adviser and a declaration, and every action is written to an exportable audit trail.

## Why
Saturn publishes that suitability reports which took four hours of paraplanner time now take 20 minutes of review, and that all AI documentation stays subject to mandatory adviser review ([sources](SOURCE_LEDGER.md)). If review is the step that remains, the product question is how to make 20 minutes of review trustworthy: what the adviser can stop checking because code has checked it, and what they must never stop judging. This concept is one answer, built to the brief of a Lead Product Manager.

## Screens
| Route | What it shows |
|---|---|
| `#/` | Case inbox: six synthetic cases with readiness state and the reason for it |
| `#/case/SR-0912` … `SR-0917` | Review desk: transcript, draft, checks rail (checks, vulnerability, required content, sign-off, audit) |
| `#/eval` | Eval lab: 24-case golden set run live, confusion matrix, editable review-time model |
| `#/metrics` | North-star and guardrail metrics with formula, source, target and owner; bets |
| `#/rules` | Every rule, the COBS wording quoted with links, the FG21/1 taxonomy, sources |
| `#/no` | What I said no to in v1 |

Try this: open **SR-0916**, click the Charges sentence, change `£540` to `£450`. The arithmetic and figure checks turn green. Change the Summary’s `£20,000` to `£25,000` and the ISA allowance and figure checks fail with the reason.

## Run it
```bash
npm ci
npm run dev        # local app
npm test           # unit tests
npm run lint       # eslint
npm run typecheck  # tsc
npm run build      # production build to dist/
npm run eval       # golden-set eval in the terminal
```
State is stored in your browser’s localStorage only. “Reset demo data” on the inbox restores the fixtures.

## How to read the eval
The golden set is 24 synthetic cases built from six base reports. Each case is scored on six defect types (144 decisions). Defect recall is the share of seeded defects the checker flagged; false-positive rate is the share of clean case × type decisions it flagged anyway. Vulnerability recall and precision are counted per transcript disclosure. Current numbers and their caveats are in [TEST_RESULTS.md](TEST_RESULTS.md) and [EVAL_METHODOLOGY.md](EVAL_METHODOLOGY.md).

## Limits
- The eval measures this checker on fixtures written by the same person who wrote the checker. It says nothing about real advice files or about Saturn’s product.
- The vulnerability scan is a keyword lexicon. It misses phrasing it has not seen and raises false alarms on harmless words; both are shown in the eval lab.
- The COBS checklist covers only provisions read in the live Handbook and is labelled illustrative checks, not compliance advice.
- No drafting, no model calls, no backend, no integrations. See [What I said no to](https://cashpointsoulja.github.io/saturn-suitability-evidence-desk/#/no).

## Documents
[PRD](PRD.md) · [Five whys](FIVE_WHYS.md) · [JTBD](JTBD.md) · [Success metrics](SUCCESS_METRICS.md) · [Feature spec: vulnerability confirmation](FEATURE_SPEC_VULNERABILITY_CONFIRMATION.md) · [Test plan](TEST_PLAN.md) · [Test results](TEST_RESULTS.md) · [Eval methodology](EVAL_METHODOLOGY.md) · [Viability memo](VIABILITY_MEMO.md) · [V2 roadmap](V2_ROADMAP.md) · [Decision log](DECISION_LOG.md) · [Demo script](DEMO_SCRIPT.md) · [Source ledger](SOURCE_LEDGER.md) · [Brand sheet](BRAND_SHEET.md) · [Design](DESIGN.md) · [Visual guide](docs/brand/VISUAL_GUIDE.md) · [Screenshots](docs/screenshots)

The Saturn wordmark belongs to Saturn and is used only so this concept reads as a screen inside their product.
