# Decision log

Independent concept by Ayo Ahmed. Not affiliated with Saturn. Decisions made without stopping to ask, as briefed.

| # | Decision | Why | Alternatives considered |
|---|---|---|---|
| D1 | Static Vite + React + TypeScript, no backend | Brief: browser only, no keys. One bundle, testable engine in plain TS | Next.js static export (heavier, no gain) |
| D2 | Hash routing (`#/case/SR-0914`) | GitHub Pages has no rewrites; every route survives a hard refresh | 404.html redirect trick (fragile) |
| D3 | Engine in `src/engine` separate from UI | Same code runs in tests, the eval script and the browser | Logic in components |
| D4 | No confidence percentages; evidence strength derived from evidence types: verbatim client quote → Direct quote; transcript/fact-find reference without quote → Inferred; nothing or adviser-only → Weak | A percentage implies calibration the system does not have | Model-style scores |
| D5 | Deterministic checks compare to the fact-find, not the transcript | Fact-find is the structured record the adviser owns; transcript is speech | Parsing numbers from speech |
| D6 | Risk profile review window default 12 months, editable | Common firm practice; this is a firm setting, not an FCA rule, and is labelled so | Fixed value |
| D7 | ISA allowance rule uses £20,000 (GOV.UK, 2026 to 2027) | Public, checkable figure ([ledger](SOURCE_LEDGER.md) S13) | Hard-coding without source |
| D8 | COBS checklist limited to provisions read in the live Handbook (9A.3.2R, 9A.3.3R, 9.4.7R, 9.4.11R) | Brief: do not invent rules | Broader list from memory |
| D9 | COBS 9A applied to ISA/GIA cases, COBS 9.4 to pension cases, 9.4.11R only to the DB transfer case | Matches the scope statements on each Handbook page as read; simplification noted as illustrative | Applying all to all |
| D10 | Vulnerability scan is a regex lexicon over client lines only | Deterministic, explainable, testable; shows its own false positives honestly | Model call (out of scope) |
| D11 | Kept the “confused about the car park” false positive in B4 | Shows why the adviser decides; makes precision a real metric | Tuning it away |
| D12 | Approval needs a named adviser and a declaration even when every check passes | Saturn states mandatory adviser review; the adviser carries responsibility | Auto-approve clean cases |
| D13 | Escalated signals block approval | Escalation means someone else must decide | Non-blocking escalation |
| D14 | State in localStorage, reset per case and globally | Edits persist across refresh for the demo; nothing leaves the browser | Session memory only |
| D15 | Newsreader as display serif | Saturn’s serif is commercial; Newsreader is OFL and closest in feel ([BRAND_SHEET](BRAND_SHEET.md)) | Source Serif, EB Garamond |
| D16 | Geist Sans/Mono self-hosted via Fontsource | Matches Saturn’s UI sans; no third-party font CDN | Inter |
| D17 | Saturn wordmark used unchanged, top-left | Brief requires the literal file; ownership stated in README and brand sheet | Recreated wordmark |
| D18 | Firm counts not stated in UI or docs as fact | Saturn pages say 500+ and over 600 | Picking one |
| D19 | Eval scored per case × type (144 decisions) plus per-line vulnerability recall | Case-level hides misses rescued by unrelated signals (G15) | Case-level only |
| D20 | Review-time model shows saving only from deterministic checks | Judgement time should not shrink because of this tool; claiming otherwise would be dishonest | Applying a blanket % |
| D21 | Pages deployed via Actions on `main` with `upload-pages-artifact` + `deploy-pages`; workflow runs tests before build | Brief; broken tests never deploy | Branch-based Pages |
| D22 | Demo voiceover generated with the open-source eSpeak NG voice locally (or best free local voice available) | No paid APIs; brief asks for generated voiceover | Paid TTS |
| D23 | Mobile: desk collapses to Transcript / Draft / Checks tabs under 1100px | Three columns do not fit 390px legibly | Horizontal scroll |
| D24 | Inbox readiness: Blocked > Needs judgement > Ready to sign; a clean case still shows Needs judgement until probabilistic claims are agreed | Honest: code cannot make a clean case ready on its own | Green “clean” label |
