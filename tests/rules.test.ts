import { describe, expect, it } from 'vitest';
import { checkEvidence, checkRiskFreshness, checkSections, evidenceStrength, RULES } from '../src/engine/rules';
import { check, claim, clone, mini } from './helpers';
import { B1, B2 } from '../src/data/bases';

const outcomes = (rs: { outcome: string }[]) => rs.map((r) => r.outcome);

describe('EVID-001/002/003 evidence', () => {
  it('passes a sentence with resolvable evidence', () => expect(outcomes(checkEvidence(claim('x', { evidence: ['T1', 'ff.age'] }), mini()))).not.toContain('fail'));
  it('EVID-001 fails a sentence with no evidence', () => expect(checkEvidence(claim('x', { evidence: [] }), mini())[0]).toMatchObject({ rule: 'EVID-001', outcome: 'fail' }));
  it('EVID-002 fails an unknown transcript id', () => expect(checkEvidence(claim('x', { evidence: ['T99'] }), mini()).find((r) => r.rule === 'EVID-002')?.outcome).toBe('fail'));
  it('EVID-002 fails an unknown fact-find field', () => expect(checkEvidence(claim('x', { evidence: ['ff.nope'] }), mini()).find((r) => r.rule === 'EVID-002')?.outcome).toBe('fail'));
  it('EVID-003 passes a verbatim quote', () => expect(checkEvidence(claim('x', { evidence: ['T2'], quote: 'I want to retire at 63 and not have to worry' }), mini()).find((r) => r.rule === 'EVID-003')?.outcome).toBe('pass'));
  it('EVID-003 tolerates case and punctuation', () => expect(checkEvidence(claim('x', { evidence: ['T10'], quote: 'no I would LEAVE it alone' }), mini()).find((r) => r.rule === 'EVID-003')?.outcome).toBe('pass'));
  it('EVID-003 fails a paraphrased quote', () => expect(checkEvidence(claim('x', { evidence: ['T2'], quote: 'I want to stop working at 63' }), mini()).find((r) => r.rule === 'EVID-003')?.outcome).toBe('fail'));
  it('EVID-003 fails a quote taken from an uncited line', () => expect(checkEvidence(claim('x', { evidence: ['T1'], quote: 'I want to retire at 63' }), mini()).find((r) => r.rule === 'EVID-003')?.outcome).toBe('fail'));
});

describe('FIG-001 money matches fact-find', () => {
  it('passes the exact figure', () => expect(check('£23,500', { rule: 'FIG-001', field: 'ff.net_contribution', index: 0 }).outcome).toBe('pass'));
  it('fails 25,000 against 23,500 and says why', () => {
    const r = check('£25,000', { rule: 'FIG-001', field: 'ff.net_contribution', index: 0 });
    expect(r.outcome).toBe('fail');
    expect(r.message).toContain('£23,500');
  });
  it('uses the nth amount', () => expect(check('£1 and £18,000', { rule: 'FIG-001', field: 'ff.emergency_fund', index: 1 }).outcome).toBe('pass'));
  it('fails when the figure was deleted', () => expect(check('no money here', { rule: 'FIG-001', field: 'ff.income', index: 0 }).outcome).toBe('fail'));
  it('fails when the field is missing', () => expect(check('£1', { rule: 'FIG-001', field: 'ff.missing', index: 0 }).outcome).toBe('fail'));
  it('compares pence exactly', () => expect(check('£587.51', { rule: 'FIG-001', field: 'ff.initial_fee', index: 0 }).outcome).toBe('fail'));
});

describe('FIG-002 percentage', () => {
  it('passes 2%', () => expect(check('2%', { rule: 'FIG-002', field: 'ff.initial_fee_pct', index: 0 }).outcome).toBe('pass'));
  it('fails 2.5%', () => expect(check('2.5%', { rule: 'FIG-002', field: 'ff.initial_fee_pct', index: 0 }).outcome).toBe('fail'));
  it('fails when no percentage present', () => expect(check('two percent', { rule: 'FIG-002', field: 'ff.initial_fee_pct', index: 0 }).outcome).toBe('fail'));
});

