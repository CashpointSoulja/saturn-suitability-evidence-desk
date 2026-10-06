# Viability memo

Independent concept by Ayo Ahmed. Not affiliated with Saturn. Saturn facts below are from public pages listed in [SOURCE_LEDGER.md](SOURCE_LEDGER.md).

## Mapping to the Lead PM brief
| What the role asks for | Where it is in this build |
|---|---|
| Evidence and auditability behind every material output | Evidence chips on every sentence; EVID-001/002/003; audit trail with rule ids and evidence ids; JSON/CSV export |
| The difference between deterministic and probabilistic systems | Every claim labelled Deterministic or Probabilistic; rules with pass/fail and reason vs evidence strength and adviser agreement; no confidence percentages ([DECISION_LOG](DECISION_LOG.md) D4) |
| Specs with zero ambiguity, clear enough for one engineer to ship | [FEATURE_SPEC_VULNERABILITY_CONFIRMATION.md](FEATURE_SPEC_VULNERABILITY_CONFIRMATION.md), with the reference implementation and tests in this repo |
| Define your own metrics and design your own experiments | [SUCCESS_METRICS.md](SUCCESS_METRICS.md), Metrics and bets page, eval lab with its biases written down |
| Go-to-market as part of the build | Audit export aimed at compliance buyers; firm-level A/B design; the bets table on the metrics page |

## Mapping to Saturn’s published wedge
| Saturn says (public) | This concept |
|---|---|
| Report tasks moved from four hours of paraplanner time to 20 minutes of review (S6) | Treats review as the product: what the adviser can stop checking, and what they must keep judging |
| All AI documentation remains subject to mandatory adviser review (S6) | No auto-approval; named adviser plus declaration; judgement claims need explicit agreement |
| Next focus for Meeting Notes includes sharpening how vulnerabilities are captured (S7) | Vulnerability panel on FG21/1’s four drivers, client quote written into the report, decisions audited |
| Aiming to cut cost to serve from £2,000 to £200 per client per year (S6) | North star is time to approved report; guardrails stop that saving being bought with risk |
| Firm count: “500+” on home, about and customer pages; “over 600” in the Series A post (S1, S3, S4, S6) | Not asserted either way |

## First 90 days (if I were in the role)
- **Days 1–30: learn.** Sit with five firms’ advisers and paraplanners through real reviews. Measure today’s time to approved report and where it goes. Read twenty sampled files with compliance. Agree the north star and guardrails with the CEO and compliance lead.
- **Days 31–60: one bet.** Ship evidence links on the existing draft view to three design-partner firms behind a flag. Instrument edit distance, decision time and send-backs. Write the vulnerability confirmation spec against Saturn’s actual Meeting Notes data model.
- **Days 61–90: decide.** Run the firm-level A/B. Kill, iterate or roll out on the pre-agreed rule. Publish the eval set and a metric review cadence the team owns.

## Risks
1. Saturn may already show sources at review; then the value is in the deterministic/probabilistic split and the audit export, not the chips.
2. Advisers may reject more friction on clean reports. The gate must cost one click when everything passes.
3. A lexicon scan will not scale across meeting types; v2 needs a reviewed classifier with its own eval.
4. Compliance teams may distrust any “check” language. Wording stays “illustrative” until a compliance owner signs the rule set.

## What would change my mind
- If observed review time is dominated by fixing tone and structure rather than verifying facts, the deterministic layer matters less than drafting quality.
- If advisers already click through evidence in under a minute, the chips are not the bottleneck.
- If file reviewers find vulnerability capture is already consistent, the panel should drop down the roadmap.
