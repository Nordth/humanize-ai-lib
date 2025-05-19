# Humanize AI Lib

![NPM Version](https://img.shields.io/npm/v/humanize-ai-lib)

## Why Clean Up GPT Text?

AI-generated content often contains subtle markers that make it obvious to readers (and algorithms) that the text wasn't written by a human:

Em-dashes (—) instead of regular dash (-)
Fancy quotes (“ ”) instead of standard ones (")
Unnecessary whitespace or hidden Unicode characters
And other symbols
Cleaning these up makes the text flow more naturally, improving readability and keeping readers engaged.

This package contains humanization function used on http://humanize-ai.click/

## Usage

Usage is simple:

```ts
import { humanizeString } from 'humanize-ai-lib';

const result = humanizeString(inputText, options);

console.log(result.text); // Humanized text
console.log(result.count); // Count of changed symbols
```

Options:

| Parameter                     | Type      | Default | Description                                                                                             |
| ----------------------------- | --------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `transformHidden`             | `boolean` | `true`  | Removes hidden unicode symbols                                                                          |
| `transformTrailingWhitespace` | `boolean` | `true`  | Removes spaces at the end of line                                                                       |
| `transformNbs`                | `boolean` | `true`  | Replaces **Non-Breaking Space** character with regular space                                            |
| `transformDashes`             | `boolean` | `true`  | Replaces fancy dashes with regular dash (-)                                                             |
| `transformQuotes`             | `boolean` | `true`  | Replaces fancy single and double quotes with regular quotes (' and ")                                   |
| `transformOther`              | `boolean` | `true`  | Replaces `…` with `...`                                                                                 |
| `keyboardOnly`                | `boolean` | `false` | Removes all symbols that cannot be typed with regular keyboard. Applied after all other transformations |

## About me

Made with 💗 by [Nordthx](https://www.reddit.com/user/Nordthx/)

Check out my other project [IMS Creators](https://ims.cr5.space/) - game design editor & project management for game developers

## License

MIT