describe('FIG-003 date', () => {
  it('passes the fact-find date', () => expect(check('on 2 March 2026', { rule: 'FIG-003', field: 'ff.atr_date', index: 0 }).outcome).toBe('pass'));
  it('fails a different day', () => expect(check('on 3 March 2026', { rule: 'FIG-003', field: 'ff.atr_date', index: 0 }).outcome).toBe('fail'));
  it('fails an unparseable date', () => expect(check('in March', { rule: 'FIG-003', field: 'ff.atr_date', index: 0 }).outcome).toBe('fail'));
});

describe('FIG-004 stated facts', () => {
  it('passes matching age', () => expect(check('retire at age 63', { rule: 'FIG-004', field: 'ff.retirement_age', pattern: 'age' }).outcome).toBe('pass'));
  it('flags contradicted age', () => expect(check('retire at age 65', { rule: 'FIG-004', field: 'ff.retirement_age', pattern: 'age' }).message).toMatch(/Contradiction/));
  it('passes term in years', () => expect(check('a term of 11 years', { rule: 'FIG-004', field: 'ff.term_years', pattern: 'years' }).outcome).toBe('pass'));
  it('passes risk score', () => expect(check('assessed as 5 of 7', { rule: 'FIG-004', field: 'ff.atr_score', pattern: 'atr_score' }).outcome).toBe('pass'));
  it('fails wrong risk score', () => expect(check('assessed as 4 out of 7', { rule: 'FIG-004', field: 'ff.atr_score', pattern: 'atr_score' }).outcome).toBe('fail'));
  it('passes dependants in words', () => expect(check('one financial dependant', { rule: 'FIG-004', field: 'ff.dependants', pattern: 'dependants' }, clone(B2)).outcome).toBe('pass'));
});

describe('ARITH-001 percentage of', () => {
  it('2% of £29,375 = £587.50', () => expect(check('2% of £29,375 is £587.50', { rule: 'ARITH-001', pct: 0, base: 0, result: 1 }).outcome).toBe('pass'));
  it('1.5% of £30,000 is not £540', () => {
    const r = check('1.5% of £30,000 is £540', { rule: 'ARITH-001', pct: 0, base: 0, result: 1 });
    expect(r.outcome).toBe('fail');
    expect(r.message).toContain('£450');
  });
  it('fails when the result is missing', () => expect(check('2% of £29,375', { rule: 'ARITH-001', pct: 0, base: 0, result: 1 }).outcome).toBe('fail'));
});

describe('ARITH-002 components sum', () => {
  it('0.25 + 0.15 + 0.5 = 0.9', () => expect(check('0.9%: 0.25%, 0.15%, 0.5%', { rule: 'ARITH-002', parts: [1, 2, 3], total: 0 }).outcome).toBe('pass'));
  it('fails when total is 0.95', () => expect(check('0.95%: 0.25%, 0.15%, 0.5%', { rule: 'ARITH-002', parts: [1, 2, 3], total: 0 }).outcome).toBe('fail'));
  it('fails when a component is missing', () => expect(check('0.9%: 0.25%', { rule: 'ARITH-002', parts: [1, 2, 3], total: 0 }).outcome).toBe('fail'));
});

describe('ARITH-003 relief at source', () => {
  it('£23,500 grosses to £29,375', () => expect(check('£23,500 grosses up to £29,375', { rule: 'ARITH-003', net: 0, gross: 1 }).outcome).toBe('pass'));
  it('£25,000 does not gross to £29,375 and gives the right answer', () => {
    const r = check('£25,000 grosses up to £29,375', { rule: 'ARITH-003', net: 0, gross: 1 });
    expect(r.outcome).toBe('fail');
    expect(r.message).toContain('£31,250');
  });
  it('catches transposed digits', () => expect(check('£23,500 grosses up to £29,735', { rule: 'ARITH-003', net: 0, gross: 1 }).outcome).toBe('fail'));
});

describe('ARITH-004 monthly to annual', () => {
  it('£40 a month is £480 a year', () => expect(check('£40 a month, £480 a year', { rule: 'ARITH-004', monthly: 0, annual: 1 }).outcome).toBe('pass'));
  it('£4.50 a month is £54 a year', () => expect(check('£4.50 a month, £54 a year', { rule: 'ARITH-004', monthly: 0, annual: 1 }).outcome).toBe('pass'));
  it('fails £45 a year', () => expect(check('£4.50 a month, £45 a year', { rule: 'ARITH-004', monthly: 0, annual: 1 }).outcome).toBe('fail'));
});

