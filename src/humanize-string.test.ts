import { test, expect, describe } from 'vitest';
import { humanizeString } from './humanize-string.js';

describe('Existing functionality', () => {
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

  test('Dashes', () => {
    expect(humanizeString('I — super — man – 💪')).toStrictEqual({
      text: 'I - super - man - 💪',
      count: 3,
    });
  });

  test('Quotes', () => {
    expect(
      humanizeString('Angular "quote" «marks» looks„ like Christmas «« tree'),
    ).toStrictEqual({
      text: 'Angular "quote" "marks" looks" like Christmas "" tree',
      count: 7,
    });
  });
});

describe('UTM Source Removal', () => {
  test('Basic UTM source removal', () => {
    const input = 'Check this out: https://de.wikipedia.org/wiki/BorgWarner?utm_source=chatgpt.com';
    const result = humanizeString(input, { removeUtmSource: true });
    
    expect(result.text).toBe('Check this out: https://de.wikipedia.org/wiki/BorgWarner');
    expect(result.count).toBeGreaterThan(0);
  });

  test('UTM source with additional parameters', () => {
    const input = 'Visit https://example.com?param1=value1&utm_source=chatgpt.com&param2=value2';
    const result = humanizeString(input, { removeUtmSource: true });
    
    expect(result.text).toBe('Visit https://example.com?param1=value1&param2=value2');
    expect(result.count).toBeGreaterThan(0);
  });

  test('UTM source at the end of URL', () => {
    const input = 'Check https://example.com?param1=value1&utm_source=chatgpt.com';
    const result = humanizeString(input, { removeUtmSource: true });
    
    expect(result.text).toBe('Check https://example.com?param1=value1');
    expect(result.count).toBeGreaterThan(0);
  });

  test('UTM source as only parameter', () => {
    const input = 'Visit https://example.com?utm_source=chatgpt.com';
    const result = humanizeString(input, { removeUtmSource: true });
    
    expect(result.text).toBe('Visit https://example.com');
    expect(result.count).toBeGreaterThan(0);
  });

  test('Multiple URLs with UTM sources', () => {
    const input = 'First: https://site1.com?utm_source=test and second: https://site2.com?utm_source=another';
    const result = humanizeString(input, { removeUtmSource: true });
    
    expect(result.text).toBe('First: https://site1.com and second: https://site2.com');
    expect(result.count).toBeGreaterThan(0);
  });

  test('URL without UTM source (no change)', () => {
    const input = 'Visit https://example.com?param=value';
    const result = humanizeString(input, { removeUtmSource: true });
    
    expect(result.text).toBe('Visit https://example.com?param=value');
    expect(result.count).toBe(0);
  });

  test('Text without URLs (no change)', () => {
    const input = 'This is just plain text without any URLs';
    const result = humanizeString(input, { removeUtmSource: true });
    
    expect(result.text).toBe('This is just plain text without any URLs');
    expect(result.count).toBe(0);
  });

  test('UTM source removal disabled by default', () => {
    const input = 'Check https://example.com?utm_source=chatgpt.com';
    const result = humanizeString(input);
    
    expect(result.text).toBe('Check https://example.com?utm_source=chatgpt.com');
  });
});

describe('Trailing Dot Removal', () => {
  test('Single trailing dot', () => {
    const input = 'This is a sentence.';
    const result = humanizeString(input, { removeTrailingDot: true });
    
    expect(result.text).toBe('This is a sentence');
    expect(result.count).toBe(1);
  });

  test('Multiple trailing dots', () => {
    const input = 'This is a sentence...';
    const result = humanizeString(input, { removeTrailingDot: true });
    
    expect(result.text).toBe('This is a sentence');
    expect(result.count).toBe(3);
  });

  test('No trailing dots (no change)', () => {
    const input = 'This is a sentence';
    const result = humanizeString(input, { removeTrailingDot: true });
    
    expect(result.text).toBe('This is a sentence');
    expect(result.count).toBe(0);
  });

  test('Dots in middle of text (preserved)', () => {
    const input = 'This is a sentence. With more text.';
    const result = humanizeString(input, { removeTrailingDot: true });
    
    expect(result.text).toBe('This is a sentence. With more text');
    expect(result.count).toBe(1);
  });

  test('Only dots', () => {
    const input = '...';
    const result = humanizeString(input, { removeTrailingDot: true });
    
    expect(result.text).toBe('');
    expect(result.count).toBe(3);
  });

  test('Trailing dot removal disabled by default', () => {
    const input = 'This is a sentence.';
    const result = humanizeString(input);
    
    expect(result.text).toBe('This is a sentence.');
  });
});

describe('Combined Features', () => {
  test('UTM source removal and trailing dot removal together', () => {
    const input = 'Check out https://example.com?utm_source=chatgpt.com for more info.';
    const result = humanizeString(input, { 
      removeUtmSource: true, 
      removeTrailingDot: true 
    });
    
    expect(result.text).toBe('Check out https://example.com for more info');
    expect(result.count).toBeGreaterThan(1);
  });

  test('All transformations enabled', () => {
    const input = 'Check — https://example.com?utm_source=test — "amazing" site...';
    const result = humanizeString(input, {
      transformDashes: true,
      transformQuotes: true,
      removeUtmSource: true,
      removeTrailingDot: true
    });
    
    expect(result.text).toBe('Check - https://example.com - "amazing" site');
    expect(result.count).toBeGreaterThan(0);
  });
});

describe('Error Handling', () => {
  test('Invalid input type throws error', () => {
    expect(() => {
      // @ts-expect-error - Testing invalid input
      humanizeString(123);
    }).toThrow(TypeError);
  });

  test('Invalid options type throws error', () => {
    expect(() => {
      // @ts-expect-error - Testing invalid options
      humanizeString('test', 'invalid');
    }).toThrow(TypeError);
  });

  test('Empty string handling', () => {
    const result = humanizeString('');
    expect(result).toStrictEqual({ count: 0, text: '' });
  });

  test('Null options handling', () => {
    const result = humanizeString('test', undefined);
    expect(result.text).toBe('test');
  });

  test('Partial options handling', () => {
    const result = humanizeString('test...', { removeTrailingDot: true });
    expect(result.text).toBe('test');
    expect(result.count).toBe(3);
  });

  test('Invalid boolean options are ignored', () => {
    const result = humanizeString('test...', { 
      removeTrailingDot: true,
      // @ts-expect-error - Testing invalid option value
      invalidOption: 'not a boolean'
    });
    expect(result.text).toBe('test');
  });
});

describe('Performance and Edge Cases', () => {
  test('Large text processing', () => {
    const largeText = 'a'.repeat(10000) + '...';
    const result = humanizeString(largeText, { removeTrailingDot: true });
    
    expect(result.text).toBe('a'.repeat(10000));
    expect(result.count).toBe(3);
  });

  test('Complex URLs with special characters', () => {
    const input = 'Check https://example.com/path?param1=value1&utm_source=test%20source&param2=value2#anchor';
    const result = humanizeString(input, { removeUtmSource: true });
    
    expect(result.text).toBe('Check https://example.com/path?param1=value1&param2=value2#anchor');
  });

  test('Multiple transformations with count accuracy', () => {
    const input = 'Text—with""special…chars https://test.com?utm_source=x.';
    const result = humanizeString(input, {
      transformDashes: true,
      transformQuotes: true,
      transformOther: true,
      removeUtmSource: true,
      removeTrailingDot: true
    });
    
    expect(result.text).toBe('Text-with""special...chars https://test.com');
    expect(result.count).toBeGreaterThan(0);
  });
});