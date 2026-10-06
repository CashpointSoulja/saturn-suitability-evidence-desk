import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Claim, SignalDecision, VulnerabilitySignal, SignalState } from './engine/types';
import type { AuditEntry } from './engine/audit';
import { applySignalDecision } from './engine/vulnerability';
import { DEFAULT_ATR_WINDOW_MONTHS } from './engine/rules';
import { INBOX, INBOX_BY_REF } from './data/inbox';

export type CaseStatus = 'in_review' | 'approved' | 'sent_back';

export interface CaseState {
  claims: Claim[];
  signals: Record<string, SignalState>;
  agreed: string[];
  status: CaseStatus;
  decision?: { by: string; at: string; reason?: string };
}

interface Persisted {
  v: 1;
  cases: Record<string, CaseState>;
  audit: AuditEntry[];
  atrWindow: number;
}

export const REVIEWER = { name: 'Sam Okafor', role: 'Paraplanner (synthetic)' };
const KEY = 'suitability-evidence-desk.v1';

const fresh = (ref: string): CaseState => ({ claims: JSON.parse(JSON.stringify(INBOX_BY_REF[ref].case.claims)), signals: {}, agreed: [], status: 'in_review' });
const initial = (): Persisted => ({ v: 1, cases: Object.fromEntries(INBOX.map((i) => [i.ref, fresh(i.ref)])), audit: [], atrWindow: DEFAULT_ATR_WINDOW_MONTHS });

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Persisted;
      if (p.v === 1 && INBOX.every((i) => p.cases[i.ref])) return p;
    }
  } catch { /* ignore corrupt storage */ }
  return initial();
}

type LogInput = Omit<AuditEntry, 'seq' | 'at' | 'actor' | 'role'> & { actor?: string; role?: string };

interface Store {
  state: Persisted;
  get: (ref: string) => CaseState;
  setText: (ref: string, claimId: string, text: string) => void;
  log: (e: LogInput) => void;
  agree: (ref: string, claimId: string, evidence: string[]) => void;
  decide: (ref: string, signal: VulnerabilitySignal, decision: SignalDecision, reason?: string) => void;
  approve: (ref: string, adviser: string) => void;
  sendBack: (ref: string, reason: string) => void;
  resetCase: (ref: string) => void;
  resetAll: () => void;
  setAtrWindow: (n: number) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(state)); }, [state]);

  const patchCase = useCallback((ref: string, f: (c: CaseState) => CaseState, entry?: LogInput) => {
    setState((s) => {
      const audit = entry ? [...s.audit, { seq: s.audit.length + 1, at: new Date().toISOString(), actor: entry.actor ?? REVIEWER.name, role: entry.role ?? REVIEWER.role, ...entry }] : s.audit;
      return { ...s, cases: { ...s.cases, [ref]: f(s.cases[ref]) }, audit };
    });
  }, []);

  const store = useMemo<Store>(() => ({
    state,
    get: (ref) => state.cases[ref],
    setText: (ref, claimId, text) => patchCase(ref, (c) => ({ ...c, status: 'in_review', decision: undefined, claims: c.claims.map((cl) => (cl.id === claimId ? { ...cl, text } : cl)) })),
    log: (e) => setState((s) => ({ ...s, audit: [...s.audit, { seq: s.audit.length + 1, at: new Date().toISOString(), actor: e.actor ?? REVIEWER.name, role: e.role ?? REVIEWER.role, ...e }] })),
    agree: (ref, claimId, evidence) => patchCase(ref, (c) => ({ ...c, agreed: c.agreed.includes(claimId) ? c.agreed : [...c.agreed, claimId] }), { caseId: ref, action: 'judgement_agreed', claimId, evidence, detail: 'Reviewer agreed the probabilistic sentence is supported by its evidence.' }),
    decide: (ref, signal, decision, reason) => {
      const client = INBOX_BY_REF[ref].case.client.split(' ')[0];
      patchCase(ref, (c) => ({
        ...c,
        claims: applySignalDecision(c.claims, signal, decision === 'escalated' ? 'dismissed' : decision, client),
        signals: { ...c.signals, [signal.id]: { decision, reason, at: new Date().toISOString(), by: REVIEWER.name } },
      }), { caseId: ref, action: `vulnerability_${decision}`, rule: 'VUL-001', evidence: [signal.lineId], detail: `${signal.driver}: "${signal.quote}"${reason ? ` Reason: ${reason}` : ''}` });
    },
    approve: (ref, adviser) => patchCase(ref, (c) => ({ ...c, status: 'approved', decision: { by: adviser, at: new Date().toISOString() } }), { caseId: ref, action: 'approved', actor: adviser, role: 'Adviser (synthetic)', evidence: [], detail: 'Adviser signed off the report. Nothing is sent from this concept.' }),
    sendBack: (ref, reason) => patchCase(ref, (c) => ({ ...c, status: 'sent_back', decision: { by: REVIEWER.name, at: new Date().toISOString(), reason } }), { caseId: ref, action: 'sent_back', evidence: [], detail: reason }),
    resetCase: (ref) => patchCase(ref, () => fresh(ref), { caseId: ref, action: 'case_reset', evidence: [], detail: 'Draft restored to the original synthetic version.' }),
    resetAll: () => setState(initial()),
    setAtrWindow: (n) => setState((s) => ({ ...s, atrWindow: n })),
  }), [state, patchCase]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider missing');
  return s;
}
