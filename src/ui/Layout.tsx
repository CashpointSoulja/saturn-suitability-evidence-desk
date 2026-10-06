import { useState, type ReactNode } from 'react';
import { REVIEWER } from '../state';

const LINKS = [
  { path: '', label: 'Cases' },
  { path: 'eval', label: 'Eval lab' },
  { path: 'metrics', label: 'Metrics and bets' },
  { path: 'rules', label: 'Rules and sources' },
  { path: 'no', label: 'What I said no to' },
];

export const LOGO = `${import.meta.env.BASE_URL}assets/saturn-logo.png`;

export function Layout({ children, active, wide }: { children: ReactNode; active: string; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`frame ${wide ? 'frame-wide' : ''}`}>
      <header className="topbar">
        <a href="#/" className="brand" aria-label="Suitability Evidence Desk home">
          <img src={LOGO} alt="SATURN" width={113} height={20} />
          <span className="brand-product">Evidence Desk</span>
        </a>
        <nav className={`nav ${open ? 'open' : ''}`} aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.path} href={`#/${l.path}`} className={active === l.path ? 'active' : ''} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </nav>
        <div className="topbar-right">
          <span className="btn btn-secondary btn-sm reviewer" title={REVIEWER.role}>{REVIEWER.name}</span>
          <button className="menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /></button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">Independent concept by Ayo Ahmed. Not affiliated with Saturn. All client data is synthetic.</footer>
    </div>
  );
}
