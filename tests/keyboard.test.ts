import { test, expect } from 'vitest';
import { humanizeString } from '../src/humanize-string.js';

test('Preserves letters from all scripts', () => {
  expect(
    humanizeString('Привет мир', { keyboardOnly: true }),
  ).toStrictEqual({
    text: 'Привет мир',
    count: 0,
  });
});

test('Preserves ASCII text', () => {
  expect(
    humanizeString('Hello World 123!', { keyboardOnly: true }),
  ).toStrictEqual({
    text: 'Hello World 123!',
    count: 0,
  });
});

test('Preserves common punctuation', () => {
  expect(
    humanizeString('Hello, World! How are you? I\'m fine.', {
      keyboardOnly: true,
    }),
  ).toStrictEqual({
    text: 'Hello, World! How are you? I\'m fine.',
    count: 0,
  });
});

test('Preserves emojis', () => {
  expect(
    humanizeString('Hello 🌍 World 🎉', { keyboardOnly: true }),
  ).toStrictEqual({
    text: 'Hello 🌍 World 🎉',
    count: 0,
  });
});

test('Combined with dashes replacement', () => {
  expect(
    humanizeString('one \u2014 two', { keyboardOnly: true }),
  ).toStrictEqual({
    text: 'one - two',
    count: 1,
  });
});

test('Combined with quotes replacement', () => {
  expect(
    humanizeString('\u201Chello\u201D', { keyboardOnly: true }),
  ).toStrictEqual({
    text: '"hello"',
    count: 2,
  });
});

test('Combined with other transformations', () => {
  expect(
    humanizeString('\u201CHello\u201D \u2014 world\u2026', {
      keyboardOnly: true,
    }),
  ).toStrictEqual({
    text: '"Hello" - world...',
    count: 4,
  });
});

test('Strips fancy quotes when other transforms disabled', () => {
  expect(
    humanizeString('\u201Chello\u201D', {
      transformHidden: false,
      transformTrailingWhitespace: false,
      transformNbs: false,
      transformDashes: false,
      transformQuotes: false,
      transformOther: false,
      keyboardOnly: true,
    }),
  ).toStrictEqual({
    text: 'hello',
    count: 2,
  });
});

test('Strips em-dash when other transforms disabled', () => {
  expect(
    humanizeString('one \u2014 two', {
      transformHidden: false,
      transformTrailingWhitespace: false,
      transformNbs: false,
      transformDashes: false,
      transformQuotes: false,
      transformOther: false,
      keyboardOnly: true,
    }),
  ).toStrictEqual({
    text: 'one  two',
    count: 1,
  });
});

test('Strips non-letter non-emoji Unicode symbols', () => {
  expect(
    humanizeString('\u00A7section\u00B6paragraph', {
      transformHidden: false,
      transformTrailingWhitespace: false,
      transformNbs: false,
      transformDashes: false,
      transformQuotes: false,
      transformOther: false,
      keyboardOnly: true,
    }),
  ).toStrictEqual({
    text: 'sectionparagraph',
    count: 2,
  });
});
