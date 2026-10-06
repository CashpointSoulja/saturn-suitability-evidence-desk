import type { AdviceCase, Claim, Topic } from './types';

export interface CobsItem {
  id: string;
  ref: string;
  url: string;
  wording: string;
  plain: string;
  applies: (c: AdviceCase) => boolean;
  topics?: Topic[];
  requiresOnePageSummaryFirst?: boolean;
}

const COBS94 = 'https://handbook.fca.org.uk/handbook/cobs9/cobs9s4';
const COBS9A = 'https://handbook.fca.org.uk/handbook/cobs9a';

export const COBS_ITEMS: CobsItem[] = [
  { id: 'C9A-1', ref: 'COBS 9A.3.2R(2)(a)', url: COBS9A, wording: 'specifying the advice given and how that advice meets the preferences, objectives and other characteristics of the client', plain: 'States the advice and links it to the client’s objectives.', applies: (c) => c.regime === 'COBS9A', topics: ['advice_given', 'objectives'] },
  { id: 'C9A-2', ref: 'COBS 9A.3.3R(1)(a)', url: COBS9A, wording: 'the advice given and how the recommendation is suitable for them', plain: 'Explains why the recommendation is suitable.', applies: (c) => c.regime === 'COBS9A', topics: ['advice_given', 'why_suitable'] },
  { id: 'C9A-3', ref: 'COBS 9A.3.3R(1)(b)(i)', url: COBS9A, wording: 'the investment term required', plain: 'States the investment term.', applies: (c) => c.regime === 'COBS9A', topics: ['term'] },
  { id: 'C9A-4', ref: 'COBS 9A.3.3R(1)(b)(ii)', url: COBS9A, wording: 'their knowledge and experience', plain: 'Covers knowledge and experience.', applies: (c) => c.regime === 'COBS9A', topics: ['knowledge_experience'] },
  { id: 'C9A-5', ref: 'COBS 9A.3.3R(1)(b)(iii)', url: COBS9A, wording: 'their attitude to risk and capacity for loss', plain: 'Covers attitude to risk and capacity for loss.', applies: (c) => c.regime === 'COBS9A', topics: ['attitude_to_risk', 'capacity_for_loss'] },
  { id: 'C9A-6', ref: 'COBS 9A.3.3R(2)', url: COBS9A, wording: "information on whether the recommended services or instruments are likely to require the retail client to seek a periodic review of their arrangements, and draw the client's attention to this information", plain: 'Says whether a periodic review is likely to be needed.', applies: (c) => c.regime === 'COBS9A', topics: ['periodic_review'] },
  { id: 'C94-1', ref: 'COBS 9.4.7R(1)', url: COBS94, wording: "specify, on the basis of the information obtained from the client, the client's demands and needs", plain: 'States the client’s demands and needs.', applies: (c) => c.regime === 'COBS9', topics: ['objectives'] },
  { id: 'C94-2', ref: 'COBS 9.4.7R(2)', url: COBS94, wording: 'explain why the firm has concluded that the recommended transaction is suitable for the client having regard to the information provided by the client', plain: 'Explains why the recommendation is suitable.', applies: (c) => c.regime === 'COBS9', topics: ['why_suitable'] },
  { id: 'C94-3', ref: 'COBS 9.4.7R(3)', url: COBS94, wording: 'explain any possible disadvantages of the transaction for the client', plain: 'Explains possible disadvantages.', applies: (c) => c.regime === 'COBS9', topics: ['disadvantages'] },
  { id: 'C94-4', ref: 'COBS 9.4.11R(1)', url: COBS94, wording: 'A firm must include a one page summary at the front of the suitability report when making a personal recommendation in relation to a pension transfer or a pension conversion', plain: 'One page summary at the front.', applies: (c) => c.pensionTransfer, requiresOnePageSummaryFirst: true },
  { id: 'C94-5', ref: 'COBS 9.4.11R(4)(a)', url: COBS94, wording: 'set out whether the recommendation is to effect a pension transfer or pension conversion or to remain in the client’s current scheme or arrangement', plain: 'Says whether to transfer or remain.', applies: (c) => c.pensionTransfer, topics: ['transfer_or_remain'] },
  { id: 'C94-6', ref: 'COBS 9.4.11R(2)(f)', url: COBS94, wording: 'information about the amounts payable (in cash terms) in relation to the initial advice on the pension transfer or pension conversion, and the number of months (rounded up to the nearest whole month) it would take to pay that amount out of the revalued monthly income the client would receive from the ceding arrangement', plain: 'Initial advice cost in cash and months of scheme income it equals.', applies: (c) => c.pensionTransfer, topics: ['initial_charge_months'] },
];

export type CobsStatus = 'met' | 'missing' | 'not_applicable';

export interface CobsResult {
  item: CobsItem;
  status: CobsStatus;
  claimIds: string[];
  missingTopics: Topic[];
}

export function checkCobs(c: AdviceCase, claims: Claim[] = c.claims): CobsResult[] {
  const live = claims.filter((cl) => cl.text.trim() !== '');
  return COBS_ITEMS.map((item) => {
    if (!item.applies(c)) return { item, status: 'not_applicable', claimIds: [], missingTopics: [] };
    if (item.requiresOnePageSummaryFirst) {
      const ok = live[0]?.section === 'one_page_summary';
      return { item, status: ok ? 'met' : 'missing', claimIds: ok ? [live[0].id] : [], missingTopics: [] };
    }
    const topics = item.topics ?? [];
    const missingTopics = topics.filter((t) => !live.some((cl) => cl.topics?.includes(t)));
    const claimIds = live.filter((cl) => cl.topics?.some((t) => topics.includes(t))).map((cl) => cl.id);
    return { item, status: missingTopics.length ? 'missing' : 'met', claimIds, missingTopics };
  });
}
