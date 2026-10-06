import type { AdviceCase, Claim, DeterministicCheck, EvidenceStrength, FactField, RuleResult, SectionId } from './types';
import { formatDate, formatGBP, monthsBetween, normaliseQuote, parseCount, parseDates, parseMoney, parsePercents, round2 } from './parse';

export const RELIEF_AT_SOURCE_RATE = 0.2;
export const ISA_ALLOWANCE_2026_27 = 20000;
export const DEFAULT_ATR_WINDOW_MONTHS = 12;

export interface RuleDef {
  id: string;
  family: 'evidence' | 'figure' | 'arithmetic' | 'risk' | 'structure' | 'vulnerability' | 'allowance';
  title: string;
  logic: string;
  source?: string;
}

export const RULES: RuleDef[] = [
  { id: 'EVID-001', family: 'evidence', title: 'Sentence has evidence', logic: 'A sentence with zero evidence ids is Unsupported and cannot be approved.' },
  { id: 'EVID-002', family: 'evidence', title: 'Evidence ids resolve', logic: 'Every evidence id must exist in this case: a transcript line (T…) or a fact-find field (ff.…).' },
  { id: 'EVID-003', family: 'evidence', title: 'Quote is verbatim', logic: 'If a sentence quotes the client, the quote must appear word for word (ignoring case and punctuation) in a cited transcript line.' },
  { id: 'FIG-001', family: 'figure', title: 'Money figure matches fact-find', logic: 'The nth £ amount in the sentence equals the bound fact-find field to the penny.' },
  { id: 'FIG-002', family: 'figure', title: 'Percentage matches fact-find', logic: 'The nth % in the sentence equals the bound fact-find field exactly.' },
  { id: 'FIG-003', family: 'figure', title: 'Date matches fact-find', logic: 'The nth date (d Month yyyy) in the sentence equals the bound fact-find date.' },
  { id: 'FIG-004', family: 'figure', title: 'Stated fact matches fact-find', logic: 'An age, term, dependant count or risk score stated in words or digits equals the fact-find. A mismatch is a contradicted statement.' },
  { id: 'ARITH-001', family: 'arithmetic', title: 'Percentage-of arithmetic', logic: 'X% of £A must equal £B, rounded to the penny.' },
  { id: 'ARITH-002', family: 'arithmetic', title: 'Components sum to total', logic: 'The component percentages must add up to the stated total (to 0.01).' },
  { id: 'ARITH-003', family: 'arithmetic', title: 'Relief at source gross-up', logic: 'A net personal contribution grossed up at the basic 20% rate: gross = net ÷ 0.8, to the penny.', source: 'GOV.UK, Tax on your private pension contributions' },
  { id: 'ARITH-004', family: 'arithmetic', title: 'Monthly to annual', logic: 'A monthly cash amount × 12 must equal the stated annual amount (to the penny).' },
  { id: 'ARITH-005', family: 'arithmetic', title: 'Months to pay initial advice', logic: 'Months = initial advice cost ÷ revalued monthly income from the ceding scheme, rounded up to the nearest whole month.', source: 'COBS 9.4.11R(2)(f)' },
  { id: 'ALLOW-001', family: 'allowance', title: 'ISA subscription within allowance', logic: 'A recommended ISA subscription must not exceed £20,000 for the 2026 to 2027 tax year.', source: 'GOV.UK, Individual Savings Accounts' },
  { id: 'RISK-001', family: 'risk', title: 'Risk profile is in date', logic: 'The attitude-to-risk assessment date must fall within the firm review window (default 12 months, a synthetic firm policy) before the meeting date.' },
  { id: 'SEC-001', family: 'structure', title: 'Required sections present', logic: 'Each section the firm template requires for this advice type has at least one non-empty sentence. Pension transfers also need a one page summary placed first.' },
  { id: 'VUL-001', family: 'vulnerability', title: 'Vulnerability signals handled', logic: 'Every signal the transcript scan finds must be cited in the vulnerability section or dismissed by the adviser with a reason.' },
];

