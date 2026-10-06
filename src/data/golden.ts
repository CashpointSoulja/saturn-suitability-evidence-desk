import type { AdviceCase, Claim, DefectType, SectionId, Speaker } from '../engine/types';
import { formatDate } from '../engine/parse';
import { B1, B2, B3, B4, B5, B6 } from './bases';

export interface GoldenCase {
  id: string;
  base: string;
  description: string;
  expected: DefectType[];
  seededUnsupportedClaimIds: string[];
  seededSignalLines: string[];
  trueSignalLines: string[];
  case: AdviceCase;
}

type Mut = (c: AdviceCase) => void;

const clone = (c: AdviceCase): AdviceCase => JSON.parse(JSON.stringify(c));

const claim = (c: AdviceCase, id: string): Claim => {
  const cl = c.claims.find((x) => x.id === id);
  if (!cl) throw new Error(`claim ${id} not in ${c.id}`);
  return cl;
};

const replaceText = (id: string, from: string, to: string): Mut => (c) => {
  const cl = claim(c, id);
  if (!cl.text.includes(from)) throw new Error(`"${from}" not in ${c.id}/${id}`);
  cl.text = cl.text.replace(from, to);
};

const stripEvidence = (id: string): Mut => (c) => {
  const cl = claim(c, id);
  cl.evidence = [];
  delete cl.quote;
};

const changeQuote = (id: string, quote: string): Mut => (c) => {
  claim(c, id).quote = quote;
};

const addClaim = (afterId: string, cl: Claim): Mut => (c) => {
  const i = c.claims.findIndex((x) => x.id === afterId);
  c.claims.splice(i + 1, 0, cl);
};

const removeSection = (s: SectionId): Mut => (c) => {
  c.claims = c.claims.filter((x) => x.section !== s);
};

const insertLine = (afterId: string, id: string, t: string, speaker: Speaker, text: string): Mut => (c) => {
  const i = c.transcript.findIndex((l) => l.id === afterId);
  c.transcript.splice(i + 1, 0, { id, t, speaker, text });
};

const staleRisk = (iso: string): Mut => (c) => {
  const f = c.factFind.find((x) => x.id === 'ff.atr_date')!;
  const old = formatDate(String(f.value));
  f.value = iso;
  for (const cl of c.claims) if (cl.text.includes(old)) cl.text = cl.text.replace(old, formatDate(iso));
};

const replaceVulnerabilityWithNone: Mut = (c) => {
  const i = c.claims.findIndex((x) => x.section === 'vulnerability');
  c.claims = c.claims.filter((x) => x.section !== 'vulnerability');
  c.claims.splice(i, 0, { id: 'c10', section: 'vulnerability', kind: 'probabilistic', judgement: 'vulnerability', noVulnerabilityStatement: true, text: 'We did not identify any characteristics of vulnerability during this meeting.', evidence: ['T1'] });
};

function make(id: string, base: AdviceCase, description: string, expected: DefectType[], muts: Mut[], extra: Partial<Pick<GoldenCase, 'seededUnsupportedClaimIds' | 'seededSignalLines'>> = {}): GoldenCase {
  const c = clone(base);
  c.id = id;
  muts.forEach((m) => m(c));
  const baseTruth = base.id === 'B3' ? ['T2', 'T4'] : [];
  const seededSignalLines = extra.seededSignalLines ?? [];
  return { id, base: base.id, description, expected, seededUnsupportedClaimIds: extra.seededUnsupportedClaimIds ?? [], seededSignalLines, trueSignalLines: [...baseTruth, ...seededSignalLines], case: c };
}

