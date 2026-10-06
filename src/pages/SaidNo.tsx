import { Eyebrow } from '../ui/bits';

const ITEMS = [
  { t: 'Generating the draft', w: 'Saturn already drafts reports. The gap this concept tests is the review step: can an adviser trust and approve a draft faster without losing evidence. Adding a model would hide whether the review design works.' },
  { t: 'A confidence percentage on any claim', w: 'A number like “87% confident” invites advisers to stop reading. Deterministic claims are pass or fail by rule; probabilistic claims show evidence strength and always need judgement.' },
  { t: 'Auto-approval of clean reports', w: 'Saturn says all AI documentation stays subject to mandatory adviser review, and the adviser carries the regulatory responsibility. A clean report still needs a named adviser and a declaration.' },
  { t: 'A full COBS rulebook', w: 'Only requirements read in the live Handbook are encoded, each quoted and linked. A partial list that claims to be complete is worse than a short honest one. It is labelled illustrative, not compliance advice.' },
  { t: 'CRM, platform and back-office integrations', w: 'Real integrations need real data and agreements. Everything here is synthetic and in the browser, so the review logic can be judged on its own.' },
];

export function SaidNo() {
  return (
    <section className="page narrow">
      <div className="page-head">
        <Eyebrow>What I said no to</Eyebrow>
        <h1 className="display">Five things left out of v1, on purpose.</h1>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
        {ITEMS.map((i, n) => (
          <div key={i.t}>
            <p className="eyebrow">{String(n + 1).padStart(2, '0')}</p>
            <p className="h3">{i.t}</p>
            <p className="muted" style={{ marginTop: 8 }}>{i.w}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