describe('ARITH-005 months to pay advice (COBS 9.4.11R(2)(f))', () => {
  const ch = { rule: 'ARITH-005', cost: 0, monthly: 1, months: 'months' } as const;
  it('£3,500 / £1,450 rounds up to 3', () => expect(check('£3,500 equals 3 months of £1,450', ch).outcome).toBe('pass'));
  it('rejects rounding down to 2', () => expect(check('£3,500 equals 2 months of £1,450', ch).outcome).toBe('fail'));
  it('exact division does not round up further', () => expect(check('£2,900 equals 2 months of £1,450', ch).outcome).toBe('pass'));
});

describe('ALLOW-001 ISA allowance', () => {
  it('£20,000 is within', () => expect(check('£20,000', { rule: 'ALLOW-001', index: 0 }).outcome).toBe('pass'));
  it('£20,001 exceeds', () => expect(check('£20,001', { rule: 'ALLOW-001', index: 0 }).outcome).toBe('fail'));
});

describe('RISK-001 freshness', () => {
  it('passes a 6 month old profile', () => expect(checkRiskFreshness(mini()).outcome).toBe('pass'));
  it('fails a 20 month old profile', () => {
    const c = mini();
    c.factFind.find((f) => f.id === 'ff.atr_date')!.value = '2025-01-20';
    c.meetingDate = '2026-09-22';
    expect(checkRiskFreshness(c).message).toContain('20 months');
  });
  it('passes exactly at the window edge', () => {
    const c = mini();
    c.factFind.find((f) => f.id === 'ff.atr_date')!.value = '2025-09-14';
    expect(checkRiskFreshness(c, 12).outcome).toBe('pass');
  });
  it('honours an edited window', () => expect(checkRiskFreshness(mini(), 3).outcome).toBe('fail'));
  it('fails a profile dated after the meeting', () => {
    const c = mini();
    c.factFind.find((f) => f.id === 'ff.atr_date')!.value = '2027-01-01';
    expect(checkRiskFreshness(c).outcome).toBe('fail');
  });
  it('fails when no date exists', () => {
    const c = mini();
    c.factFind = c.factFind.filter((f) => f.id !== 'ff.atr_date');
    expect(checkRiskFreshness(c).outcome).toBe('fail');
  });
});

describe('SEC-001 required sections', () => {
  it('all present in a clean case', () => expect(outcomes(checkSections(clone(B1)))).not.toContain('fail'));
  it('flags a removed section', () => {
    const c = clone(B1);
    expect(checkSections(c, c.claims.filter((x) => x.section !== 'charges')).find((r) => r.outcome === 'fail')?.message).toContain('Charges');
  });
  it('treats an emptied section as missing', () => {
    const c = clone(B1);
    c.claims.filter((x) => x.section === 'review').forEach((x) => (x.text = ' '));
    expect(outcomes(checkSections(c))).toContain('fail');
  });
  it('pension transfer requires the one page summary first', () => {
    const c = clone(B2);
    const moved = [...c.claims.slice(2), ...c.claims.slice(0, 2)];
    expect(checkSections(c, moved).find((r) => r.outcome === 'fail')?.message).toMatch(/not at the front/);
  });
  it('non-transfer cases do not require a one page summary', () => expect(checkSections(clone(B1)).length).toBe(9));
});

describe('evidence strength', () => {
  it('direct when a client quote is verbatim', () => expect(evidenceStrength(claim('x', { evidence: ['T2'], quote: 'not have to worry' }), mini())).toBe('direct'));
  it('inferred when it rests on client lines without a quote', () => expect(evidenceStrength(claim('x', { evidence: ['T2'] }), mini())).toBe('inferred'));
  it('weak when it rests only on adviser lines', () => expect(evidenceStrength(claim('x', { evidence: ['T1'] }), mini())).toBe('weak'));
  it('none when there is no evidence', () => expect(evidenceStrength(claim('x', { evidence: [] }), mini())).toBe('none'));
});

describe('rule catalogue', () => {
  it('has unique ids', () => expect(new Set(RULES.map((r) => r.id)).size).toBe(RULES.length));
});
