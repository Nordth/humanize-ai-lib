 /**
 * RegExpI18n.ts
 * 
 * Copyright (c) Microsoft Corporation 2018. All rights reserved.
 * Licensed under the MIT license
 *
 * I18N aware, reusable helper functions and constants for work with regular expressions and strings.
 */

import Const from './Constants.js';

let nativeUSupported = true;

try {
    // tslint:disable-next-line:no-unused-expression
    new RegExp('', 'u');
} catch {
    nativeUSupported = false;
}

export const Constants = {
    LETTERS: nativeUSupported ? Const.LETTERS_ASTRAL : Const.LETTERS,
    LETTERS_AND_DIACRITICS: nativeUSupported ? Const.LETTERS_AND_DIACRITICS_ASTRAL : Const.LETTERS_AND_DIACRITICS,
    LETTERS_DIGITS_AND_DIACRITICS: nativeUSupported ? Const.LETTERS_DIGITS_AND_DIACRITICS_ASTRAL : Const.LETTERS_DIGITS_AND_DIACRITICS,
    DIACRITICS: nativeUSupported ? Const.DIACRITICS_ASTRAL : Const.DIACRITICS,
    DIGITS: nativeUSupported ? Const.DIGITS_ASTRAL : Const.DIGITS,
    IGNORABLE_SYMBOLS: nativeUSupported ? Const.IGNORABLE_SYMBOLS_ASTRAL : Const.IGNORABLE_SYMBOLS,
};

export const Patterns = {
    // Strict letter pattern. Won't match outstanding diacritics
    MATCH_LETTER: '[' + Constants.LETTERS + ']' + '[' + Constants.DIACRITICS + ']?',
    MATCH_IGNORABLE_SYMBOLS: '[' + Constants.IGNORABLE_SYMBOLS + ']',
};

interface CacheRecord {
    matchRegexp: RegExp;
    validator: RegExp;
}
const regexpCache: {[key: string]: CacheRecord} = {};

export function createRegExp(pattern: string, flags?: string) {
    let newFlags = flags ? flags : '';
    if (nativeUSupported) {
        if (newFlags.indexOf('u') === -1) {
            newFlags += 'u';
        }
    }
    return new RegExp(pattern, newFlags);
}

export function replaceNotMatching(pattern: string, replaceValue: string, text: string): string {
    let record = regexpCache[pattern];
    if (!record) {
        record = {
            matchRegexp: createRegExp(pattern + '|.', 'g'),
            validator: createRegExp(pattern)
        };
        regexpCache[pattern] = record;
    }
        
    return text.replace(record.matchRegexp, (ch) => {
        return record.validator.test(ch) ? ch : replaceValue;
    });
}
