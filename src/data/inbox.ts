import type { AdviceCase } from '../engine/types';
import { GOLDEN_BY_ID } from './golden';

export interface InboxCase {
  ref: string;
  goldenId: string;
  mix: string;
  case: AdviceCase;
}

const pick = (ref: string, goldenId: string, mix: string): InboxCase => {
  const c: AdviceCase = JSON.parse(JSON.stringify(GOLDEN_BY_ID[goldenId].case));
  c.id = ref;
  return { ref, goldenId, mix, case: c };
};

export const INBOX: InboxCase[] = [
  pick('SR-0912', 'G01', 'Simple pension top-up'),
  pick('SR-0913', 'G06', 'Pension transfer'),
  pick('SR-0914', 'G10', 'Vulnerability signal in meeting'),
  pick('SR-0915', 'G14', 'Stale risk profile'),
  pick('SR-0916', 'G17', 'Numbers mismatch'),
  pick('SR-0917', 'G21', 'Clean case'),
];

export const INBOX_BY_REF = Object.fromEntries(INBOX.map((i) => [i.ref, i]));
