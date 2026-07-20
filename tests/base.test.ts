import { test, expect } from 'vitest';
import { humanizeString } from '../src/humanize-string.js';

test('Empty string', () => {
  expect(humanizeString('')).toStrictEqual({
    text: '',
    count: 0,
  });
});

test('Already clean text passes through unchanged', () => {
  expect(humanizeString('Hello World! 123')).toStrictEqual({
    text: 'Hello World! 123',
    count: 0,
  });
});

test('No options parameter uses defaults', () => {
  expect(humanizeString('\u201CHi\u201D')).toStrictEqual({
    text: '"Hi"',
    count: 2,
  });
});

test('All options disabled returns original', () => {
  expect(
    humanizeString('Hello \u2014 \u201Cworld\u201D\u2026', {
      transformHidden: false,
      transformTrailingWhitespace: false,
      transformNbs: false,
      transformDashes: false,
      transformQuotes: false,
      transformOther: false,
      keyboardOnly: false,
    }),
  ).toStrictEqual({
    text: 'Hello \u2014 \u201Cworld\u201D\u2026',
    count: 0,
  });
});

test('Whitespaces', () => {
  expect(humanizeString('Hello\u200b\xa0World!  ')).toStrictEqual({
    text: 'Hello World!',
    count: 4,
  });
  expect(
    humanizeString('Hello\u200b\xa0World!  ', {
      transformTrailingWhitespace: false,
    }),
  ).toStrictEqual({
    text: 'Hello World!  ',
    count: 2,
  });
  expect(
    humanizeString('Hello\u200b\xa0World!  ', {
      transformHidden: false,
    }),
  ).toStrictEqual({
    text: 'Hello\u200b World!',
    count: 3,
  });
  expect(
    humanizeString('Hello\u200b\xa0World!  ', {
      transformNbs: false,
    }),
  ).toStrictEqual({
    text: 'Hello\xa0World!',
    count: 3,
  });
});

test('Multiline trailing whitespace', () => {
  expect(humanizeString('line1   \nline2\t  \nline3')).toStrictEqual({
    text: 'line1\nline2\nline3',
    count: 6,
  });
});

test('Trailing tabs are removed', () => {
  expect(humanizeString('text\t  \n')).toStrictEqual({
    text: 'text\n',
    count: 3,
  });
});

test('Non-breaking spaces throughout text', () => {
  expect(humanizeString('Hello\u00A0World\u00A0Foo')).toStrictEqual({
    text: 'Hello World Foo',
    count: 2,
  });
});

test('Multiple hidden characters in sequence', () => {
  expect(humanizeString('A\u200B\u200B\u200BB')).toStrictEqual({
    text: 'AB',
    count: 3,
  });
});

test('Various hidden unicode characters', () => {
  expect(
    humanizeString(
      'BOM\uFEFF soft\u00AD zero\u200B bidi\u202A mark\u2060 join\u2066',
    ),
  ).toStrictEqual({
    text: 'BOM soft zero bidi mark join',
    count: 6,
  });
});

test('Mixed AI-generated text with all features', () => {
  const input =
    '\u201CHello\u201D \u2014 I\u2019m an AI\u2026 and I use\u00A0fancy\u00ADchars\u200B!';
  expect(humanizeString(input)).toStrictEqual({
    text: '"Hello" - I\'m an AI... and I use fancychars!',
    count: 8,
  });
});

test('Only transformHidden enabled', () => {
  expect(
    humanizeString('\u200BHello\u200B', {
      transformHidden: true,
      transformTrailingWhitespace: false,
      transformNbs: false,
      transformDashes: false,
      transformQuotes: false,
      transformOther: false,
      keyboardOnly: false,
    }),
  ).toStrictEqual({
    text: 'Hello',
    count: 2,
  });
});
