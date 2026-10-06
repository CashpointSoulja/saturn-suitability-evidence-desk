# Test results

Independent concept by Ayo Ahmed. Not affiliated with Saturn. Every number below is copied from command output on 6 October 2026, Node v22.11.0, commit of this file. Nothing is estimated.

## Summary
| Check | Command | Result |
|---|---|---|
| Unit and system tests | `npm test` | Test Files  3 passed (3) · Tests  108 passed (108) |
| Lint | `npm run lint` | 0 problems (exit 0) |
| Type check | `npm run typecheck` | 0 errors (exit 0) |
| Production build | `npm run build` | ✓ built in 8.22s |
| Golden-set eval | `npm run eval` | see below |
| Live site | `curl -o /dev/null -w '%{http_code}'` | see Deploy checks |

## Tests by file
| File | Tests |
|---|---|
| `tests/parse.test.ts` | 24 |
| `tests/rules.test.ts` | 59 |
| `tests/system.test.ts` | 25 |

## Every test (verbose reporter)
```text
✓ tests/parse.test.ts > parseMoney > parses comma-grouped pounds
✓ tests/parse.test.ts > parseMoney > parses pence
✓ tests/parse.test.ts > parseMoney > parses ungrouped pounds and single-digit pounds with pence
✓ tests/parse.test.ts > parseMoney > parses several amounts in order
✓ tests/parse.test.ts > parseMoney > ignores numbers without a £ sign
✓ tests/parse.test.ts > parsePercents > parses integers and decimals
✓ tests/parse.test.ts > parsePercents > returns empty when none
✓ tests/parse.test.ts > parseDates > parses d Month yyyy to ISO
✓ tests/parse.test.ts > parseDates > parses two-digit days
✓ tests/parse.test.ts > parseDates > ignores other formats
✓ tests/parse.test.ts > parseCount > reads age in digits
✓ tests/parse.test.ts > parseCount > reads term in years
✓ tests/parse.test.ts > parseCount > reads dependants in words
✓ tests/parse.test.ts > parseCount > reads "no dependants" as zero
✓ tests/parse.test.ts > parseCount > reads risk score "5 of 7"
✓ tests/parse.test.ts > parseCount > reads months
✓ tests/parse.test.ts > parseCount > returns undefined when absent
✓ tests/parse.test.ts > helpers > round2 rounds to the penny
✓ tests/parse.test.ts > helpers > formatGBP shows pence only when needed
✓ tests/parse.test.ts > helpers > monthsBetween counts whole months
✓ tests/parse.test.ts > helpers > formatDate is the inverse of parseDates
✓ tests/parse.test.ts > helpers > normaliseQuote ignores case and punctuation
✓ tests/parse.test.ts > helpers > levenshtein counts edits
✓ tests/parse.test.ts > helpers > editDistanceRatio is 0 for no edits and >0 for edits
✓ tests/rules.test.ts > EVID-001/002/003 evidence > passes a sentence with resolvable evidence
✓ tests/rules.test.ts > EVID-001/002/003 evidence > EVID-001 fails a sentence with no evidence
✓ tests/rules.test.ts > EVID-001/002/003 evidence > EVID-002 fails an unknown transcript id
✓ tests/rules.test.ts > EVID-001/002/003 evidence > EVID-002 fails an unknown fact-find field
✓ tests/rules.test.ts > EVID-001/002/003 evidence > EVID-003 passes a verbatim quote
✓ tests/rules.test.ts > EVID-001/002/003 evidence > EVID-003 tolerates case and punctuation
✓ tests/rules.test.ts > EVID-001/002/003 evidence > EVID-003 fails a paraphrased quote
✓ tests/rules.test.ts > EVID-001/002/003 evidence > EVID-003 fails a quote taken from an uncited line
✓ tests/rules.test.ts > FIG-001 money matches fact-find > passes the exact figure
✓ tests/rules.test.ts > FIG-001 money matches fact-find > fails 25,000 against 23,500 and says why
✓ tests/rules.test.ts > FIG-001 money matches fact-find > uses the nth amount
✓ tests/rules.test.ts > FIG-001 money matches fact-find > fails when the figure was deleted
✓ tests/rules.test.ts > FIG-001 money matches fact-find > fails when the field is missing
✓ tests/rules.test.ts > FIG-001 money matches fact-find > compares pence exactly
✓ tests/rules.test.ts > FIG-002 percentage > passes 2%
✓ tests/rules.test.ts > FIG-002 percentage > fails 2.5%
✓ tests/rules.test.ts > FIG-002 percentage > fails when no percentage present
✓ tests/rules.test.ts > FIG-003 date > passes the fact-find date
✓ tests/rules.test.ts > FIG-003 date > fails a different day
✓ tests/rules.test.ts > FIG-003 date > fails an unparseable date
✓ tests/rules.test.ts > FIG-004 stated facts > passes matching age
✓ tests/rules.test.ts > FIG-004 stated facts > flags contradicted age
✓ tests/rules.test.ts > FIG-004 stated facts > passes term in years
✓ tests/rules.test.ts > FIG-004 stated facts > passes risk score
✓ tests/rules.test.ts > FIG-004 stated facts > fails wrong risk score
✓ tests/rules.test.ts > FIG-004 stated facts > passes dependants in words
✓ tests/rules.test.ts > ARITH-001 percentage of > 2% of £29,375 = £587.50
✓ tests/rules.test.ts > ARITH-001 percentage of > 1.5% of £30,000 is not £540
✓ tests/rules.test.ts > ARITH-001 percentage of > fails when the result is missing
✓ tests/rules.test.ts > ARITH-002 components sum > 0.25 + 0.15 + 0.5 = 0.9
✓ tests/rules.test.ts > ARITH-002 components sum > fails when total is 0.95
✓ tests/rules.test.ts > ARITH-002 components sum > fails when a component is missing
✓ tests/rules.test.ts > ARITH-003 relief at source > £23,500 grosses to £29,375
✓ tests/rules.test.ts > ARITH-003 relief at source > £25,000 does not gross to £29,375 and gives the right answer
✓ tests/rules.test.ts > ARITH-003 relief at source > catches transposed digits
✓ tests/rules.test.ts > ARITH-004 monthly to annual > £40 a month is £480 a year
✓ tests/rules.test.ts > ARITH-004 monthly to annual > £4.50 a month is £54 a year
✓ tests/rules.test.ts > ARITH-004 monthly to annual > fails £45 a year
✓ tests/rules.test.ts > ARITH-005 months to pay advice (COBS 9.4.11R(2)(f)) > £3,500 / £1,450 rounds up to 3
✓ tests/rules.test.ts > ARITH-005 months to pay advice (COBS 9.4.11R(2)(f)) > rejects rounding down to 2
✓ tests/rules.test.ts > ARITH-005 months to pay advice (COBS 9.4.11R(2)(f)) > exact division does not round up further
✓ tests/rules.test.ts > ALLOW-001 ISA allowance > £20,000 is within
✓ tests/rules.test.ts > ALLOW-001 ISA allowance > £20,001 exceeds
✓ tests/rules.test.ts > RISK-001 freshness > passes a 6 month old profile
✓ tests/rules.test.ts > RISK-001 freshness > fails a 20 month old profile
✓ tests/rules.test.ts > RISK-001 freshness > passes exactly at the window edge
✓ tests/rules.test.ts > RISK-001 freshness > honours an edited window
✓ tests/rules.test.ts > RISK-001 freshness > fails a profile dated after the meeting
✓ tests/rules.test.ts > RISK-001 freshness > fails when no date exists
✓ tests/rules.test.ts > SEC-001 required sections > all present in a clean case
✓ tests/rules.test.ts > SEC-001 required sections > flags a removed section
✓ tests/rules.test.ts > SEC-001 required sections > treats an emptied section as missing
✓ tests/rules.test.ts > SEC-001 required sections > pension transfer requires the one page summary first
✓ tests/rules.test.ts > SEC-001 required sections > non-transfer cases do not require a one page summary
✓ tests/rules.test.ts > evidence strength > direct when a client quote is verbatim
✓ tests/rules.test.ts > evidence strength > inferred when it rests on client lines without a quote
✓ tests/rules.test.ts > evidence strength > weak when it rests only on adviser lines
✓ tests/rules.test.ts > evidence strength > none when there is no evidence
✓ tests/rules.test.ts > rule catalogue > has unique ids
✓ tests/system.test.ts > vulnerability scan > finds bereavement as a life event
✓ tests/system.test.ts > vulnerability scan > finds reliance on a family member as capability
✓ tests/system.test.ts > vulnerability scan > ignores adviser lines
✓ tests/system.test.ts > vulnerability scan > flags the harmless "confused" line (known false positive)
✓ tests/system.test.ts > vulnerability scan > confirming writes a vulnerability sentence citing the line
✓ tests/system.test.ts > vulnerability scan > dismissing removes a confirmed sentence
✓ tests/system.test.ts > vulnerability scan > a dismissed signal no longer blocks
✓ tests/system.test.ts > case evaluation > every clean base except B4 is ready for review
✓ tests/system.test.ts > case evaluation > editing 23,500 to 25,000 fails the gross-up and figure checks
✓ tests/system.test.ts > case evaluation > clearing a sentence removes it from checks
✓ tests/system.test.ts > case evaluation > predicts no defects on a clean case
✓ tests/system.test.ts > approval gate > requires adviser judgement on probabilistic sentences
✓ tests/system.test.ts > approval gate > opens once all judgement is agreed and attested
✓ tests/system.test.ts > approval gate > requires a named adviser and declaration
✓ tests/system.test.ts > approval gate > an unsupported sentence always blocks
✓ tests/system.test.ts > COBS checklist > every item links to a handbook page and quotes wording
✓ tests/system.test.ts > COBS checklist > pension transfer items apply only to transfers
✓ tests/system.test.ts > COBS checklist > removing disadvantages fails COBS 9.4.7R(3)
✓ tests/system.test.ts > COBS checklist > COBS 9A items are met on the clean ISA case
✓ tests/system.test.ts > audit export > CSV escapes quotes and commas
✓ tests/system.test.ts > audit export > JSON is labelled synthetic
✓ tests/system.test.ts > review time model > saves time only on verified deterministic checks
✓ tests/system.test.ts > golden set and inbox > has 24 golden cases
✓ tests/system.test.ts > golden set and inbox > inbox has six cases with distinct refs
✓ tests/system.test.ts > golden set and inbox > eval runs and recall is between 0 and 1
```

