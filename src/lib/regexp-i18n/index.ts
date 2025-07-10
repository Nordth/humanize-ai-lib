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
    lastUsed: number;
}

// Enhanced cache with LRU eviction and size limits
const MAX_CACHE_SIZE = 100;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const regexpCache: Map<string, CacheRecord> = new Map();

/**
 * Validates input parameters for regexp functions
 * @param pattern - Pattern to validate
 * @param flags - Flags to validate
 * @throws Error if validation fails
 */
function validateRegexInput(pattern: unknown, flags?: unknown): void {
    if (typeof pattern !== 'string') {
        throw new TypeError(`Expected pattern to be a string, got ${typeof pattern}`);
    }
    
    if (flags !== undefined && typeof flags !== 'string') {
        throw new TypeError(`Expected flags to be a string, got ${typeof flags}`);
    }
    
    // Check for potentially dangerous patterns
    if (pattern.length === 0) {
        throw new Error('Pattern cannot be empty');
    }
    
    // Basic check for extremely long patterns that might cause performance issues
    if (pattern.length > 10000) {
        console.warn('Very long regex pattern detected, this might impact performance');
    }
}

/**
 * Validates text input for string processing functions
 * @param text - Text to validate
 * @throws Error if validation fails
 */
function validateTextInput(text: unknown): void {
    if (typeof text !== 'string') {
        throw new TypeError(`Expected text to be a string, got ${typeof text}`);
    }
}

/**
 * Clean up expired cache entries
 */
function cleanupCache(): void {
    try {
        const now = Date.now();
        const keysToDelete: string[] = [];
        
        for (const [key, record] of regexpCache.entries()) {
            if (now - record.lastUsed > CACHE_TTL) {
                keysToDelete.push(key);
            }
        }
        
        for (const key of keysToDelete) {
            regexpCache.delete(key);
        }
    } catch (error) {
        console.warn('Failed to cleanup regex cache:', error);
    }
}

/**
 * Evict least recently used entries when cache is full
 */
function evictLRU(): void {
    try {
        if (regexpCache.size <= MAX_CACHE_SIZE) {
            return;
        }
        
        let oldestKey: string | null = null;
        let oldestTime = Date.now();
        
        for (const [key, record] of regexpCache.entries()) {
            if (record.lastUsed < oldestTime) {
                oldestTime = record.lastUsed;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            regexpCache.delete(oldestKey);
        }
    } catch (error) {
        console.warn('Failed to evict LRU cache entries:', error);
    }
}

/**
 * Creates a RegExp with proper unicode support and error handling
 * @param pattern - The regex pattern
 * @param flags - Optional flags
 * @returns RegExp instance
 */
export function createRegExp(pattern: string, flags?: string): RegExp {
    try {
        validateRegexInput(pattern, flags);
        
        let newFlags = flags ? flags : '';
        if (nativeUSupported) {
            if (newFlags.indexOf('u') === -1) {
                newFlags += 'u';
            }
        }
        
        return new RegExp(pattern, newFlags);
    } catch (error) {
        console.error('Failed to create RegExp:', error);
        // Return a safe fallback regex
        return new RegExp('.*', 'g');
    }
}

/**
 * Replaces characters that don't match the pattern with a replacement value
 * @param pattern - The pattern to match against
 * @param replaceValue - Value to replace non-matching characters with
 * @param text - Text to process
 * @returns Processed text
 */
export function replaceNotMatching(pattern: string, replaceValue: string, text: string): string {
    try {
        validateRegexInput(pattern);
        validateTextInput(text);
        
        if (typeof replaceValue !== 'string') {
            throw new TypeError(`Expected replaceValue to be a string, got ${typeof replaceValue}`);
        }
        
        // Handle empty text early
        if (text.length === 0) {
            return text;
        }
        
        // Clean up cache periodically
        if (regexpCache.size > MAX_CACHE_SIZE * 1.5) {
            cleanupCache();
            evictLRU();
        }
        
        let record = regexpCache.get(pattern);
        
        if (!record || Date.now() - record.lastUsed > CACHE_TTL) {
            try {
                record = {
                    matchRegexp: createRegExp(pattern + '|.', 'g'),
                    validator: createRegExp(pattern),
                    lastUsed: Date.now()
                };
                regexpCache.set(pattern, record);
                evictLRU();
            } catch (error) {
                console.error('Failed to create cached regex:', error);
                // Fallback to non-cached processing
                const matchRegexp = createRegExp(pattern + '|.', 'g');
                const validator = createRegExp(pattern);
                
                return text.replace(matchRegexp, (ch) => {
                    try {
                        return validator.test(ch) ? ch : replaceValue;
                    } catch (testError) {
                        console.warn('Regex test failed, keeping original character:', testError);
                        return ch;
                    }
                });
            }
        } else {
            // Update last used time
            record.lastUsed = Date.now();
        }
        
        return text.replace(record.matchRegexp, (ch) => {
            try {
                return record!.validator.test(ch) ? ch : replaceValue;
            } catch (testError) {
                console.warn('Regex test failed, keeping original character:', testError);
                return ch;
            }
        });
        
    } catch (error) {
        console.error('Critical error in replaceNotMatching:', error);
        // Return original text as fallback
        return text;
    }
}

/**
 * Clears the regex cache (useful for testing or memory management)
 */
export function clearCache(): void {
    try {
        regexpCache.clear();
    } catch (error) {
        console.warn('Failed to clear regex cache:', error);
    }
}

/**
 * Gets cache statistics for monitoring
 */
export function getCacheStats(): { size: number; maxSize: number; ttl: number } {
    return {
        size: regexpCache.size,
        maxSize: MAX_CACHE_SIZE,
        ttl: CACHE_TTL
    };
}