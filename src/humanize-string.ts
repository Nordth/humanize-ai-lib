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
};

const DefaultOptions: HumanizeStringOptions = {
  transformHidden: true,
  transformTrailingWhitespace: true,
  transformNbs: true,
  transformDashes: true,
  transformQuotes: true,
  transformOther: true,
  keyboardOnly: false,
};

export function humanizeString(
  text: string,
  options?: Partial<HumanizeStringOptions>,
): {
  count: number;
  text: string;
} {
  const use_options = { ...DefaultOptions, ...(options ? options : {}) };
  let count = 0;

  const patterns: [RegExp, string, keyof HumanizeStringOptions][] = [
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
    [/[“”«»„]/g, '"', 'transformQuotes'],
    [/[‘’ʼ]/g, "'", 'transformQuotes'],
    [/[…]/g, '...', 'transformOther'],
  ];

  for (const pattern of patterns) {
    if (use_options[pattern[2]]) {
      const matches = text.matchAll(pattern[0]);
      for (const m of matches) {
        count += m[0].length;
      }
      text = text.replace(pattern[0], pattern[1]);
    }
  }

  if (use_options.keyboardOnly) {
    const kwd_text = replaceNotMatching(
      `(${Patterns.MATCH_LETTER}|${Patterns.MATCH_IGNORABLE_SYMBOLS}|[0-9~\`?!@#№$€£%^&*()_\\-+={}\\[\\]\\\\ \n<>/.,:;"'|]|\\p{Emoji})`,
      '',
      text,
    );
    count += text.length - kwd_text.length;
    text = kwd_text;
  }

  return {
    count,
    text,
  };
}
