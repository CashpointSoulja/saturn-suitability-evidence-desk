import { useMemo, useState } from 'react';
import { GOLDEN } from '../data/golden';
import { INBOX } from '../data/inbox';
import { runEval, type EvalReport } from '../engine/eval';
import { evaluateCase } from '../engine/checker';
import { DEFAULT_ASSUMPTIONS, estimateMinutes, type ReviewTimeAssumptions } from '../engine/reviewTime';
import { DEFECT_TYPES, type DefectType } from '../engine/types';
import { Eyebrow, Pill, pct } from '../ui/bits';

const SERIES_A = 'https://www.saturnos.com/journal/saturn-15m-series-a-to-make-quality-financial-advice-accessible';
export const DEFECT_LABELS: Record<DefectType, string> = {
  unsupported_claim: 'Unsupported claim',
  wrong_figure: 'Wrong figure',
  missed_vulnerability: 'Missed vulnerability',
  stale_risk_profile: 'Stale risk profile',
  missing_section: 'Missing section',
  contradicted_statement: 'Contradicted statement',
};

const ASSUMPTION_LABELS: Record<keyof ReviewTimeAssumptions, string> = {
  fixedMinutes: 'Fixed read-through (min)',
  minutesPerDeterministicManual: 'Check one figure by hand (min)',
  minutesPerDeterministicVerified: 'Glance at a code-verified figure (min)',
  minutesPerProbabilistic: 'Judge one probabilistic sentence (min)',
  minutesPerFailedCheckFix: 'Fix one failed check (min)',
  minutesPerSignal: 'Decide one vulnerability signal (min)',
};