export const RULE_BY_ID = Object.fromEntries(RULES.map((r) => [r.id, r]));

function field(c: AdviceCase, id: string): FactField | undefined {
  return c.factFind.find((f) => f.id === id);
}

function line(c: AdviceCase, id: string) {
  return c.transcript.find((l) => l.id === id);
}

export function evidenceExists(c: AdviceCase, ref: string): boolean {
  return ref.startsWith('ff.') ? !!field(c, ref) : !!line(c, ref);
}

export function checkEvidence(claim: Claim, c: AdviceCase): RuleResult[] {
  const out: RuleResult[] = [];
  const ids = claim.evidence.filter((e) => e.trim() !== '');
  out.push(
    ids.length === 0
      ? { rule: 'EVID-001', claimId: claim.id, outcome: 'fail', message: 'No evidence is attached to this sentence. It is Unsupported.', evidence: [] }
      : { rule: 'EVID-001', claimId: claim.id, outcome: 'pass', message: `${ids.length} evidence item${ids.length > 1 ? 's' : ''} attached.`, evidence: ids },
  );
  if (ids.length) {
    const missing = ids.filter((e) => !evidenceExists(c, e));
    out.push(
      missing.length
        ? { rule: 'EVID-002', claimId: claim.id, outcome: 'fail', message: `Evidence not found in this case: ${missing.join(', ')}.`, evidence: missing }
        : { rule: 'EVID-002', claimId: claim.id, outcome: 'pass', message: 'All evidence ids resolve to this case.', evidence: ids },
    );
  }
  if (claim.quote) {
    const q = normaliseQuote(claim.quote);
    const hit = ids.find((e) => {
      const l = line(c, e);
      return l && normaliseQuote(l.text).includes(q);
    });
    out.push(
      hit
        ? { rule: 'EVID-003', claimId: claim.id, outcome: 'pass', message: `Quote found verbatim at ${hit}.`, evidence: [hit] }
        : { rule: 'EVID-003', claimId: claim.id, outcome: 'fail', message: `The quoted words "${claim.quote}" do not appear in any cited transcript line.`, evidence: ids },
    );
  }
  return out;
}

function nth<T>(arr: T[], i: number): T | undefined {
  return arr[i];
}

