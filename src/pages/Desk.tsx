import { useEffect, useMemo, useRef, useState } from 'react';
import { INBOX_BY_REF } from '../data/inbox';
import { REVIEWER, useStore } from '../state';
import { approvalGate, evaluateCase, type ClaimEvaluation } from '../engine/checker';
import { RULE_BY_ID, SECTION_LABELS, SECTION_ORDER, requiredSections } from '../engine/rules';
import { formatDate } from '../engine/parse';
import { DRIVER_DEFINITIONS, DRIVER_LABELS } from '../engine/vulnerability';
import type { AdviceCase, Claim, EvidenceStrength, SectionId } from '../engine/types';
import { toCSV, toJSON } from '../engine/audit';
import { download, Eyebrow, Pill } from '../ui/bits';

const FG21 = 'https://www.fca.org.uk/publications/finalised-guidance/guidance-firms-fair-treatment-vulnerable-customers';
const STRENGTH: Record<EvidenceStrength, string> = { direct: 'Direct quote', inferred: 'Inferred', weak: 'Weak', none: 'No evidence' };
function reveal(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  const col = el.closest<HTMLElement>('.col');
  if (col && col.scrollHeight > col.clientHeight + 1 && getComputedStyle(col).overflowY === 'auto') {
    const top = el.getBoundingClientRect().top - col.getBoundingClientRect().top + col.scrollTop - col.clientHeight / 3;
    col.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  } else {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

type Tab = 'checks' | 'vulnerability' | 'content' | 'signoff' | 'audit';

function evidenceLabel(c: AdviceCase, id: string) {
  if (id.startsWith('ff.')) {
    const f = c.factFind.find((x) => x.id === id);
    return f ? `FF ${id.slice(3)}` : `FF ${id.slice(3)} ?`;
  }
  const l = c.transcript.find((x) => x.id === id);
  return l ? `T ${l.t}` : `${id} ?`;
}

function fmtValue(v: string | number, unit: string) {
  if (unit === 'GBP') return `£${Number(v).toLocaleString('en-GB', { minimumFractionDigits: Number.isInteger(Number(v)) ? 0 : 2 })}`;
  if (unit === 'pct') return `${v}%`;
  if (unit === 'date') return formatDate(String(v));
  return String(v);
}

function statusPill(e: ClaimEvaluation, agreed: boolean) {
  if (e.status === 'unsupported') return <Pill tone="fail">Unsupported</Pill>;
  if (e.status === 'failed') return <Pill tone="fail">Check failed</Pill>;
  if (e.status === 'verified') return <Pill tone="pass">Verified</Pill>;
  if (e.claim.origin === 'adviser') return <Pill tone="pass">Adviser written</Pill>;
  return agreed ? <Pill tone="pass">Judgement agreed</Pill> : <Pill tone="review">Adviser judgement</Pill>;
}

export function Desk({ refId }: { refId: string }) {
  const store = useStore();
  const item = INBOX_BY_REF[refId];
  const c = item.case;
  const cs = store.get(refId);
  const [sel, setSel] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('checks');
  const [mcol, setMcol] = useState<'t' | 'd' | 'r'>('d');
  const [adviser, setAdviser] = useState(c.adviser);
  const [attested, setAttested] = useState(false);
  const [sendReason, setSendReason] = useState('');
  const focusText = useRef<string>('');

  const ev = useMemo(() => evaluateCase(c, { claims: cs.claims, atrWindowMonths: store.state.atrWindow, signalStates: cs.signals }), [c, cs.claims, cs.signals, store.state.atrWindow]);
  const agreed = new Set(cs.agreed);
  const gate = approvalGate({ evaluation: ev, agreedClaimIds: agreed, signalStates: cs.signals, adviserName: adviser, attested });
  const selEval = ev.claims.find((e) => e.claim.id === sel) ?? null;
  const selClaim = cs.claims.find((x) => x.id === sel) ?? null;
  const hl = new Set(selClaim?.evidence ?? []);
  const signalLines = new Map(ev.signals.map((s) => [s.signal.lineId, s.signal]));

  useEffect(() => {
    if (!selClaim) return;
    const first = selClaim.evidence[0];
    if (first) reveal(`#src-${CSS.escape(first)}`);
  }, [sel]); // eslint-disable-line react-hooks/exhaustive-deps

  const select = (id: string) => { setSel(id); setTab('checks'); };
  const showSource = (id: string, claimId: string) => {
    setSel(claimId);
    setMcol('t');
    setTimeout(() => reveal(`#src-${CSS.escape(id)}`), 30);
  };

  const commitEdit = (cl: Claim) => {
    if (focusText.current === cl.text) return;
    const e = evaluateCase(c, { claims: cs.claims, atrWindowMonths: store.state.atrWindow, signalStates: cs.signals }).claims.find((x) => x.claim.id === cl.id);
    const failed = e?.results.filter((r) => r.outcome === 'fail') ?? [];
    store.log({ caseId: refId, action: 'sentence_edited', claimId: cl.id, rule: failed.map((r) => r.rule).join(' ') || undefined, evidence: cl.evidence, detail: `"${focusText.current}" → "${cl.text}". ${failed.length ? 'Now failing: ' + failed.map((r) => r.message).join(' ') : 'All checks pass.'}` });
    focusText.current = cl.text;
  };

  // group claims by section in draft order, include required but empty sections
  const sections: SectionId[] = [];
  for (const cl of cs.claims) if (!sections.includes(cl.section)) sections.push(cl.section);
  for (const s of requiredSections(c)) if (!sections.includes(s)) sections.splice(SECTION_ORDER.indexOf(s), 0, s);

  const unhandledSignals = ev.signals.filter((s) => !s.handled).length;
  const cobsMissing = ev.cobs.filter((r) => r.status === 'missing').length;

  return (
    <>
      <div className="banner">
        <span>Independent concept by Ayo Ahmed. Not affiliated with Saturn. Synthetic client data.</span>
        <a href="#/" className="small">← All cases</a>
      </div>
      <div className="desk-head">
        <div>
          <Eyebrow>{item.ref} · {c.adviceLabel} · draft suitability report</Eyebrow>
          <h1 className="h2">{c.client}</h1>
          <div className="desk-meta">
            <span>Meeting {formatDate(c.meetingDate)}</span><span>Adviser {c.adviser}</span><span>Paraplanner {c.paraplanner}</span><span>{c.firm}</span>
          </div>
        </div>
        <div className="desk-actions">
          {cs.status === 'approved' ? <Pill tone="pass">Approved by {cs.decision?.by}</Pill> : cs.status === 'sent_back' ? <Pill tone="neutral">Sent back</Pill> : ev.blockers.length ? <Pill tone="fail">Blocked · {ev.blockers.length}</Pill> : gate.length ? <Pill tone="review">Needs judgement</Pill> : <Pill tone="pass">Ready for sign-off</Pill>}
          <button className="btn btn-outline btn-sm" onClick={() => { if (confirm('Restore the original synthetic draft for this case?')) { store.resetCase(refId); setSel(null); } }}>Reset case</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setTab('signoff'); setMcol('r'); }}>Review and sign off</button>
        </div>
      </div>
      <div className="coltabs" role="tablist">
        <button className={mcol === 't' ? 'on' : ''} onClick={() => setMcol('t')}>Transcript</button>
        <button className={mcol === 'd' ? 'on' : ''} onClick={() => setMcol('d')}>Draft</button>
        <button className={mcol === 'r' ? 'on' : ''} onClick={() => setMcol('r')}>Checks {ev.blockers.length ? <span className="count">{ev.blockers.length}</span> : null}</button>
      </div>
      <div className="desk">
        {/* Transcript and fact-find */}
        <section className={`col ${mcol === 't' ? 'show' : ''}`} aria-label="Evidence sources">
          <div className="col-head"><p className="eyebrow">Meeting transcript</p><span className="mono muted">{c.transcript.length} lines</span></div>
          <div className="col-body">
            {c.transcript.map((l) => {
              const s = signalLines.get(l.id);
              let txt: React.ReactNode = l.text;
              if (s) {
                const i = l.text.toLowerCase().indexOf(s.cue.toLowerCase());
                if (i >= 0) txt = <>{l.text.slice(0, i)}<mark title={`Possible ${DRIVER_LABELS[s.driver].toLowerCase()} signal`}>{l.text.slice(i, i + s.cue.length)}</mark>{l.text.slice(i + s.cue.length)}</>;
              }
              return (
                <div key={l.id} id={`src-${l.id}`} className={`tline ${hl.has(l.id) ? 'hl' : ''} ${s ? 'sig' : ''}`}>
                  <span className="ts">{l.t}</span>
                  <div><div className={`who ${l.speaker !== 'Adviser' ? 'client' : ''}`}>{l.speaker === 'Adviser' ? `Adviser · ${c.adviser}` : `Client · ${c.client}`}</div><div className="txt">{txt}</div></div>
                </div>
              );
            })}
            <div className="subhead"><p className="eyebrow">Fact-find (synthetic)</p></div>
            <div className="ff">
              {c.factFind.map((f) => (
                <div key={f.id} id={`src-${f.id}`} className={`ff-row ${hl.has(f.id) ? 'hl' : ''}`}>
                  <span>{f.label}<div className="mono muted">{f.id}</div></span>
                  <span className="v">{fmtValue(f.value, f.unit)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Draft */}
        <section className={`col ${mcol === 'd' ? 'show' : ''}`} aria-label="Drafted suitability report">
          <div className="col-head"><p className="eyebrow">Drafted suitability report</p><span className="mono muted">click a sentence to check or edit</span></div>
          <div className="report">
            {sections.map((s) => {
              const items = cs.claims.filter((x) => x.section === s);
              const live = items.filter((x) => x.text.trim() !== '');
              return (
                <div key={s}>
                  <h3>{SECTION_LABELS[s]}</h3>
                  {live.length === 0 && requiredSections(c).includes(s) && <div className="empty-section">Required section missing (SEC-001). Add content before approval.</div>}
                  {items.map((cl) => {
                    const e = ev.claims.find((x) => x.claim.id === cl.id);
                    const isSel = sel === cl.id;
                    return (
                      <div key={cl.id} className={`claim st-${e?.status ?? 'empty'} ${isSel ? 'sel' : ''}`} onClick={() => !isSel && select(cl.id)} data-claim={cl.id}>
                        {isSel ? (
                          <textarea
                            aria-label="Edit sentence"
                            value={cl.text}
                            rows={Math.max(2, Math.ceil(cl.text.length / 60))}
                            autoFocus
                            onFocus={() => { focusText.current = cl.text; }}
                            onChange={(ev2) => store.setText(refId, cl.id, ev2.target.value)}
                            onBlur={() => commitEdit(cl)}
                          />
                        ) : (
                          <p className="ctext">{cl.text || <span className="muted">(empty sentence)</span>}</p>
                        )}
                        {e && (
                          <div className="claim-meta">
                            <span className={`tag ${cl.kind === 'probabilistic' ? 'tag-prob' : ''}`}>{cl.kind}</span>
                            {statusPill(e, agreed.has(cl.id))}
                            {cl.evidence.length === 0 && <span className="claim-adviser">no evidence linked</span>}
                            {cl.evidence.map((id) => (
                              <button key={id} className={`chip ${isSel ? 'on' : ''} ${evidenceLabel(c, id).endsWith('?') ? 'broken' : ''}`} onClick={(x) => { x.stopPropagation(); showSource(id, cl.id); }} title="Show source">{evidenceLabel(c, id)}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>

        {/* Rail */}
        <section className={`col ${mcol === 'r' ? 'show' : ''}`} aria-label="Evidence and checks">
          <div className="rtabs" role="tablist">
            <button className={tab === 'checks' ? 'on' : ''} onClick={() => setTab('checks')}>Checks <span className={`count ${ev.counts.unsupported + ev.counts.failed ? '' : 'ok'}`}>{ev.counts.unsupported + ev.counts.failed}</span></button>
            <button className={tab === 'vulnerability' ? 'on' : ''} onClick={() => setTab('vulnerability')}>Vulnerability <span className={`count ${unhandledSignals ? '' : 'ok'}`}>{ev.signals.length}</span></button>
            <button className={tab === 'content' ? 'on' : ''} onClick={() => setTab('content')}>Content <span className={`count ${cobsMissing ? '' : 'ok'}`}>{cobsMissing}</span></button>
            <button className={tab === 'signoff' ? 'on' : ''} onClick={() => setTab('signoff')}>Sign-off</button>
            <button className={tab === 'audit' ? 'on' : ''} onClick={() => setTab('audit')}>Audit</button>
          </div>

          {tab === 'checks' && (
            <div className="rpanel">
              {selEval ? <ClaimPanel e={selEval} c={c} agreed={agreed.has(selEval.claim.id)} onAgree={() => store.agree(refId, selEval.claim.id, selEval.claim.evidence)} onSource={(id) => showSource(id, selEval.claim.id)} /> : <div className="notice">Select a sentence in the draft to see its evidence and the rules run against it.</div>}
              <div className="card">
                <div className="card-title"><span className="h3" style={{ fontSize: 15 }}>Case checks</span><span className="tag">deterministic</span></div>
                <Result rule="RISK-001" outcome={ev.risk.outcome} msg={ev.risk.message} />
                <div className="row small">
                  <label htmlFor="win" className="muted">Firm review window (synthetic policy)</label>
                  <select id="win" value={store.state.atrWindow} onChange={(x) => store.setAtrWindow(Number(x.target.value))} style={{ font: 'inherit', padding: '2px 4px' }}>
                    {[6, 12, 18, 24].map((n) => <option key={n} value={n}>{n} months</option>)}
                  </select>
                </div>
                {ev.sections.filter((s) => s.outcome === 'fail').map((s, i) => <Result key={i} rule="SEC-001" outcome="fail" msg={s.message} />)}
                {ev.sections.every((s) => s.outcome === 'pass') && <Result rule="SEC-001" outcome="pass" msg={`All ${ev.sections.length} required sections present${c.pensionTransfer ? ', one page summary first' : ''}.`} />}
                <Result rule="VUL-001" outcome={ev.vulnerability.outcome} msg={ev.vulnerability.message} />
              </div>
              <div className="card">
                <div className="card-title"><span className="h3" style={{ fontSize: 15 }}>Sentences</span></div>
                <div className="small">{ev.counts.verified} verified by code · {ev.counts.judgement} need adviser judgement · <span style={{ color: ev.counts.failed ? 'var(--fail)' : undefined }}>{ev.counts.failed} failed</span> · <span style={{ color: ev.counts.unsupported ? 'var(--fail)' : undefined }}>{ev.counts.unsupported} unsupported</span></div>
                {ev.claims.filter((x) => x.status === 'unsupported' || x.status === 'failed').map((x) => (
                  <button key={x.claim.id} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start', whiteSpace: 'normal', height: 'auto', padding: '6px 10px', textAlign: 'left' }} onClick={() => { select(x.claim.id); setMcol('d'); setTimeout(() => reveal(`[data-claim="${x.claim.id}"]`), 30); }}>
                    <Pill tone="fail">{x.status === 'unsupported' ? 'Unsupported' : 'Failed'}</Pill> <span className="small">{x.claim.text.slice(0, 70)}…</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'vulnerability' && (
            <div className="rpanel">
              <div className="notice small">Transcript scan for possible signals against the FCA’s four drivers of vulnerability (<a href={FG21} target="_blank" rel="noreferrer">FG21/1</a>). A keyword scan finds candidates; the adviser decides. Confirming writes the client’s words into the report’s support needs section.</div>
              {ev.signals.length === 0 && <div className="card small">No candidate signals found in this transcript. The scan only finds known phrasing, so the adviser should still consider vulnerability from the whole meeting.</div>}
              {ev.signals.map((s) => <SignalCard key={s.signal.id} s={s} c={c} onDecide={(d, r) => store.decide(refId, s.signal, d, r)} onSource={() => { setSel(null); setMcol('t'); setTimeout(() => reveal(`#src-${CSS.escape(s.signal.lineId)}`), 30); }} />)}
              <div className="card legend">
                <Eyebrow>FCA drivers of vulnerability (FG21/1)</Eyebrow>
                {(Object.keys(DRIVER_LABELS) as (keyof typeof DRIVER_LABELS)[]).map((d) => <div key={d}><strong style={{ color: 'var(--ink)' }}>{DRIVER_LABELS[d]}</strong>: {DRIVER_DEFINITIONS[d]}</div>)}
              </div>
            </div>
          )}

          {tab === 'content' && (
            <div className="rpanel">
              <div className="notice small"><strong>Illustrative checks, not compliance advice.</strong> Each item quotes the FCA Handbook wording it is built from. A “met” item means the draft has a sentence tagged to that topic, not that the wording is adequate.</div>
              {ev.cobs.filter((r) => r.status !== 'not_applicable').map((r) => (
                <div className="card" key={r.item.id}>
                  <div className="card-title"><a className="mono" href={r.item.url} target="_blank" rel="noreferrer">{r.item.ref}</a><Pill tone={r.status === 'met' ? 'pass' : 'fail'}>{r.status === 'met' ? 'Met' : 'Missing'}</Pill></div>
                  <p className="quote">“{r.item.wording}”</p>
                  <p className="small muted">{r.item.plain}</p>
                  {r.claimIds.length > 0 && <div className="row">{r.claimIds.map((id) => <button key={id} className="chip" onClick={() => { select(id); setMcol('d'); }}>{id}</button>)}</div>}
                </div>
              ))}
              <p className="small muted">{ev.cobs.filter((r) => r.status === 'not_applicable').length} items not applicable to this advice type ({c.regime === 'COBS9' ? 'COBS 9 regime' : 'COBS 9A regime'}{c.pensionTransfer ? ', pension transfer' : ''}).</p>
            </div>
          )}

          {tab === 'signoff' && (
            <div className="rpanel">
              {cs.status === 'approved' && <div className="card"><Pill tone="pass">Approved</Pill><p className="small">Signed off by {cs.decision?.by} at {new Date(cs.decision!.at).toLocaleString('en-GB')}. In a live system this would release the report for sending. Nothing is sent from this concept.</p></div>}
              {cs.status === 'sent_back' && <div className="card"><Pill tone="neutral">Sent back</Pill><p className="small">Returned to drafting by {cs.decision?.by}: “{cs.decision?.reason}”</p></div>}
              <div className="card">
                <div className="card-title"><span className="h3" style={{ fontSize: 15 }}>Adviser sign-off</span></div>
                <label className="field">Adviser name<input value={adviser} onChange={(x) => setAdviser(x.target.value)} /></label>
                <label className="check"><input type="checkbox" checked={attested} onChange={(x) => setAttested(x.target.checked)} />I have reviewed every sentence against its evidence, I agree with the recommendation, and I take responsibility for this advice.</label>
                {gate.length > 0 && <><p className="small" style={{ fontWeight: 500 }}>Approval blocked:</p><ul className="reasons">{gate.map((g) => <li key={g}>{g}</li>)}</ul></>}
                <button className="btn btn-primary" disabled={gate.length > 0} onClick={() => store.approve(refId, adviser.trim())}>Approve report</button>
              </div>
              <div className="card">
                <div className="card-title"><span className="h3" style={{ fontSize: 15 }}>Send back to drafting</span></div>
                <label className="field">Reason (required)<textarea rows={3} value={sendReason} onChange={(x) => setSendReason(x.target.value)} placeholder="e.g. Risk profile is 20 months old; reassess before re-drafting." /></label>
                <button className="btn btn-secondary" disabled={!sendReason.trim()} onClick={() => { store.sendBack(refId, sendReason.trim()); setSendReason(''); }}>Send back</button>
              </div>
              <p className="small muted">Reviewer on this desk: {REVIEWER.name}, {REVIEWER.role}.</p>
            </div>
          )}

          {tab === 'audit' && <AuditPanel refId={refId} />}
        </section>
      </div>
    </>
  );
}

function Result({ rule, outcome, msg }: { rule: string; outcome: string; msg: string }) {
  return (
    <div className="result">
      <Pill tone={outcome === 'pass' ? 'pass' : outcome === 'fail' ? 'fail' : 'neutral'}>{outcome === 'pass' ? 'Pass' : outcome === 'fail' ? 'Fail' : 'N/A'}</Pill>
      <div><span className="rid">{rule}</span> <span className="rtitle">{RULE_BY_ID[rule]?.title}</span></div>
      <div className="rmsg">{msg}</div>
    </div>
  );
}

function ClaimPanel({ e, c, agreed, onAgree, onSource }: { e: ClaimEvaluation; c: AdviceCase; agreed: boolean; onAgree: () => void; onSource: (id: string) => void }) {
  const cl = e.claim;
  return (
    <div className="card">
      <div className="card-title">
        <span className={`tag ${cl.kind === 'probabilistic' ? 'tag-prob' : ''}`}>{cl.kind}</span>
        {statusPill(e, agreed)}
      </div>
      <p className="small">{cl.text}</p>
      <div className="row">{cl.evidence.map((id) => <button key={id} className="chip on" onClick={() => onSource(id)}>{evidenceLabel(c, id)}</button>)}</div>
      {e.results.map((r, i) => <Result key={i} rule={r.rule} outcome={r.outcome} msg={r.message} />)}
      {cl.kind === 'probabilistic' && (
        <div className="judge">
          <div className="row" style={{ justifyContent: 'space-between' }}><span><strong>Evidence strength:</strong> {STRENGTH[e.strength]}</span><Pill tone="primary">{cl.judgement ?? 'judgement'}</Pill></div>
          {cl.quote && <p className="quote">“{cl.quote}”</p>}
          <p>Code cannot verify {cl.judgement === 'reasons' ? 'whether these reasons justify the recommendation' : cl.judgement === 'objectives' ? 'that this summary reflects what the client wants' : cl.judgement === 'vulnerability' ? 'a reading of vulnerability' : 'this reading of the client'}. Adviser judgement required.</p>
          {e.status === 'judgement' && cl.origin !== 'adviser' && (agreed ? <span className="small">Agreed by reviewer.</span> : <button className="btn btn-outline btn-sm" onClick={onAgree}>I agree this is supported</button>)}
        </div>
      )}
    </div>
  );
}

function SignalCard({ s, c, onDecide, onSource }: { s: ReturnType<typeof evaluateCase>['signals'][number]; c: AdviceCase; onDecide: (d: 'confirmed' | 'dismissed' | 'escalated', r?: string) => void; onSource: () => void }) {
  const [dismissing, setDismissing] = useState(false);
  const [reason, setReason] = useState('');
  const line = c.transcript.find((l) => l.id === s.signal.lineId)!;
  const st = s.state?.decision;
  return (
    <div className={`card sig-card ${st ? 'decided' : ''}`}>
      <div className="card-title">
        <Pill tone="review">{DRIVER_LABELS[s.signal.driver]}</Pill>
        {st === 'confirmed' ? <Pill tone="pass">Confirmed · in report</Pill> : st === 'dismissed' ? <Pill tone="neutral">Dismissed</Pill> : st === 'escalated' ? <Pill tone="fail">Escalated · blocks approval</Pill> : s.cited ? <Pill tone="pass">Cited in report</Pill> : <Pill tone="fail">Not in report</Pill>}
      </div>
      <p className="quote">“{s.signal.quote}”</p>
      <div className="row"><button className="chip" onClick={onSource}>T {line.t}</button><span className="mono muted">cue: “{s.signal.cue}”</span></div>
      {s.state?.reason && <p className="small muted">Reason: {s.state.reason}</p>}
      {!dismissing && (
        <div className="row">
          <button className="btn btn-primary btn-sm" disabled={st === 'confirmed'} onClick={() => onDecide('confirmed')}>Confirm</button>
          <button className="btn btn-secondary btn-sm" disabled={st === 'dismissed'} onClick={() => setDismissing(true)}>Dismiss</button>
          <button className="btn btn-outline btn-sm" disabled={st === 'escalated'} onClick={() => onDecide('escalated', 'Referred to compliance for a decision before approval.')}>Escalate</button>
        </div>
      )}
      {dismissing && (
        <div className="field">
          <label htmlFor={`r-${s.signal.id}`}>Reason for dismissing (required, saved to audit)</label>
          <input id={`r-${s.signal.id}`} value={reason} onChange={(x) => setReason(x.target.value)} placeholder="e.g. About parking, not about the client’s capability" />
          <div className="row"><button className="btn btn-secondary btn-sm" disabled={!reason.trim()} onClick={() => { onDecide('dismissed', reason.trim()); setDismissing(false); }}>Dismiss signal</button><button className="btn btn-ghost btn-sm" onClick={() => setDismissing(false)}>Cancel</button></div>
        </div>
      )}
    </div>
  );
}

function AuditPanel({ refId }: { refId: string }) {
  const { state } = useStore();
  const [all, setAll] = useState(false);
  const rows = state.audit.filter((e) => all || e.caseId === refId).slice().reverse();
  const stamp = new Date().toISOString().slice(0, 10);
  return (
    <div className="rpanel">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <label className="check"><input type="checkbox" checked={all} onChange={(x) => setAll(x.target.checked)} />All cases</label>
        <div className="row">
          <button className="btn btn-outline btn-sm" onClick={() => download(`audit-${stamp}.json`, 'application/json', toJSON(state.audit))}>Export JSON</button>
          <button className="btn btn-outline btn-sm" onClick={() => download(`audit-${stamp}.csv`, 'text/csv', toCSV(state.audit))}>Export CSV</button>
        </div>
      </div>
      <div className="card">
        {rows.length === 0 && <p className="small muted">No actions yet. Edits, judgements, vulnerability decisions and sign-off land here with who, what, when, rule and evidence ids.</p>}
        {rows.map((e) => (
          <div className="audit-row" key={e.seq}>
            <span className="seq">{e.seq}</span>
            <div>
              <div><strong>{e.action.replace(/_/g, ' ')}</strong> · {e.actor} <span className="muted">({e.role})</span></div>
              <div className="mono muted">{new Date(e.at).toLocaleString('en-GB')} · {e.caseId}{e.claimId ? ` · ${e.claimId}` : ''}{e.rule ? ` · ${e.rule}` : ''}{e.evidence.length ? ` · ${e.evidence.join(', ')}` : ''}</div>
              <div className="muted" style={{ marginTop: 2 }}>{e.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
