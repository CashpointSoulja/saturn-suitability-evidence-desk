import { DEFECT_TYPES, type DefectType } from './types';
import { evaluateCase, predictDefects } from './checker';
import type { GoldenCase } from '../data/golden';

export interface TypeRow { type: DefectType; tp: number; fp: number; fn: number; tn: number; recall: number | null; precision: number | null }

export interface EvalReport {
  cases: number;
  defectiveCases: number;
  cleanCases: number;
  seededDefects: number;
  decisions: number;
  tp: number; fp: number; fn: number; tn: number;
  defectRecall: number;
  falsePositiveRate: number;
  unsupported: { seeded: number; caught: number; rate: number };
  vulnerability: { seededLines: number; caughtLines: number; recall: number; flags: number; trueFlags: number; precision: number };
  perType: TypeRow[];
  perCase: { id: string; description: string; expected: DefectType[]; predicted: DefectType[]; correct: boolean }[];
}

const ratio = (a: number, b: number) => (b === 0 ? 0 : a / b);

export function runEval(golden: GoldenCase[]): EvalReport {
  const perType: TypeRow[] = DEFECT_TYPES.map((type) => ({ type, tp: 0, fp: 0, fn: 0, tn: 0, recall: null, precision: null }));
  let seededUnsupported = 0, caughtUnsupported = 0, seededLines = 0, caughtLines = 0, flags = 0, trueFlags = 0;
  const perCase: EvalReport['perCase'] = [];

  for (const g of golden) {
    const ev = evaluateCase(g.case);
    const predicted = predictDefects(ev);
    const expected = new Set(g.expected);
    for (const row of perType) {
      const e = expected.has(row.type), p = predicted.has(row.type);
      if (e && p) row.tp++; else if (!e && p) row.fp++; else if (e && !p) row.fn++; else row.tn++;
    }
    for (const id of g.seededUnsupportedClaimIds) {
      seededUnsupported++;
      if (ev.claims.find((c) => c.claim.id === id)?.status === 'unsupported') caughtUnsupported++;
    }
    const flaggedLines = new Set(ev.signals.map((s) => s.signal.lineId));
    const missedInDraft = new Set(ev.signals.filter((s) => !s.cited).map((s) => s.signal.lineId));
    for (const l of g.seededSignalLines) { seededLines++; if (flaggedLines.has(l)) caughtLines++; }
    if (g.id === 'G10') for (const l of g.trueSignalLines) { seededLines++; if (missedInDraft.has(l)) caughtLines++; }
    for (const s of ev.signals) { flags++; if (g.trueSignalLines.includes(s.signal.lineId)) trueFlags++; }
    const exp = [...expected].sort(), pred = [...predicted].sort();
    perCase.push({ id: g.id, description: g.description, expected: exp, predicted: pred, correct: exp.join() === pred.join() });
  }
  for (const r of perType) {
    r.recall = r.tp + r.fn ? r.tp / (r.tp + r.fn) : null;
    r.precision = r.tp + r.fp ? r.tp / (r.tp + r.fp) : null;
  }
  const sum = (k: 'tp' | 'fp' | 'fn' | 'tn') => perType.reduce((s, r) => s + r[k], 0);
  const tp = sum('tp'), fp = sum('fp'), fn = sum('fn'), tn = sum('tn');
  return {
    cases: golden.length,
    defectiveCases: golden.filter((g) => g.expected.length).length,
    cleanCases: golden.filter((g) => !g.expected.length).length,
    seededDefects: golden.reduce((s, g) => s + g.expected.length, 0),
    decisions: tp + fp + fn + tn,
    tp, fp, fn, tn,
    defectRecall: ratio(tp, tp + fn),
    falsePositiveRate: ratio(fp, fp + tn),
    unsupported: { seeded: seededUnsupported, caught: caughtUnsupported, rate: ratio(caughtUnsupported, seededUnsupported) },
    vulnerability: { seededLines, caughtLines, recall: ratio(caughtLines, seededLines), flags, trueFlags, precision: ratio(trueFlags, flags) },
    perType,
    perCase,
  };
}