## Eval output (`npm run eval`)
```text
cases 24 (defective 19, clean 5), seeded defects 21, decisions 144
TP 21 FP 3 FN 0 TN 120
defect recall 100.0% (21/21); false-positive rate 2.4% (3/123)
unsupported-claim catch rate 100.0% (4/4)
vulnerability recall 80.0% (4/5); flag precision 73.3% (11/15)
unsupported_claim        TP 4 FP 0 FN 0 TN 20
wrong_figure             TP 4 FP 0 FN 0 TN 20
missed_vulnerability     TP 4 FP 3 FN 0 TN 17
stale_risk_profile       TP 3 FP 0 FN 0 TN 21
missing_section          TP 3 FP 0 FN 0 TN 21
contradicted_statement   TP 3 FP 0 FN 0 TN 21
G01 OK   expected [] predicted []  SIPP top-up, clean
G02 OK   expected [wrong_figure] predicted [wrong_figure]  Gross contribution digits transposed (£29,735)
G03 OK   expected [unsupported_claim] predicted [unsupported_claim]  Recommendation reasons lose all evidence
G04 OK   expected [missing_section] predicted [missing_section]  Disadvantages section dropped
G05 OK   expected [] predicted []  DB transfer enquiry, remain, clean
G06 OK   expected [unsupported_claim] predicted [unsupported_claim]  Invented claim about relying on spouse’s pension
G07 OK   expected [contradicted_statement] predicted [contradicted_statement]  Client age contradicted (55 vs 58)
G08 OK   expected [wrong_figure] predicted [wrong_figure]  Months-to-pay figure wrong (2 vs 3)
G09 OK   expected [] predicted []  Bereaved client, vulnerability captured, clean
G10 OK   expected [missed_vulnerability] predicted [missed_vulnerability]  Draft says no vulnerability despite bereavement and reliance on daughter
G11 OK   expected [stale_risk_profile] predicted [stale_risk_profile]  Risk profile 19 months old
G12 OK   expected [contradicted_statement,unsupported_claim] predicted [contradicted_statement,unsupported_claim]  Paraphrased "quote" and contradicted term (5 vs 10 years)
G13 MISS expected [] predicted [missed_vulnerability]  Consolidation, clean (contains a harmless "confused" line)
G14 MISS expected [stale_risk_profile] predicted [missed_vulnerability,stale_risk_profile]  Risk profile 20 months old
G15 OK   expected [missed_vulnerability] predicted [missed_vulnerability]  Health disclosure phrased outside the keyword list
G16 MISS expected [missing_section] predicted [missed_vulnerability,missing_section]  Ongoing review section dropped
G17 OK   expected [wrong_figure] predicted [wrong_figure]  Initial charge stated as £540, should be £450
G18 OK   expected [missed_vulnerability] predicted [missed_vulnerability]  Low resilience and redundancy disclosed, not captured
G19 OK   expected [contradicted_statement] predicted [contradicted_statement]  Dependants contradicted (three vs two)
G20 OK   expected [unsupported_claim] predicted [unsupported_claim]  Disadvantages sentence loses its evidence
G21 OK   expected [] predicted []  Regular ISA saving, clean
G22 OK   expected [missed_vulnerability] predicted [missed_vulnerability]  Recent diagnosis disclosed, not captured
G23 OK   expected [stale_risk_profile,wrong_figure] predicted [stale_risk_profile,wrong_figure]  Stale risk profile and platform fee arithmetic wrong (£45 a year)
G24 OK   expected [missing_section] predicted [missing_section]  Charges section dropped
```
The three `MISS` rows are the keyword scan flagging “I got a bit confused about which car park to use” in base case B4 (see [EVAL_METHODOLOGY.md](EVAL_METHODOLOGY.md)). Per disclosure line, the one vulnerability miss is G15. These are results on synthetic fixtures written by the same author as the checker.

## Deploy checks
DEPLOY_PLACEHOLDER
