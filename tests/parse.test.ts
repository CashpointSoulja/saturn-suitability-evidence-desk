import { describe, expect, it } from 'vitest';
import { editDistanceRatio, formatDate, formatGBP, levenshtein, monthsBetween, normaliseQuote, parseCount, parseDates, parseMoney, parsePercents, round2 } from '../src/engine/parse';

describe('parseMoney', () => {
  it('parses comma-grouped pounds', () => expect(parseMoney('£23,500')).toEqual([23500]));
  it('parses pence', () => expect(parseMoney('£587.50')).toEqual([587.5]));
  it('parses ungrouped pounds and single-digit pounds with pence', () => expect(parseMoney('£23500 and £4.50')).toEqual([23500, 4.5]));
  it('parses several amounts in order', () => expect(parseMoney('£1,450 then £3,500 then £412,000')).toEqual([1450, 3500, 412000]));
  it('ignores numbers without a £ sign', () => expect(parseMoney('23,500 and 12 years')).toEqual([]));
});

describe('parsePercents', () => {
  it('parses integers and decimals', () => expect(parsePercents('2% and 0.25% and 1.5 %')).toEqual([2, 0.25, 1.5]));
  it('returns empty when none', () => expect(parsePercents('twenty percent')).toEqual([]));
});

describe('parseDates', () => {
  it('parses d Month yyyy to ISO', () => expect(parseDates('on 2 March 2026')).toEqual(['2026-03-02']));
  it('parses two-digit days', () => expect(parseDates('21 July 2026 and 19 August 2026')).toEqual(['2026-07-21', '2026-08-19']));
  it('ignores other formats', () => expect(parseDates('02/03/2026')).toEqual([]));
});

describe('parseCount', () => {
  it('reads age in digits', () => expect(parseCount('You are aged 58', 'age')).toBe(58));
  it('reads term in years', () => expect(parseCount('a term of 11 years', 'years')).toBe(11));
  it('reads dependants in words', () => expect(parseCount('with two dependants', 'dependants')).toBe(2));
  it('reads "no dependants" as zero', () => expect(parseCount('with no dependants', 'dependants')).toBe(0));
  it('reads risk score "5 of 7"', () => expect(parseCount('as 5 of 7', 'atr_score')).toBe(5));
  it('reads months', () => expect(parseCount('equals 3 months of income', 'months')).toBe(3));
  it('returns undefined when absent', () => expect(parseCount('nothing here', 'age')).toBeUndefined());
});

describe('helpers', () => {
  it('round2 rounds to the penny', () => expect(round2(587.499999)).toBe(587.5));
  it('formatGBP shows pence only when needed', () => { expect(formatGBP(29375)).toBe('£29,375'); expect(formatGBP(587.5)).toBe('£587.50'); });
  it('monthsBetween counts whole months', () => { expect(monthsBetween('2025-01-20', '2026-09-22')).toBe(20); expect(monthsBetween('2026-03-02', '2026-09-14')).toBe(6); });
  it('formatDate is the inverse of parseDates', () => expect(parseDates(formatDate('2026-07-01'))).toEqual(['2026-07-01']));
  it('normaliseQuote ignores case and punctuation', () => expect(normaliseQuote('No, I would leave it ALONE.')).toBe(normaliseQuote('no i would leave it alone')));
  it('levenshtein counts edits', () => { expect(levenshtein('kitten', 'sitting')).toBe(3); expect(levenshtein('', 'abc')).toBe(3); });
  it('editDistanceRatio is 0 for no edits and >0 for edits', () => { expect(editDistanceRatio(['a b'], ['a b'])).toBe(0); expect(editDistanceRatio(['abcd'], ['abcx'])).toBeGreaterThan(0); });
});
