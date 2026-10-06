export interface ReviewTimeAssumptions {
  minutesPerDeterministicManual: number;
  minutesPerDeterministicVerified: number;
  minutesPerProbabilistic: number;
  minutesPerFailedCheckFix: number;
  minutesPerSignal: number;
  fixedMinutes: number;
}

export const DEFAULT_ASSUMPTIONS: ReviewTimeAssumptions = {
  minutesPerDeterministicManual: 2,
  minutesPerDeterministicVerified: 0.25,
  minutesPerProbabilistic: 1.5,
  minutesPerFailedCheckFix: 3,
  minutesPerSignal: 2,
  fixedMinutes: 5,
};

export interface ReviewLoad {
  deterministic: number;
  probabilistic: number;
  failedChecks: number;
  signals: number;
}

export function estimateMinutes(load: ReviewLoad, a: ReviewTimeAssumptions) {
  const manual = a.fixedMinutes + load.deterministic * a.minutesPerDeterministicManual + load.probabilistic * a.minutesPerProbabilistic + load.failedChecks * a.minutesPerFailedCheckFix + load.signals * a.minutesPerSignal;
  const withDesk = a.fixedMinutes + load.deterministic * a.minutesPerDeterministicVerified + load.probabilistic * a.minutesPerProbabilistic + load.failedChecks * a.minutesPerFailedCheckFix + load.signals * a.minutesPerSignal;
  return { manual: Math.round(manual * 10) / 10, withDesk: Math.round(withDesk * 10) / 10, saved: Math.round((manual - withDesk) * 10) / 10 };
}
