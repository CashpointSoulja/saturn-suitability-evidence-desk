import { runEval } from '../src/engine/eval';
import { GOLDEN } from '../src/data/golden';

const r = runEval(GOLDEN);
const pct = (x: number) => (x * 100).toFixed(1) + '%';
console.log(`cases ${r.cases} (defective ${r.defectiveCases}, clean ${r.cleanCases}), seeded defects ${r.seededDefects}, decisions ${r.decisions}`);
console.log(`TP ${r.tp} FP ${r.fp} FN ${r.fn} TN ${r.tn}`);
console.log(`defect recall ${pct(r.defectRecall)} (${r.tp}/${r.tp + r.fn}); false-positive rate ${pct(r.falsePositiveRate)} (${r.fp}/${r.fp + r.tn})`);
console.log(`unsupported-claim catch rate ${pct(r.unsupported.rate)} (${r.unsupported.caught}/${r.unsupported.seeded})`);
console.log(`vulnerability recall ${pct(r.vulnerability.recall)} (${r.vulnerability.caughtLines}/${r.vulnerability.seededLines}); flag precision ${pct(r.vulnerability.precision)} (${r.vulnerability.trueFlags}/${r.vulnerability.flags})`);
for (const t of r.perType) console.log(`${t.type.padEnd(24)} TP ${t.tp} FP ${t.fp} FN ${t.fn} TN ${t.tn}`);
for (const c of r.perCase) console.log(`${c.id} ${c.correct ? 'OK  ' : 'MISS'} expected [${c.expected}] predicted [${c.predicted}]  ${c.description}`);
