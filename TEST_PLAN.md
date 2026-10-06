# Test plan

Independent concept by Ayo Ahmed. Not affiliated with Saturn.

## Levels
| Level | Tool | Scope | Command |
|---|---|---|---|
| Unit | Vitest | Every deterministic rule (EVID, FIG, ARITH, ALLOW, RISK, SEC), parsers, edit distance | `npm test` |
| System | Vitest | Vulnerability scan and decisions, case evaluation, approval gate, COBS checklist, audit export, review-time model, golden set and eval run | `npm test` |
| Static | ESLint, TypeScript strict | All source, tests and scripts | `npm run lint`, `npm run typecheck` |
| Build | Vite | Production bundle with Pages base path | `npm run build` |
| Eval | `scripts/run-eval.ts` | 24-case golden set | `npm run eval` |
| Deploy | curl | Live URL returns 200; assets load | see TEST_RESULTS |
| Visual | Headless Chromium | Every route at 1366×900 and 390×844 after hard reload; horizontal overflow measured; screenshots reviewed by eye | screenshots in `docs/screenshots` |

## Deterministic rule coverage requirement
Each rule id in `RULES` has at least one passing and one failing test. Rule ids are unique (asserted).

## Manual acceptance (on the live site)
1. SR-0916 Charges: `£540` fails ARITH-001 with “1.5% of £30,000 = £450”; changing to `£450` passes.
2. SR-0916 Summary: `£20,000` → `£25,000` fails ALLOW-001 and FIG-001.
3. SR-0913: unsupported sentence shows red and the sign-off tab lists it as a blocker.
4. SR-0914: confirm Life events signal inserts the quote; dismiss requires a reason.
5. SR-0912: agree all judgement claims, name, declare, approve; status Approved in inbox; audit export JSON and CSV download.
6. Hard refresh on every route keeps the page.
