import { test, expect } from 'vitest';
import { humanizeString } from '../src/humanize-string.js';

test('Em-dashes and en-dash with surrounding spaces', () => {
  expect(humanizeString('I — super — man – 💪')).toStrictEqual({
    text: 'I - super - man - 💪',
    count: 3,
  });
});

test('Em dash between words without spaces', () => {
  expect(humanizeString('one—two')).toStrictEqual({
    text: 'one - two',
    count: 1,
  });
});

test('En dash between words without spaces', () => {
  expect(humanizeString('2000–2026')).toStrictEqual({
    text: '2000-2026',
    count: 1,
  });
});


test('Dash at beginning of string', () => {
  expect(humanizeString('\u2014xxx')).toStrictEqual({
    text: '- xxx',
    count: 1,
  });
});

test('Dash after tab in list', () => {
  expect(humanizeString('\t\u2014yyy')).toStrictEqual({
    text: '\t- yyy',
    count: 1,
  });
});

test('Dash with space only before', () => {
  expect(humanizeString('xxx \u2014yyy')).toStrictEqual({
    text: 'xxx - yyy',
    count: 1,
  });
});

test('Dash with space only after', () => {
  expect(humanizeString('xxx\u2014 yyy')).toStrictEqual({
    text: 'xxx - yyy',
    count: 1,
  });
});

test('Multiple dashes in sequence', () => {
  expect(humanizeString('aaa\u2014bbb\u2014ccc')).toStrictEqual({
    text: 'aaa - bbb - ccc',
    count: 2,
  });
});

test('Only transformDashes enabled', () => {
  expect(
    humanizeString('Hello \u2014 world\u2026', {
      transformHidden: false,
      transformTrailingWhitespace: false,
      transformNbs: false,
      transformDashes: true,
      transformQuotes: false,
      transformOther: false,
      keyboardOnly: false,
    }),
  ).toStrictEqual({
    text: 'Hello - world\u2026',
    count: 1,
  });
});
