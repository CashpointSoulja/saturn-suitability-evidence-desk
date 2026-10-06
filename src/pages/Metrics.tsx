import { METRICS, BETS } from '../data/metrics';
import { Eyebrow, Pill } from '../ui/bits';

export function Metrics() {
  return (
    <section className="page">
      <div className="page-head">
        <Eyebrow>Metrics and bets</Eyebrow>
        <h1 className="display">What a Lead PM would own <br className="br-wide" />for this feature.</h1>
        <p className="lede">One north star, guardrails that stop speed coming at the cost of evidence, and input metrics that explain movement. Targets are hypotheses to test against a measured baseline, not results.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Metric</th><th>Definition</th><th>Formula</th><th>Data source</th><th>Target</th><th>Owner</th></tr></thead>
          <tbody>{METRICS.map((m) => (
            <tr key={m.name}>
              <td style={{ minWidth: 180 }}><strong style={{ fontWeight: 600 }}>{m.name}</strong><div style={{ marginTop: 6 }}><Pill tone={m.role === 'North star' ? 'primary' : m.role === 'Guardrail' ? 'review' : 'neutral'}>{m.role}</Pill></div></td>
              <td className="small" style={{ minWidth: 220 }}>{m.definition}</td>
              <td className="mono" style={{ minWidth: 220 }}>{m.formula}</td>
              <td className="small" style={{ minWidth: 180 }}>{m.source}</td>
              <td className="small" style={{ minWidth: 200 }}>{m.target}</td>
              <td className="small" style={{ minWidth: 120 }}>{m.owner}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="section">
        <h2 className="h2">Bets and how I would test them</h2>
        <div className="grid g3" style={{ marginTop: 24 }}>
          {BETS.map((b) => (
            <div key={b.bet}>
              <Eyebrow>Bet</Eyebrow>
              <p className="h3" style={{ fontSize: 16, lineHeight: '24px' }}>{b.bet}</p>
              <p className="small" style={{ marginTop: 12 }}><strong>Test.</strong> {b.test}</p>
              <p className="small muted" style={{ marginTop: 8 }}><strong>Kill if.</strong> {b.kill}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
