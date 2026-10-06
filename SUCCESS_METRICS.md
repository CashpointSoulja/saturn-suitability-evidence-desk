# Success metrics

Independent concept by Ayo Ahmed. Not affiliated with Saturn. Targets are hypotheses to test against a measured baseline, not results. The same table is on the [Metrics and bets page](https://cashpointsoulja.github.io/saturn-suitability-evidence-desk/#/metrics) (source: `src/data/metrics.ts`).

| Metric | Role | Definition | Formula | Data source | Target | Owner |
|---|---|---|---|---|---|---|
| Time to approved report | North star | Working time from draft created to adviser sign-off | median(approved_at − draft_created_at), business hours | draft_created, report_approved events | Hypothesis: median < 30 min active review within a quarter; baseline first | Lead PM, suitability |
| Unsupported-claim escape rate | Guardrail | Approved reports later found to contain a sentence with no valid evidence | approved reports with ≥1 unsupported sentence in sample ÷ approved reports sampled | Compliance file-check sample tagged against audit evidence ids | 0; any escape is P1 | Compliance lead with Lead PM |
| Adviser edit distance | Input | How much the adviser changes the draft before approval | Σ levenshtein(original, final) ÷ Σ length(original) | sentence_edited events (before/after) | Trend down; alarm at zero (rubber-stamping) | Lead PM with drafting owner |
| Vulnerability flag precision | Guardrail | Surfaced signals the adviser confirms or escalates | (confirmed + escalated) ÷ all decided | vulnerability_* events | > 60%, paired with golden-set recall | Lead PM with Consumer Duty lead |
| Override rate | Guardrail | Deterministic fails cleared by changing evidence instead of the figure, or reversed by compliance | such reports ÷ reports with any deterministic fail | Audit trail rule results before/after edits | < 5%, reviewed weekly | Lead PM |
| Send-back rate | Input | Drafts returned with a reason | sent_back ÷ (sent_back + approved) | report_sent_back, report_approved | Set after 4 weeks baseline, tracked by reason | Paraplanning lead |

## Why these
- Speed alone is easy to win by skimming. Every speed metric is paired with a guardrail that a skimming adviser would break.
- Edit distance going to zero is treated as a warning, not a win.
- The desk’s edit-distance function is the same one tested in `tests/parse.test.ts` (`editDistanceRatio`), so the definition is executable.

## Experiment design
1. **Baseline (2 weeks):** desk in shadow mode; log time and edits, no chips shown.
2. **Firm-level A/B (2 weeks):** chips and checks on vs off, same drafting. Unit is the firm to avoid contamination between advisers who share paraplanners.
3. **Decision rule:** ship if median time to approved report falls ≥ 20% and the sampled escape rate is 0 in the treatment arm. Stop if any escape is attributable to an Agree click under 3 seconds.