export function runCheck(check: DeterministicCheck, claim: Claim, c: AdviceCase): RuleResult {
  const base = { rule: check.rule, claimId: claim.id };
  const text = claim.text;
  const money = parseMoney(text);
  const pcts = parsePercents(text);
  const fail = (message: string, evidence: string[] = []): RuleResult => ({ ...base, outcome: 'fail', message, evidence });
  const pass = (message: string, evidence: string[] = []): RuleResult => ({ ...base, outcome: 'pass', message, evidence });

  switch (check.rule) {
    case 'FIG-001': {
      const f = field(c, check.field);
      const v = nth(money, check.index);
      if (!f) return fail(`Fact-find field ${check.field} is missing.`);
      if (v === undefined) return fail(`Expected a £ amount for ${f.label}; none found in the sentence.`, [f.id]);
      return round2(v) === round2(Number(f.value))
        ? pass(`${formatGBP(v)} matches ${f.label} (${formatGBP(Number(f.value))}).`, [f.id])
        : fail(`Sentence says ${formatGBP(v)} but ${f.label} in the fact-find is ${formatGBP(Number(f.value))}.`, [f.id]);
    }
    case 'FIG-002': {
      const f = field(c, check.field);
      const v = nth(pcts, check.index);
      if (!f) return fail(`Fact-find field ${check.field} is missing.`);
      if (v === undefined) return fail(`Expected a percentage for ${f.label}; none found.`, [f.id]);
      return v === Number(f.value)
        ? pass(`${v}% matches ${f.label}.`, [f.id])
        : fail(`Sentence says ${v}% but ${f.label} in the fact-find is ${f.value}%.`, [f.id]);
    }
    case 'FIG-003': {
      const f = field(c, check.field);
      const v = nth(parseDates(text), check.index);
      if (!f) return fail(`Fact-find field ${check.field} is missing.`);
      if (v === undefined) return fail(`Expected a date for ${f.label}; none found (format: 14 September 2026).`, [f.id]);
      return v === f.value
        ? pass(`${formatDate(v)} matches ${f.label}.`, [f.id])
        : fail(`Sentence says ${formatDate(v)} but ${f.label} is ${formatDate(String(f.value))}.`, [f.id]);
    }
    case 'FIG-004': {
      const f = field(c, check.field);
      const v = parseCount(text, check.pattern);
      if (!f) return fail(`Fact-find field ${check.field} is missing.`);
      if (v === undefined) return fail(`Expected ${f.label} in the sentence; none found.`, [f.id]);
      return v === Number(f.value)
        ? pass(`${f.label}: ${v} matches the fact-find.`, [f.id])
        : fail(`Contradiction: sentence states ${v} for ${f.label}; the fact-find records ${f.value}.`, [f.id]);
    }
    case 'ARITH-001': {
      const p = nth(pcts, check.pct), a = nth(money, check.base), b = nth(money, check.result);
      if (p === undefined || a === undefined || b === undefined) return fail('Could not find the percentage, base and result in the sentence.');
      const expected = round2((a * p) / 100);
      return expected === b
        ? pass(`${p}% of ${formatGBP(a)} = ${formatGBP(expected)}.`)
        : fail(`${p}% of ${formatGBP(a)} = ${formatGBP(expected)}, but the sentence states ${formatGBP(b)}.`);
    }
    case 'ARITH-002': {
      const parts = check.parts.map((i) => nth(pcts, i));
      const total = nth(pcts, check.total);
      if (parts.some((x) => x === undefined) || total === undefined) return fail('Could not find every component and the total.');
      const sum = round2((parts as number[]).reduce((s, x) => s + x, 0));
      return Math.abs(sum - total) < 0.005
        ? pass(`${(parts as number[]).map((x) => x + '%').join(' + ')} = ${sum}%.`)
        : fail(`${(parts as number[]).map((x) => x + '%').join(' + ')} = ${sum}%, but the stated total is ${total}%.`);
    }
    case 'ARITH-003': {
      const net = nth(money, check.net), gross = nth(money, check.gross);
      if (net === undefined || gross === undefined) return fail('Could not find the net and gross amounts.');
      const expected = round2(net / (1 - RELIEF_AT_SOURCE_RATE));
      return expected === gross
        ? pass(`${formatGBP(net)} ÷ 0.8 = ${formatGBP(expected)} gross.`)
        : fail(`${formatGBP(net)} ÷ 0.8 = ${formatGBP(expected)}, but the sentence states ${formatGBP(gross)}.`);
    }
    case 'ARITH-004': {
      const m = nth(money, check.monthly), a = nth(money, check.annual);
      if (m === undefined || a === undefined) return fail('Could not find the monthly and annual amounts.');
      const expected = round2(m * 12);
      return expected === a
        ? pass(`${formatGBP(m)} × 12 = ${formatGBP(expected)}.`)
        : fail(`${formatGBP(m)} × 12 = ${formatGBP(expected)}, but the sentence states ${formatGBP(a)}.`);
    }
    case 'ARITH-005': {
      const cost = nth(money, check.cost), monthly = nth(money, check.monthly);
      const months = parseCount(text, check.months);
      if (cost === undefined || monthly === undefined || months === undefined) return fail('Could not find the cost, monthly income and number of months.');
      const expected = Math.ceil(cost / monthly);
      return expected === months
        ? pass(`${formatGBP(cost)} ÷ ${formatGBP(monthly)} = ${(cost / monthly).toFixed(2)}, rounded up to ${expected} months.`)
        : fail(`${formatGBP(cost)} ÷ ${formatGBP(monthly)} rounds up to ${expected} months, but the sentence states ${months}.`);
    }
    case 'ALLOW-001': {
      const v = nth(money, check.index);
      if (v === undefined) return fail('Could not find the ISA subscription amount.');
      return v <= ISA_ALLOWANCE_2026_27
        ? pass(`${formatGBP(v)} is within the ${formatGBP(ISA_ALLOWANCE_2026_27)} ISA allowance.`)
        : fail(`${formatGBP(v)} exceeds the ${formatGBP(ISA_ALLOWANCE_2026_27)} ISA allowance for 2026 to 2027.`);
    }
  }
}

