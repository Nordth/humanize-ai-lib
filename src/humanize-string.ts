/**
 * https://github.com/Nordth/humanize-ai-lib
 *
 * Copyright (c) Nordth
 * Licensed under the MIT license
 *
 */

import Constants from './lib/regexp-i18n/Constants.js';
import { Patterns, replaceNotMatching } from './lib/regexp-i18n/index.js';

export type HumanizeStringOptions = {
  transformHidden: boolean;
  transformTrailingWhitespace: boolean;
  transformNbs: boolean;
  transformDashes: boolean;
  transformQuotes: boolean;
  transformOther: boolean;
  keyboardOnly: boolean;
  removeUtmSource: boolean;
  removeTrailingDot: boolean;
};

const DefaultOptions: HumanizeStringOptions = {
  transformHidden: true,
  transformTrailingWhitespace: true,
  transformNbs: true,
  transformDashes: true,
  transformQuotes: true,
  transformOther: true,
  keyboardOnly: false,
  removeUtmSource: false,
  removeTrailingDot: false,
};

/**
 * Removes UTM source parameters from URLs in the text
 * @param text - Input text containing URLs
 * @returns Object with processed text and count of changes
 */
function removeUtmSourceFromUrls(text: string): { text: string; count: number } {
  try {
    let count = 0;
    
    // More comprehensive URL regex that captures various URL formats
    const urlRegex = /https?:\/\/[^\s<>"']+/gi;
    
    const processedText = text.replace(urlRegex, (url) => {
      try {
        let cleaned = url;
        
        // Check if utm_source exists and remove it
        if (cleaned.includes('utm_source=')) {
          const beforeCount = cleaned.length;
          
          // Remove utm_source parameter
          cleaned = cleaned.replace(/(\?|&)utm_source=[^&]*(&|$)/g, (match, prefix, suffix) => {
            count++;
            if (prefix === '?' && suffix === '&') {
              // utm_source was first parameter, replace with ?
              return '?';
            } else if (prefix === '&') {
              // utm_source was not first parameter, remove completely
              return suffix === '&' ? '&' : '';
            } else if (prefix === '?' && suffix === '') {
              // utm_source was only parameter
              return '';
            }
            return '';
          });
          
          // Clean up any trailing ? or & characters
          cleaned = cleaned.replace(/[?&]$/, '');
        }
        
        return cleaned;
      } catch (error) {
        // If URL processing fails, return original URL
        console.warn('Failed to process URL:', url, error);
        return url;
      }
    });
    
    return { text: processedText, count };
  } catch (error) {
    console.warn('Failed to remove UTM sources:', error);
    return { text, count: 0 };
  }
}

/**
 * Removes trailing dots from text
 * @param text - Input text
 * @returns Object with processed text and count of changes
 */
function removeTrailingDots(text: string): { text: string; count: number } {
  try {
    const originalLength = text.length;
    const processedText = text.replace(/\.+$/g, '');
    const count = originalLength - processedText.length;
    
    return { text: processedText, count };
  } catch (error) {
    console.warn('Failed to remove trailing dots:', error);
    return { text, count: 0 };
  }
}

/**
 * Validates input parameters
 * @param text - Input text to validate
 * @param options - Options to validate
 * @throws Error if validation fails
 */
function validateInput(text: unknown, options?: unknown): void {
  if (typeof text !== 'string') {
    throw new TypeError(`Expected text to be a string, got ${typeof text}`);
  }
  
  if (options !== undefined && (typeof options !== 'object' || options === null)) {
    throw new TypeError(`Expected options to be an object, got ${typeof options}`);
  }
}

/**
 * Safely merges user options with default options
 * @param userOptions - User provided options
 * @returns Merged options object
 */
function mergeOptions(userOptions?: Partial<HumanizeStringOptions>): HumanizeStringOptions {
  try {
    if (!userOptions) {
      return { ...DefaultOptions };
    }
    
    // Create a safe copy of default options
    const merged = { ...DefaultOptions };
    
    // Only copy valid boolean properties from user options
    for (const key in userOptions) {
      if (key in DefaultOptions) {
        const value = userOptions[key as keyof HumanizeStringOptions];
        if (typeof value === 'boolean') {
          (merged as any)[key] = value;
        }
      }
    }
    
    return merged;
  } catch (error) {
    console.warn('Failed to merge options, using defaults:', error);
    return { ...DefaultOptions };
  }
}

export function humanizeString(
  text: string,
  options?: Partial<HumanizeStringOptions>,
): {
  count: number;
  text: string;
} {
  // Validate input parameters (this will throw for invalid inputs)
  validateInput(text, options);
  
  try {
    // Handle empty string early
    if (text.length === 0) {
      return { count: 0, text: '' };
    }
    
    // Safely merge options
    const use_options = mergeOptions(options);
    let count = 0;
    let processedText = text;

    // Pre-compiled patterns for better performance
    const patterns: Array<[RegExp, string, keyof HumanizeStringOptions]> = [
      [
        new RegExp(
          `[${Constants.IGNORABLE_SYMBOLS}\u00AD\u180E\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]`,
          'ug',
        ),
        '',
        'transformHidden',
      ],
      [/[ \t\x0B\f]+$/gm, '', 'transformTrailingWhitespace'],
      [/[\u00A0]/g, ' ', 'transformNbs'],
      [/[——–]/g, '-', 'transformDashes'],
      [/[""«»„]/g, '"', 'transformQuotes'],
      [/[''ʼ]/g, "'", 'transformQuotes'],
      [/[…]/g, '...', 'transformOther'],
    ];

    // Apply pattern-based transformations
    for (const [regex, replacement, optionKey] of patterns) {
      if (use_options[optionKey]) {
        try {
          const matches = Array.from(processedText.matchAll(regex));
          for (const match of matches) {
            count += match[0].length;
          }
          processedText = processedText.replace(regex, replacement);
        } catch (error) {
          console.warn(`Failed to apply pattern ${optionKey}:`, error);
        }
      }
    }

    // Apply keyboard-only filter if requested
    if (use_options.keyboardOnly) {
      try {
        const pattern = `(${Patterns.MATCH_LETTER}|${Patterns.MATCH_IGNORABLE_SYMBOLS}|[0-9~\`?!@#№$€£%^&*()_\\-+={}\\[\\]\\\\ \n<>/.,:;"'|]|\\p{Emoji})`;
        const kwd_text = replaceNotMatching(pattern, '', processedText);
        count += processedText.length - kwd_text.length;
        processedText = kwd_text;
      } catch (error) {
        console.warn('Failed to apply keyboard-only filter:', error);
      }
    }

    // Remove UTM sources from URLs if requested
    if (use_options.removeUtmSource) {
      const utmResult = removeUtmSourceFromUrls(processedText);
      processedText = utmResult.text;
      count += utmResult.count;
    }

    // Remove trailing dots if requested
    if (use_options.removeTrailingDot) {
      const dotResult = removeTrailingDots(processedText);
      processedText = dotResult.text;
      count += dotResult.count;
    }

    return {
      count,
      text: processedText,
    };
  } catch (error) {
    // If processing fails, return original text with error logged
    console.error('Critical error in humanizeString:', error);
    return {
      count: 0,
      text: typeof text === 'string' ? text : String(text),
    };
  }
}