import type { AdviceCase, Claim, DefectType, EvidenceStrength, RuleResult, SignalState, VulnerabilitySignal } from './types';
import { checkEvidence, checkRiskFreshness, checkSections, DEFAULT_ATR_WINDOW_MONTHS, evidenceStrength, runCheck } from './rules';
import { scanTranscript, signalCitedInDraft } from './vulnerability';
import { checkCobs, type CobsResult } from './cobs';

export type ClaimStatus = 'verified' | 'failed' | 'unsupported' | 'judgement';

export interface ClaimEvaluation {
  claim: Claim;
  results: RuleResult[];
  status: ClaimStatus;
  strength: EvidenceStrength;
}

export interface SignalEvaluation {
  signal: VulnerabilitySignal;
  cited: boolean;
  state?: SignalState;
  handled: boolean;
}

export interface CaseEvaluation {
  claims: ClaimEvaluation[];
  risk: RuleResult;
  sections: RuleResult[];
  signals: SignalEvaluation[];
  vulnerability: RuleResult;
  cobs: CobsResult[];
  blockers: string[];
  readiness: 'blocked' | 'ready_for_review';
  counts: { unsupported: number; failed: number; judgement: number; verified: number };
}

export interface EvaluateOptions {
  claims?: Claim[];
  atrWindowMonths?: number;
  signalStates?: Record<string, SignalState>;
}

export function evaluateClaim(claim: Claim, c: AdviceCase): ClaimEvaluation {
  const evidence = checkEvidence(claim, c);
  const checks = (claim.checks ?? []).map((ch) => runCheck(ch, claim, c));
  const results = [...evidence, ...checks];
  const strength = evidenceStrength(claim, c);
  let status: ClaimStatus;
  if (evidence.some((r) => r.outcome === 'fail')) status = 'unsupported';
  else if (checks.some((r) => r.outcome === 'fail')) status = 'failed';
  else if (claim.kind === 'probabilistic') status = 'judgement';
  else status = 'verified';
  return { claim, results, status, strength };
}

export function evaluateCase(c: AdviceCase, opts: EvaluateOptions = {}): CaseEvaluation {
  const claims = opts.claims ?? c.claims;
  const live = claims.filter((cl) => cl.text.trim() !== '');
  const claimEvals = live.map((cl) => evaluateClaim(cl, c));
  const risk = checkRiskFreshness(c, opts.atrWindowMonths ?? DEFAULT_ATR_WINDOW_MONTHS);
  const sections = checkSections(c, live);
  const states = opts.signalStates ?? {};
  const signals = scanTranscript(c).map((signal) => {
    const cited = signalCitedInDraft(signal, live);
    const state = states[signal.id];
    return { signal, cited, state, handled: cited || state?.decision === 'dismissed' };
  });
  const unhandled = signals.filter((s) => !s.handled);
  const vulnerability: RuleResult = unhandled.length
    ? { rule: 'VUL-001', outcome: 'fail', message: `${unhandled.length} vulnerability signal${unhandled.length > 1 ? 's' : ''} in the transcript ${unhandled.length > 1 ? 'are' : 'is'} not reflected in the report.`, evidence: unhandled.map((s) => s.signal.lineId) }
    : { rule: 'VUL-001', outcome: 'pass', message: signals.length ? 'Every vulnerability signal is cited or dismissed with a reason.' : 'The transcript scan found no vulnerability signals.', evidence: [] };
  const cobs = checkCobs(c, live);

  const counts = {
    unsupported: claimEvals.filter((e) => e.status === 'unsupported').length,
    failed: claimEvals.filter((e) => e.status === 'failed').length,
    judgement: claimEvals.filter((e) => e.status === 'judgement').length,
    verified: claimEvals.filter((e) => e.status === 'verified').length,
  };
  const blockers: string[] = [];
  if (counts.unsupported) blockers.push(`${counts.unsupported} unsupported sentence${counts.unsupported > 1 ? 's' : ''}`);
  if (counts.failed) blockers.push(`${counts.failed} failed figure or arithmetic check${counts.failed > 1 ? 's' : ''}`);
  if (risk.outcome === 'fail') blockers.push('risk profile out of date');
  const missing = sections.filter((s) => s.outcome === 'fail');
  if (missing.length) blockers.push(`${missing.length} required section${missing.length > 1 ? 's' : ''} missing or misplaced`);
  if (vulnerability.outcome === 'fail') blockers.push(`${unhandled.length} vulnerability signal${unhandled.length > 1 ? 's' : ''} not handled`);
  const cobsMissing = cobs.filter((r) => r.status === 'missing').length;
  if (cobsMissing) blockers.push(`${cobsMissing} illustrative content check${cobsMissing > 1 ? 's' : ''} not met`);

  return { claims: claimEvals, risk, sections, signals, vulnerability, cobs, blockers, readiness: blockers.length ? 'blocked' : 'ready_for_review', counts };
}

export function predictDefects(ev: CaseEvaluation): Set<DefectType> {
  const out = new Set<DefectType>();
  const all = ev.claims.flatMap((c) => c.results);
  if (all.some((r) => r.rule.startsWith('EVID') && r.outcome === 'fail')) out.add('unsupported_claim');
  if (all.some((r) => /^(FIG-00[123]|ARITH|ALLOW)/.test(r.rule) && r.outcome === 'fail')) out.add('wrong_figure');
  if (all.some((r) => r.rule === 'FIG-004' && r.outcome === 'fail')) out.add('contradicted_statement');
  if (ev.risk.outcome === 'fail') out.add('stale_risk_profile');
  if (ev.sections.some((s) => s.outcome === 'fail')) out.add('missing_section');
  if (ev.vulnerability.outcome === 'fail') out.add('missed_vulnerability');
  return out;
}

export interface GateInput {
  evaluation: CaseEvaluation;
  agreedClaimIds: Set<string>;
  signalStates: Record<string, SignalState>;
  adviserName: string;
  attested: boolean;
}

export function approvalGate(g: GateInput): string[] {
  const reasons = [...g.evaluation.blockers];
  const pendingJudgement = g.evaluation.claims.filter((e) => e.status === 'judgement' && e.claim.origin !== 'adviser' && !g.agreedClaimIds.has(e.claim.id)).length;
  if (pendingJudgement) reasons.push(`${pendingJudgement} probabilistic sentence${pendingJudgement > 1 ? 's' : ''} still need adviser judgement`);
  const undecided = g.evaluation.signals.filter((s) => !g.signalStates[s.signal.id]).length;
  if (undecided) reasons.push(`${undecided} vulnerability signal${undecided > 1 ? 's' : ''} awaiting confirm, dismiss or escalate`);
  if (!g.adviserName.trim()) reasons.push('adviser name for sign-off is empty');
  if (!g.attested) reasons.push('adviser has not ticked the review declaration');
  return reasons;
}
