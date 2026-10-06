import type { AdviceCase, Claim, DeterministicCheck } from '../src/engine/types';
import { runCheck } from '../src/engine/rules';
import { B1 } from '../src/data/bases';

export const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

export function mini(overrides: Partial<AdviceCase> = {}): AdviceCase {
  return { ...clone(B1), id: 'T', ...overrides };
}

export function claim(text: string, extra: Partial<Claim> = {}): Claim {
  return { id: 'x', section: 'summary', kind: 'deterministic', text, evidence: ['T1'], ...extra };
}

export function check(text: string, ch: DeterministicCheck, c: AdviceCase = mini()) {
  return runCheck(ch, claim(text), c);
}
