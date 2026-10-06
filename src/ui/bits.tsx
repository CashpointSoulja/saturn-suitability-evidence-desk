import type { ReactNode } from 'react';

export type Tone = 'pass' | 'fail' | 'review' | 'neutral' | 'primary';

export function Pill({ tone = 'neutral', children, title }: { tone?: Tone; children: ReactNode; title?: string }) {
  return <span className={`pill pill-${tone}`} title={title}>{children}</span>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export const pct = (x: number | null | undefined, d = 1) => (x === null || x === undefined ? 'n/a' : `${(x * 100).toFixed(d)}%`);

export function download(name: string, mime: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