export function EvalLab() {
  const [report, setReport] = useState<EvalReport>(() => runEval(GOLDEN));
  const [ms, setMs] = useState<number | null>(null);
  const [runs, setRuns] = useState(1);
  const [a, setA] = useState<ReviewTimeAssumptions>(DEFAULT_ASSUMPTIONS);
  const rerun = () => { const t = performance.now(); const r = runEval(GOLDEN); setMs(performance.now() - t); setReport(r); setRuns((n) => n + 1); };

  const load = useMemo(() => {
    const evs = INBOX.map((i) => evaluateCase(i.case));
    const avg = (f: (e: ReturnType<typeof evaluateCase>) => number) => evs.reduce((s, e) => s + f(e), 0) / evs.length;
    return {
      deterministic: avg((e) => e.claims.filter((c) => c.claim.kind === 'deterministic').length),
      probabilistic: avg((e) => e.claims.filter((c) => c.claim.kind === 'probabilistic').length),
      failedChecks: avg((e) => e.counts.failed + e.counts.unsupported),
      signals: avg((e) => e.signals.length),
    };
  }, []);
  const est = estimateMinutes(load, a);
  const r = report;

  return (
    <section className="page">
      <div className="page-head">
        <Eyebrow>Eval lab</Eyebrow>
        <h1 className="display">How often does the checker<br />catch a seeded defect?</h1>
        <p className="lede">A golden set of {r.cases} synthetic cases built from six base reports, {r.defectiveCases} with seeded defects and {r.cleanCases} clean. The checker runs live in your browser. This measures the checker on synthetic fixtures, not real advice files or Saturn’s product.</p>
        <div className="row"><button className="btn btn-primary" onClick={rerun}>Run checker on {r.cases} cases</button><span className="small muted">{ms === null ? 'Ran once on page load.' : `Run ${runs} finished in ${ms.toFixed(1)} ms.`}</span></div>
      </div>

      <div className="grid g5">
        <Stat label="Defect recall" value={pct(r.defectRecall)} sub={`${r.tp} of ${r.tp + r.fn} seeded defects flagged`} />
        <Stat label="False-positive rate" value={pct(r.falsePositiveRate)} sub={`${r.fp} of ${r.fp + r.tn} clean case-type decisions flagged`} />
        <Stat label="Unsupported-claim catch" value={pct(r.unsupported.rate)} sub={`${r.unsupported.caught} of ${r.unsupported.seeded} seeded sentences flagged`} />
        <Stat label="Vulnerability recall" value={pct(r.vulnerability.recall)} sub={`${r.vulnerability.caughtLines} of ${r.vulnerability.seededLines} seeded disclosures found`} />
        <Stat label="Vulnerability flag precision" value={pct(r.vulnerability.precision)} sub={`${r.vulnerability.trueFlags} of ${r.vulnerability.flags} flags on a true disclosure`} />
      </div>

      <div className="section">
        <h2 className="h2">Per defect type</h2>
        <p className="muted small" style={{ marginBottom: 16 }}>Each of the {r.cases} cases is scored on each of the six defect types: {r.decisions} decisions.</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Defect type</th><th className="num">Seeded</th><th className="num">Caught (TP)</th><th className="num">Missed (FN)</th><th className="num">False alarms (FP)</th><th className="num">Recall</th><th className="num">Precision</th></tr></thead>
            <tbody>{r.perType.map((t) => (
              <tr key={t.type}><td>{DEFECT_LABELS[t.type]}</td><td className="num">{t.tp + t.fn}</td><td className="num">{t.tp}</td><td className="num">{t.fn}</td><td className="num">{t.fp}</td><td className="num">{pct(t.recall, 0)}</td><td className="num">{pct(t.precision, 0)}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2 className="h2">Confusion matrix</h2>
        <p className="muted small" style={{ marginBottom: 16 }}>All {r.decisions} case × defect-type decisions.</p>
        <div className="matrix">
          <div className="mh" /><div className="mh">Checker flagged</div><div className="mh">Checker passed</div>
          <div className="mh">Defect seeded</div><div className="mv">{r.tp}</div><div className="mv">{r.fn}</div>
          <div className="mh">No defect</div><div className="mv">{r.fp}</div><div className="mv">{r.tn}</div>
        </div>
      </div>

      <div className="section">
        <h2 className="h2">What it got wrong, and why</h2>
        <div className="prose small" style={{ maxWidth: 760, marginBottom: 16 }}>
          <p>Every false alarm comes from one base case: a client who says he “got a bit confused about which car park to use.” The keyword scan reads that as low capability. The adviser dismisses it with a reason in the vulnerability panel, which is the point of keeping a person on the decision.</p>
          <p>The vulnerability miss is case G15: “Things have been hard since the operation in spring. I tire quickly and lose my thread.” No keyword matches, so the scan finds nothing. G15 still scores as a case-level catch only because the unrelated car park line fires. Counted per disclosure, the miss shows up in vulnerability recall above. A keyword list will always miss phrasing it has not seen; see the V2 roadmap.</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Case</th><th>Seeded defect</th><th>Expected</th><th>Checker found</th><th>Match</th></tr></thead>
            <tbody>{r.perCase.map((p) => (
              <tr key={p.id}><td className="mono">{p.id}</td><td className="small">{p.description}</td><td className="small">{p.expected.map((d) => DEFECT_LABELS[d]).join(', ') || 'none'}</td><td className="small">{p.predicted.map((d) => DEFECT_LABELS[d]).join(', ') || 'none'}</td><td>{p.correct ? <Pill tone="pass">Exact</Pill> : <Pill tone="fail">Differs</Pill>}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2 className="h2">Review-time model</h2>
        <div className="notice" style={{ maxWidth: 760, marginBottom: 24 }}>
          <strong>Saturn’s published claim:</strong> suitability reports that took 4 hours of paraplanner time now take 20 minutes of review (<a href={SERIES_A} target="_blank" rel="noreferrer">Series A post</a>). That is Saturn’s number, not ours. The model below only estimates the review step, and every input is an assumption you can change.
        </div>
        <div className="assump">
          {(Object.keys(ASSUMPTION_LABELS) as (keyof ReviewTimeAssumptions)[]).map((k) => (
            <label className="field" key={k}>{ASSUMPTION_LABELS[k]}<input type="number" step="0.25" min="0" value={a[k]} onChange={(x) => setA({ ...a, [k]: Math.max(0, Number(x.target.value)) })} /></label>
          ))}
        </div>
        <p className="small muted" style={{ margin: '16px 0' }}>Average load per inbox case, counted by the checker: {load.deterministic.toFixed(1)} deterministic sentences, {load.probabilistic.toFixed(1)} probabilistic, {load.failedChecks.toFixed(1)} failed or unsupported, {load.signals.toFixed(1)} vulnerability signals.</p>
        <div className="grid g3">
          <Stat label="Review, figures checked by hand" value={`${est.manual} min`} sub="Modelled, per case" />
          <Stat label="Review with code-verified figures" value={`${est.withDesk} min`} sub="Modelled, per case" />
          <Stat label="Modelled saving" value={`${est.saved} min`} sub="Comes only from deterministic checks; judgement time is unchanged by design" />
        </div>
        <div style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 560 }}>
          <div className="bar"><span style={{ width: `${Math.min(100, (est.manual / Math.max(est.manual, 1)) * 100)}%` }} /></div>
          <div className="bar blue"><span style={{ width: `${Math.min(100, (est.withDesk / Math.max(est.manual, 1)) * 100)}%` }} /></div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="stat"><Eyebrow>{label}</Eyebrow><div className="stat-value">{value}</div><div className="stat-sub">{sub}</div></div>;
}

export { DEFECT_TYPES };
