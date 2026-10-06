export interface AuditEntry {
  seq: number;
  at: string;
  actor: string;
  role: string;
  caseId: string;
  action: string;
  claimId?: string;
  rule?: string;
  evidence: string[];
  detail: string;
}

export function toCSV(entries: AuditEntry[]): string {
  const cols: (keyof AuditEntry)[] = ['seq', 'at', 'actor', 'role', 'caseId', 'action', 'claimId', 'rule', 'evidence', 'detail'];
  const esc = (v: unknown) => {
    const s = Array.isArray(v) ? v.join(' ') : v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...entries.map((e) => cols.map((c) => esc(e[c])).join(','))].join('\n');
}

export function toJSON(entries: AuditEntry[]): string {
  return JSON.stringify({ schema: 'suitability-evidence-desk.audit.v1', synthetic: true, entries }, null, 2);
}
