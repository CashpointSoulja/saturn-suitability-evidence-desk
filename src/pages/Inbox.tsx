import { INBOX } from '../data/inbox';
import { useStore } from '../state';
import { approvalGate, evaluateCase } from '../engine/checker';
import { formatDate } from '../engine/parse';
import { Eyebrow, Pill } from '../ui/bits';

export function useReadiness(ref: string) {
  const { get, state } = useStore();
  const cs = get(ref);
  const item = INBOX.find((i) => i.ref === ref)!;
  const ev = evaluateCase(item.case, { claims: cs.claims, atrWindowMonths: state.atrWindow, signalStates: cs.signals });
  const gate = approvalGate({ evaluation: ev, agreedClaimIds: new Set(cs.agreed), signalStates: cs.signals, adviserName: 'x', attested: true });
  return { cs, ev, gate };
}

function Row({ ref_ }: { ref_: string }) {
  const item = INBOX.find((i) => i.ref === ref_)!;
  const { cs, ev, gate } = useReadiness(ref_);
  const c = item.case;
  let pill;
  if (cs.status === 'approved') pill = <Pill tone="pass">Approved</Pill>;
  else if (cs.status === 'sent_back') pill = <Pill tone="neutral">Sent back</Pill>;
  else if (ev.blockers.length) pill = <Pill tone="fail">Blocked</Pill>;
  else if (gate.length) pill = <Pill tone="review">Needs judgement</Pill>;
  else pill = <Pill tone="pass">Ready for sign-off</Pill>;
  const open = () => { window.location.hash = `#/case/${ref_}`; };
  return (
    <tr className="rowlink" onClick={open} onKeyDown={(e) => e.key === 'Enter' && open()} tabIndex={0}>
      <td className="mono" style={{ whiteSpace: "nowrap" }}>{item.ref}</td>
      <td><a href={`#/case/${ref_}`} onClick={(e) => e.stopPropagation()}>{c.client}</a><div className="small muted">{item.mix}</div></td>
      <td>{c.adviceLabel}</td>
      <td className="small">{formatDate(c.meetingDate)}</td>
      <td className="small">{c.adviser}<div className="muted">{c.paraplanner}</div></td>
      <td>
        <div className="readiness">
          {pill}
          <div className="blockers">{ev.blockers.length ? ev.blockers.join('; ') : `${ev.counts.verified} verified, ${ev.counts.judgement} need judgement`}</div>
        </div>
      </td>
    </tr>
  );
}

export function Inbox() {
  const { resetAll } = useStore();
  return (
    <section className="page">
      <div className="page-head">
        <Eyebrow>Suitability Evidence Desk</Eyebrow>
        <h1 className="display">Every sentence, traced<br />to its evidence.</h1>
        <p className="lede">Review a drafted suitability report against the meeting transcript and fact-find. Figures, dates and arithmetic are checked by code. Reasons, objectives and vulnerability are shown with their evidence and left to adviser judgement.</p>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <p className="eyebrow" style={{ margin: 0 }}>Case inbox · 6 synthetic cases</p>
        <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm('Restore every case to its original synthetic draft and clear the audit trail?')) resetAll(); }}>Reset demo data</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Ref</th><th>Client (synthetic)</th><th>Advice</th><th>Meeting</th><th>Adviser · paraplanner</th><th>Readiness</th></tr></thead>
          <tbody>{INBOX.map((i) => <Row key={i.ref} ref_={i.ref} />)}</tbody>
        </table>
      </div>
      <div className="grid g3 section">
        <div><Eyebrow>Deterministic</Eyebrow><p className="h3">Verified by code</p><p className="small muted" style={{ marginTop: 8 }}>Money, percentages, dates, ages, charges arithmetic, ISA allowance, risk profile age and required sections. Each shows its rule id and pass or fail.</p></div>
        <div><Eyebrow>Probabilistic</Eyebrow><p className="h3">Adviser judgement required</p><p className="small muted" style={{ marginTop: 8 }}>Reasons for the recommendation, objectives, tone and vulnerability. Shown with evidence strength: Direct quote, Inferred or Weak. No confidence scores.</p></div>
        <div><Eyebrow>Sign-off</Eyebrow><p className="h3">Nothing leaves without an adviser</p><p className="small muted" style={{ marginTop: 8 }}>Unsupported sentences, failed checks and unhandled vulnerability signals block approval. Every action lands in an exportable audit trail.</p></div>
      </div>
    </section>
  );
}