export const GOLDEN: GoldenCase[] = [
  make('G01', B1, 'SIPP top-up, clean', [], []),
  make('G02', B1, 'Gross contribution digits transposed (£29,735)', ['wrong_figure'], [replaceText('c1', '£29,375', '£29,735')]),
  make('G03', B1, 'Recommendation reasons lose all evidence', ['unsupported_claim'], [stripEvidence('c8')], { seededUnsupportedClaimIds: ['c8'] }),
  make('G04', B1, 'Disadvantages section dropped', ['missing_section'], [removeSection('disadvantages')]),
  make('G05', B2, 'DB transfer enquiry, remain, clean', [], []),
  make('G06', B2, 'Invented claim about relying on spouse’s pension', ['unsupported_claim'], [addClaim('c9', { id: 'c9b', section: 'recommendation', kind: 'probabilistic', judgement: 'reasons', text: 'You also told us you would be comfortable relying on Sue’s pension if your own income fell short.', evidence: [], topics: [] })], { seededUnsupportedClaimIds: ['c9b'] }),
  make('G07', B2, 'Client age contradicted (55 vs 58)', ['contradicted_statement'], [replaceText('c5', 'aged 58', 'aged 55')]),
  make('G08', B2, 'Months-to-pay figure wrong (2 vs 3)', ['wrong_figure'], [replaceText('c2', '3 months', '2 months')]),
  make('G09', B3, 'Bereaved client, vulnerability captured, clean', [], []),
  make('G10', B3, 'Draft says no vulnerability despite bereavement and reliance on daughter', ['missed_vulnerability'], [replaceVulnerabilityWithNone], { seededSignalLines: [] }),
  make('G11', B3, 'Risk profile 19 months old', ['stale_risk_profile'], [staleRisk('2025-02-10')]),
  make('G12', B3, 'Paraphrased "quote" and contradicted term (5 vs 10 years)', ['unsupported_claim', 'contradicted_statement'], [changeQuote('c7', 'I want something safe'), replaceText('c3', '10 years', '5 years')], { seededUnsupportedClaimIds: ['c7'] }),
  make('G13', B4, 'Consolidation, clean (contains a harmless "confused" line)', [], []),
  make('G14', B4, 'Risk profile 20 months old', ['stale_risk_profile'], [staleRisk('2025-01-20')]),
  make('G15', B4, 'Health disclosure phrased outside the keyword list', ['missed_vulnerability'], [insertLine('T5', 'T5a', '02:31', 'Client', 'Things have been hard since the operation in spring. I tire quickly and lose my thread in long meetings.')], { seededSignalLines: ['T5a'] }),
  make('G16', B4, 'Ongoing review section dropped', ['missing_section'], [removeSection('review')]),
  make('G17', B5, 'Initial charge stated as £540, should be £450', ['wrong_figure'], [replaceText('c10', '£450', '£540')]),
  make('G18', B5, 'Low resilience and redundancy disclosed, not captured', ['missed_vulnerability'], [insertLine('T4', 'T4a', '02:10', 'Client', 'Money is tight though. We are living month to month since my husband was made redundant in July.')], { seededSignalLines: ['T4a'] }),
  make('G19', B5, 'Dependants contradicted (three vs two)', ['contradicted_statement'], [replaceText('c4', 'two dependants', 'three dependants')]),
  make('G20', B5, 'Disadvantages sentence loses its evidence', ['unsupported_claim'], [stripEvidence('c9')], { seededUnsupportedClaimIds: ['c9'] }),
  make('G21', B6, 'Regular ISA saving, clean', [], []),
  make('G22', B6, 'Recent diagnosis disclosed, not captured', ['missed_vulnerability'], [insertLine('T6', 'T6a', '03:05', 'Client', 'I was diagnosed with type 1 diabetes last year, so I like having a buffer.')], { seededSignalLines: ['T6a'] }),
  make('G23', B6, 'Stale risk profile and platform fee arithmetic wrong (£45 a year)', ['stale_risk_profile', 'wrong_figure'], [staleRisk('2025-03-01'), replaceText('c10', '£54 a year', '£45 a year')]),
  make('G24', B6, 'Charges section dropped', ['missing_section'], [removeSection('charges')]),
];

export const GOLDEN_BY_ID = Object.fromEntries(GOLDEN.map((g) => [g.id, g]));
