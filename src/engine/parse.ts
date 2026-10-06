const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];

const MONEY_RE = /£\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?/g;
const PCT_RE = /(\d+(?:\.\d+)?)\s?%/g;
const DATE_RE = /\b(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})\b/g;

export function parseMoney(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(MONEY_RE)) {
    const whole = Number(m[1].replace(/,/g, ''));
    const pence = m[2] ? Number(m[2].padEnd(2, '0')) / 100 : 0;
    out.push(round2(whole + pence));
  }
  return out;
}

export function parsePercents(text: string): number[] {
  return [...text.matchAll(PCT_RE)].map((m) => Number(m[1]));
}

export function parseDates(text: string): string[] {
  return [...text.matchAll(DATE_RE)].map((m) => {
    const month = MONTHS.indexOf(m[2].toLowerCase()) + 1;
    return `${m[3]}-${String(month).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  });
}

const WORDS: Record<string, number> = {
  zero: 0, no: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30,
};

function toInt(token: string): number | undefined {
  if (/^\d+$/.test(token)) return Number(token);
  const w = WORDS[token.toLowerCase()];
  return w === undefined ? undefined : w;
}

const NUM = '(\\d+|zero|no|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty)';

const COUNT_PATTERNS: Record<string, RegExp> = {
  age: new RegExp(`\\b(?:age|aged)\\s+${NUM}\\b`, 'i'),
  years: new RegExp(`\\b${NUM}[- ]years?\\b`, 'i'),
  months: new RegExp(`\\b${NUM}\\s+months?\\b`, 'i'),
  dependants: new RegExp(`\\b${NUM}\\s+(?:financial\\s+)?dependants?\\b`, 'i'),
  atr_score: new RegExp(`\\b${NUM}\\s+(?:out\\s+)?of\\s+(?:7|seven)\\b`, 'i'),
};

export function parseCount(text: string, pattern: keyof typeof COUNT_PATTERNS): number | undefined {
  const m = text.match(COUNT_PATTERNS[pattern]);
  return m ? toInt(m[1]) : undefined;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatGBP(n: number): string {
  const fixed = Number.isInteger(n) ? n.toLocaleString('en-GB') : n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `£${fixed}`;
}

export function monthsBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso + 'T00:00:00Z');
  const b = new Date(toIso + 'T00:00:00Z');
  let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
  if (b.getUTCDate() < a.getUTCDate()) months -= 1;
  return months;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1][0].toUpperCase()}${MONTHS[m - 1].slice(1)} ${y}`;
}

export function normaliseQuote(s: string): string {
  return s.toLowerCase().replace(/[’']/g, "'").replace(/\.(?!\d)/g, ' ').replace(/[^a-z0-9£%.' ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

export function editDistanceRatio(original: string[], current: string[]): number {
  const a = original.join('\n');
  const b = current.join('\n');
  const denom = Math.max(a.length, 1);
  return levenshtein(a, b) / denom;
}
