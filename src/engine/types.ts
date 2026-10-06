export type Speaker = 'Adviser' | 'Client' | 'Partner';

export interface TranscriptLine {
  id: string;
  t: string;
  speaker: Speaker;
  text: string;
}

export type FieldValue = number | string;

export interface FactField {
  id: string;
  label: string;
  value: FieldValue;
  unit: 'GBP' | 'pct' | 'date' | 'int' | 'text';
}

export type SectionId =
  | 'one_page_summary'
  | 'summary'
  | 'objectives'
  | 'circumstances'
  | 'risk'
  | 'recommendation'
  | 'disadvantages'
  | 'charges'
  | 'vulnerability'
  | 'review';

export type Topic =
  | 'advice_given'
  | 'objectives'
  | 'term'
  | 'knowledge_experience'
  | 'attitude_to_risk'
  | 'capacity_for_loss'
  | 'periodic_review'
  | 'disadvantages'
  | 'why_suitable'
  | 'charges_comparison'
  | 'initial_charge_months'
  | 'transfer_or_remain';

export type DeterministicCheck =
  | { rule: 'FIG-001'; field: string; index: number }
  | { rule: 'FIG-002'; field: string; index: number }
  | { rule: 'FIG-003'; field: string; index: number }
  | { rule: 'FIG-004'; field: string; pattern: CountPattern }
  | { rule: 'ARITH-001'; pct: number; base: number; result: number }
  | { rule: 'ARITH-002'; parts: number[]; total: number }
  | { rule: 'ARITH-003'; net: number; gross: number }
  | { rule: 'ARITH-004'; monthly: number; annual: number }
  | { rule: 'ARITH-005'; cost: number; monthly: number; months: CountPattern }
  | { rule: 'ALLOW-001'; index: number };

export type CountPattern = 'age' | 'years' | 'dependants' | 'atr_score' | 'months';

export type JudgementKind = 'reasons' | 'objectives' | 'tone' | 'vulnerability' | 'circumstances';

export interface Claim {
  id: string;
  section: SectionId;
  text: string;
  kind: 'deterministic' | 'probabilistic';
  evidence: string[];
  quote?: string;
  checks?: DeterministicCheck[];
  judgement?: JudgementKind;
  topics?: Topic[];
  noVulnerabilityStatement?: boolean;
  origin?: 'draft' | 'adviser';
}

export type AdviceType = 'pension_top_up' | 'db_transfer' | 'isa_gia' | 'pension_consolidation' | 'drawdown_review';
export type Regime = 'COBS9' | 'COBS9A';

export interface AdviceCase {
  id: string;
  client: string;
  adviser: string;
  paraplanner: string;
  firm: string;
  adviceType: AdviceType;
  adviceLabel: string;
  regime: Regime;
  pensionTransfer: boolean;
  meetingDate: string;
  scenario: string;
  transcript: TranscriptLine[];
  factFind: FactField[];
  claims: Claim[];
}

export type Outcome = 'pass' | 'fail' | 'not_applicable';

export interface RuleResult {
  rule: string;
  claimId?: string;
  outcome: Outcome;
  message: string;
  evidence: string[];
}

export type EvidenceStrength = 'direct' | 'inferred' | 'weak' | 'none';

export type Driver = 'health' | 'life_events' | 'resilience' | 'capability';

export interface VulnerabilitySignal {
  id: string;
  driver: Driver;
  lineId: string;
  quote: string;
  cue: string;
}

export type SignalDecision = 'confirmed' | 'dismissed' | 'escalated';

export interface SignalState {
  decision: SignalDecision;
  reason?: string;
  at?: string;
  by?: string;
}

export type DefectType =
  | 'unsupported_claim'
  | 'wrong_figure'
  | 'missed_vulnerability'
  | 'stale_risk_profile'
  | 'missing_section'
  | 'contradicted_statement';

export const DEFECT_TYPES: DefectType[] = [
  'unsupported_claim',
  'wrong_figure',
  'missed_vulnerability',
  'stale_risk_profile',
  'missing_section',
  'contradicted_statement',
];