export function checkRiskFreshness(c: AdviceCase, windowMonths = DEFAULT_ATR_WINDOW_MONTHS): RuleResult {
  const f = field(c, 'ff.atr_date');
  if (!f) return { rule: 'RISK-001', outcome: 'fail', message: 'No attitude-to-risk assessment date in the fact-find.', evidence: [] };
  const age = monthsBetween(String(f.value), c.meetingDate);
  return age <= windowMonths && age >= 0
    ? { rule: 'RISK-001', outcome: 'pass', message: `Risk profile dated ${formatDate(String(f.value))} is ${age} months before the meeting (window ${windowMonths}).`, evidence: [f.id] }
    : { rule: 'RISK-001', outcome: 'fail', message: `Risk profile dated ${formatDate(String(f.value))} is ${age} months old at the meeting; the firm window is ${windowMonths} months. Reassess before relying on it.`, evidence: [f.id] };
}

export const SECTION_LABELS: Record<SectionId, string> = {
  one_page_summary: 'One page summary',
  summary: 'Summary of advice',
  objectives: 'Your objectives',
  circumstances: 'Your circumstances',
  risk: 'Attitude to risk and capacity for loss',
  recommendation: 'Our recommendation and why',
  disadvantages: 'Disadvantages and risks',
  charges: 'Charges',
  vulnerability: 'Your circumstances and support needs',
  review: 'Ongoing review',
};

export const SECTION_ORDER: SectionId[] = ['one_page_summary', 'summary', 'objectives', 'circumstances', 'risk', 'recommendation', 'disadvantages', 'charges', 'vulnerability', 'review'];

export function requiredSections(c: AdviceCase): SectionId[] {
  const base: SectionId[] = ['summary', 'objectives', 'circumstances', 'risk', 'recommendation', 'disadvantages', 'charges', 'vulnerability', 'review'];
  return c.pensionTransfer ? ['one_page_summary', ...base] : base;
}

export function checkSections(c: AdviceCase, claims: Claim[] = c.claims): RuleResult[] {
  return requiredSections(c).map((s) => {
    const present = claims.some((cl) => cl.section === s && cl.text.trim() !== '');
    let ok = present;
    let message = present ? `${SECTION_LABELS[s]} is present.` : `${SECTION_LABELS[s]} is missing from the draft.`;
    if (present && s === 'one_page_summary') {
      const first = claims.find((cl) => cl.text.trim() !== '');
      if (first?.section !== 'one_page_summary') {
        ok = false;
        message = 'One page summary is present but not at the front of the report.';
      }
    }
    return { rule: 'SEC-001', outcome: ok ? 'pass' : 'fail', message, evidence: [s] } as RuleResult;
  });
}

export function evidenceStrength(claim: Claim, c: AdviceCase): EvidenceStrength {
  const ids = claim.evidence.filter((e) => evidenceExists(c, e));
  if (ids.length === 0) return 'none';
  const lines = ids.map((e) => line(c, e)).filter(Boolean);
  if (claim.quote) {
    const q = normaliseQuote(claim.quote);
    const direct = lines.some((l) => l!.speaker !== 'Adviser' && normaliseQuote(l!.text).includes(q));
    if (direct) return 'direct';
  }
  const clientLines = lines.filter((l) => l!.speaker !== 'Adviser').length;
  const fields = ids.filter((e) => e.startsWith('ff.')).length;
  if (clientLines >= 1 || fields >= 1) return 'inferred';
  return 'weak';
}
