import { describe, expect, it } from 'vitest';
import { approvalGate, evaluateCase, predictDefects } from '../src/engine/checker';
import { applySignalDecision, scanTranscript } from '../src/engine/vulnerability';
import { checkCobs, COBS_ITEMS } from '../src/engine/cobs';
import { toCSV, toJSON } from '../src/engine/audit';
import { DEFAULT_ASSUMPTIONS, estimateMinutes } from '../src/engine/reviewTime';
import { runEval } from '../src/engine/eval';
import { BASES, B1, B2, B3, B4 } from '../src/data/bases';
import { GOLDEN } from '../src/data/golden';
import { INBOX } from '../src/data/inbox';
import { clone } from './helpers';

describe('vulnerability scan', () => {
  it('finds bereavement as a life event', () => expect(scanTranscript(B3).some((s) => s.driver === 'life_events' && s.lineId === 'T2')).toBe(true));
  it('finds reliance on a family member as capability', () => expect(scanTranscript(B3).some((s) => s.driver === 'capability' && s.lineId === 'T4')).toBe(true));
  it('ignores adviser lines', () => {
    const c = clone(B1);
    c.transcript.push({ id: 'T99', t: '09:00', speaker: 'Adviser', text: 'Some clients have been diagnosed with illnesses.' });
    expect(scanTranscript(c).some((s) => s.lineId === 'T99')).toBe(false);
  });
  it('flags the harmless "confused" line (known false positive)', () => expect(scanTranscript(B4).map((s) => s.lineId)).toContain('T1'));
  it('confirming writes a vulnerability sentence citing the line', () => {
    const c = clone(B4);
    const s = scanTranscript(c)[0];
    const next = applySignalDecision(c.claims, s, 'confirmed', 'Daniel');
    const added = next.find((x) => x.id === `V-${s.id}`)!;
    expect(added.section).toBe('vulnerability');
    expect(added.evidence).toEqual([s.lineId]);
    expect(next.some((x) => x.noVulnerabilityStatement)).toBe(false);
  });
  it('dismissing removes a confirmed sentence', () => {
    const c = clone(B4);
    const s = scanTranscript(c)[0];
    const confirmed = applySignalDecision(c.claims, s, 'confirmed', 'Daniel');
    expect(applySignalDecision(confirmed, s, 'dismissed', 'Daniel').some((x) => x.id === `V-${s.id}`)).toBe(false);
  });
  it('a dismissed signal no longer blocks', () => {
    const c = clone(B4);
    const s = scanTranscript(c)[0];
    expect(evaluateCase(c, { signalStates: { [s.id]: { decision: 'dismissed', reason: 'logistics', at: 'now', by: 'A' } } }).vulnerability.outcome).toBe('pass');
  });
});

describe('case evaluation', () => {
  it('every clean base except B4 is ready for review', () => {
    for (const b of BASES.filter((x) => x.id !== 'B4')) expect(evaluateCase(b).blockers, b.id).toEqual([]);
  });
  it('editing 23,500 to 25,000 fails the gross-up and figure checks', () => {
    const claims = clone(B1.claims);
    claims[0].text = claims[0].text.replace('£23,500', '£25,000');
    const e = evaluateCase(B1, { claims }).claims[0];
    expect(e.status).toBe('failed');
    expect(e.results.filter((r) => r.outcome === 'fail').map((r) => r.rule)).toEqual(['FIG-001', 'ARITH-003']);
  });
  it('clearing a sentence removes it from checks', () => {
    const claims = clone(B1.claims);
    claims[1].text = '';
    expect(evaluateCase(B1, { claims }).claims.length).toBe(B1.claims.length - 1);
  });
  it('predicts no defects on a clean case', () => expect([...predictDefects(evaluateCase(B2))]).toEqual([]));
});

describe('approval gate', () => {
  const base = (c = B2) => ({ evaluation: evaluateCase(c), agreedClaimIds: new Set<string>(), signalStates: {}, adviserName: 'Leah Corrigan', attested: true });
  it('requires adviser judgement on probabilistic sentences', () => expect(approvalGate(base()).join()).toMatch(/adviser judgement/));
  it('opens once all judgement is agreed and attested', () => {
    const g = base();
    g.agreedClaimIds = new Set(g.evaluation.claims.map((c) => c.claim.id));
    expect(approvalGate(g)).toEqual([]);
  });
  it('requires a named adviser and declaration', () => {
    const g = { ...base(), adviserName: ' ', attested: false };
    g.agreedClaimIds = new Set(g.evaluation.claims.map((c) => c.claim.id));
    expect(approvalGate(g).length).toBe(2);
  });
  it('an unsupported sentence always blocks', () => {
    const g = { ...base(GOLDEN.find((x) => x.id === 'G06')!.case) };
    g.agreedClaimIds = new Set(g.evaluation.claims.map((c) => c.claim.id));
    expect(approvalGate(g).join()).toMatch(/unsupported/);
  });
});

describe('COBS checklist', () => {
  it('every item links to a handbook page and quotes wording', () => {
    for (const i of COBS_ITEMS) { expect(i.url).toMatch(/^https:\/\/handbook\.fca\.org\.uk\//); expect(i.wording.length).toBeGreaterThan(20); }
  });
  it('pension transfer items apply only to transfers', () => {
    expect(checkCobs(B1).filter((r) => r.item.ref.startsWith('COBS 9.4.11')).every((r) => r.status === 'not_applicable')).toBe(true);
    expect(checkCobs(B2).filter((r) => r.item.ref.startsWith('COBS 9.4.11')).every((r) => r.status === 'met')).toBe(true);
  });
  it('removing disadvantages fails COBS 9.4.7R(3)', () => expect(checkCobs(B1, B1.claims.filter((c) => c.section !== 'disadvantages')).find((r) => r.item.ref === 'COBS 9.4.7R(3)')?.status).toBe('missing'));
  it('COBS 9A items are met on the clean ISA case', () => expect(checkCobs(B3).filter((r) => r.status === 'missing')).toEqual([]));
});

describe('audit export', () => {
  const e = [{ seq: 1, at: '2026-10-06T10:00:00Z', actor: 'Sam Okafor', role: 'Paraplanner', caseId: 'SR-0912', action: 'edit', claimId: 'c1', rule: 'ARITH-003', evidence: ['T4', 'ff.net_contribution'], detail: 'Changed "£23,500", to £25,000' }];
  it('CSV escapes quotes and commas', () => expect(toCSV(e).split('\n')[1]).toContain('"Changed ""£23,500"", to £25,000"'));
  it('JSON is labelled synthetic', () => expect(JSON.parse(toJSON(e)).synthetic).toBe(true));
});

describe('review time model', () => {
  it('saves time only on verified deterministic checks', () => {
    const r = estimateMinutes({ deterministic: 10, probabilistic: 5, failedChecks: 0, signals: 0 }, DEFAULT_ASSUMPTIONS);
    expect(r.saved).toBeCloseTo(10 * (2 - 0.25));
  });
});

describe('golden set and inbox', () => {
  it('has 24 golden cases', () => expect(GOLDEN.length).toBe(24));
  it('inbox has six cases with distinct refs', () => expect(new Set(INBOX.map((i) => i.ref)).size).toBe(6));
  it('eval runs and recall is between 0 and 1', () => {
    const r = runEval(GOLDEN);
    expect(r.decisions).toBe(24 * 6);
    expect(r.defectRecall).toBeGreaterThan(0);
    expect(r.defectRecall).toBeLessThanOrEqual(1);
  });
});
