import { RULES } from '../engine/rules';
import { COBS_ITEMS } from '../engine/cobs';
import { DRIVER_DEFINITIONS, DRIVER_LABELS } from '../engine/vulnerability';
import { Eyebrow, Pill } from '../ui/bits';

const SOURCES = [
  ['Saturn home', 'https://www.saturnos.com/'],
  ['Saturn security', 'https://www.saturnos.com/security'],
  ['Saturn customers', 'https://www.saturnos.com/customer'],
  ['Saturn about us', 'https://www.saturnos.com/about-us'],
  ['Saturn journal', 'https://www.saturnos.com/journal'],
  ['Saturn Series A post', 'https://www.saturnos.com/journal/saturn-15m-series-a-to-make-quality-financial-advice-accessible'],
  ['Saturn Meeting Notes 2.0', 'https://www.saturnos.com/meeting-notes-2.0'],
  ['FCA Handbook COBS 9.4', 'https://handbook.fca.org.uk/handbook/cobs9/cobs9s4'],
  ['FCA Handbook COBS 9A', 'https://handbook.fca.org.uk/handbook/cobs9a'],
  ['FCA FG21/1 vulnerable customers', 'https://www.fca.org.uk/publications/finalised-guidance/guidance-firms-fair-treatment-vulnerable-customers'],
  ['FCA ongoing financial advice services review', 'https://www.fca.org.uk/publications/multi-firm-reviews/ongoing-financial-advice-services'],
  ['GOV.UK pension tax relief', 'https://www.gov.uk/tax-on-your-private-pension/pension-tax-relief'],
  ['GOV.UK Individual Savings Accounts', 'https://www.gov.uk/individual-savings-accounts'],
];

export function Rules() {
  return (
    <section className="page">
      <div className="page-head">
        <Eyebrow>Rules and sources</Eyebrow>
        <h1 className="display">Every rule the checker runs.</h1>
        <p className="lede">Deterministic rules are plain TypeScript with unit tests. The content checklist quotes FCA Handbook wording and links to it. Illustrative checks, not compliance advice.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Rule</th><th>Family</th><th>Title</th><th>Logic</th></tr></thead>
          <tbody>{RULES.map((r) => <tr key={r.id}><td className="mono">{r.id}</td><td><Pill>{r.family}</Pill></td><td style={{ minWidth: 180 }}>{r.title}</td><td className="small" style={{ minWidth: 280 }}>{r.logic}{r.source ? <span className="muted"> Source: {r.source}.</span> : null}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="section">
        <h2 className="h2">Required-content checklist</h2>
        <p className="muted small" style={{ marginBottom: 16 }}>Built only from text read in the live FCA Handbook. COBS 9A items apply to the ISA cases, COBS 9.4 items to the pension cases; pension transfer items apply only to the transfer case.</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Reference</th><th>Handbook wording</th><th>What the checker looks for</th></tr></thead>
            <tbody>{COBS_ITEMS.map((i) => <tr key={i.id}><td className="mono" style={{ minWidth: 160 }}><a href={i.url} target="_blank" rel="noreferrer">{i.ref}</a></td><td style={{ fontFamily: 'var(--serif)', fontSize: 16, minWidth: 300 }}>“{i.wording}”</td><td className="small" style={{ minWidth: 200 }}>{i.plain}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <div className="section">
        <h2 className="h2">Vulnerability taxonomy</h2>
        <div className="grid g4" style={{ marginTop: 16 }}>
          {(Object.keys(DRIVER_LABELS) as (keyof typeof DRIVER_LABELS)[]).map((d) => <div key={d}><Eyebrow>Driver</Eyebrow><p className="h3">{DRIVER_LABELS[d]}</p><p className="small muted" style={{ marginTop: 8 }}>{DRIVER_DEFINITIONS[d]}</p></div>)}
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>Definitions from FCA FG21/1, Guidance for firms on the fair treatment of vulnerable customers.</p>
      </div>
      <div className="section">
        <h2 className="h2">Source ledger</h2>
        <p className="muted small" style={{ marginBottom: 16 }}>Full ledger with the facts taken from each page is in SOURCE_LEDGER.md in the repository. Saturn’s own pages give different firm counts (500+ and 600); this concept asserts neither.</p>
        <div className="table-wrap"><table><tbody>{SOURCES.map(([n, u]) => <tr key={u}><td>{n}</td><td className="small"><a href={u} target="_blank" rel="noreferrer">{u}</a></td></tr>)}</tbody></table></div>
      </div>
    </section>
  );
}
