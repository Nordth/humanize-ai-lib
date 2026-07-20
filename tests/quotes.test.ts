import { test, expect } from 'vitest';
import { humanizeString } from '../src/humanize-string.js';

test('Fancy double quotes and guillemets', () => {
  expect(
    humanizeString('Angular \u201Cquote\u201D \u00ABmarks\u00BB looks\u201E like Christmas \u00AB\u00AB tree'),
  ).toStrictEqual({
    text: 'Angular "quote" "marks" looks" like Christmas "" tree',
    count: 7,
  });
});

test('Only transformQuotes enabled', () => {
  expect(
    humanizeString('\u201CHello\u201D \u2014 world', {
      transformHidden: false,
      transformTrailingWhitespace: false,
      transformNbs: false,
      transformDashes: false,
      transformQuotes: true,
      transformOther: false,
      keyboardOnly: false,
    }),
  ).toStrictEqual({
    text: '"Hello" \u2014 world',
    count: 2,
  });
});

test('Single and curly quotes', () => {
  expect(humanizeString('\u2018hello\u2019')).toStrictEqual({
    text: "'hello'",
    count: 2,
  });
});

test('Count accuracy with multiple quote replacements', () => {
  const input = '\u201Ca\u201D\u201Cb\u201D\u201Cc\u201D';
  expect(humanizeString(input)).toStrictEqual({
    text: '"a""b""c"',
    count: 6,
  });
});

test('Ellipsis replacement', () => {
  expect(humanizeString('Wait\u2026 please\u2026')).toStrictEqual({
    text: 'Wait... please...',
    count: 2,
  });
});

test('Ellipsis with transformOther disabled', () => {
  expect(
    humanizeString('Wait\u2026 please\u2026', { transformOther: false }),
  ).toStrictEqual({
    text: 'Wait\u2026 please\u2026',
    count: 0,
  });
});

test('Single ellipsis character', () => {
  expect(humanizeString('\u2026')).toStrictEqual({
    text: '...',
    count: 1,
  });
});

test('Ellipsis among other text', () => {
  expect(humanizeString('Loading\u2026 done!')).toStrictEqual({
    text: 'Loading... done!',
    count: 1,
  });
});

test('Only transformOther enabled', () => {
  expect(
    humanizeString('\u201CHello\u201D\u2026', {
      transformHidden: false,
      transformTrailingWhitespace: false,
      transformNbs: false,
      transformDashes: false,
      transformQuotes: false,
      transformOther: true,
      keyboardOnly: false,
    }),
  ).toStrictEqual({
    text: '\u201CHello\u201D...',
    count: 1,
  });
});
