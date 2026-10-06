# PRD: Suitability Evidence Desk

Independent concept by Ayo Ahmed. Not affiliated with Saturn. All client data is synthetic.

## Problem
A drafted suitability report is only as fast to approve as it is easy to trust. Saturn publishes that report work moved from four hours of paraplanner time to 20 minutes of review, and that every AI document stays subject to mandatory adviser review ([ledger](SOURCE_LEDGER.md) S6). The remaining 20 minutes is where the risk sits: an adviser signing a figure nobody checked, a reason the client never gave, or a vulnerability the client disclosed that never reached the file.

## Users
Adviser (signs), paraplanner (prepares and fixes), compliance officer (samples and audits), firm owner (pays, carries the risk). See [JTBD.md](JTBD.md).

## Goal
Cut the time to an approved report without raising the rate at which unsupported or wrong statements reach the client. North star: time to approved report. Guardrail: unsupported-claim escape rate. See [SUCCESS_METRICS.md](SUCCESS_METRICS.md).

## Principles
1. Every sentence shows what it rests on. No evidence, no approval.
2. Code checks what code can check, and says which rule it ran. Everything else is labelled as judgement.
3. No confidence percentages. Evidence strength is Direct quote, Inferred or Weak, derived from the evidence types attached.
4. The adviser decides; the tool records. Sign-off needs a named adviser and a declaration.
5. Honest by default: synthetic data labelled, regulatory checks marked illustrative, Saturn figures attributed to Saturn.

## Scope (v1, this build)
| # | Requirement | Acceptance |
|---|---|---|
| R1 | Case inbox with six synthetic cases and a readiness state with its reason | All six cases listed; state is Blocked, Needs judgement, Ready to sign, Approved or Sent back |
| R2 | Three-column desk: transcript with timestamps and speakers, draft, checks rail | Columns visible ≥1100px; tabs on mobile |
| R3 | Evidence chips on every sentence; clicking highlights the source | Chip click scrolls to and highlights the transcript line or fact-find field |
| R4 | Unsupported sentences in red and blocking | EVID-001 fail shows red; approval gate lists it |
| R5 | Deterministic claims show rule id, title and pass/fail with reason | Each rule result names inputs and expected value |
| R6 | Probabilistic claims show evidence strength and need an explicit adviser agreement | Approval blocked until each is agreed |
| R7 | Vulnerability panel on the FCA four drivers, with quotes, Confirm / Dismiss / Escalate | Confirm writes the client’s words into the support-needs section; Dismiss and Escalate need a reason |
| R8 | Required-content checklist built from COBS 9.4 and COBS 9A wording, each linked and quoted | Labelled “Illustrative checks, not compliance advice” |
| R9 | Editable sentences, checks re-run on every keystroke | Changing a figure to a wrong value fails the matching rule with the reason |
| R10 | Approve / Send back with reason; audit trail with actor, action, time, rule ids, evidence ids; JSON and CSV export | Export files download and parse |
| R11 | Eval lab on 24 golden cases with recall, FPR, unsupported catch, vulnerability recall, per-type table, confusion matrix, editable review-time model | Runs in browser; Saturn’s claim attributed to Saturn; synthetic caveat on screen |
| R12 | Metrics and bets page; What I said no to page | Five metrics with definition, formula, source, target, owner; five exclusions |

## Out of scope
Drafting, model calls, integrations, auto-approval, a complete COBS rulebook. Reasons on the [said-no page](https://cashpointsoulja.github.io/saturn-suitability-evidence-desk/#/no).

## Risks
- Advisers learn to click Agree without reading. Mitigation: measure decision time per claim, sample in file review (override rate).
- Keyword vulnerability scan produces noise and the panel gets ignored. Mitigation: precision guardrail; reasons captured on dismiss feed the lexicon.
- Deterministic rules give false comfort on figures that are right but irrelevant. Mitigation: rules check against the fact-find, and the fact-find itself is evidence the adviser owns.
