
import { test, expect } from "vitest";
import { humanizeString } from "./humanize-string.js";

test("Whitespaces", () => {
  expect(humanizeString('Hello\u200b\xa0World!  ')).toStrictEqual({
    text: 'Hello World!',
    count: 4
  });
  expect(humanizeString('Hello\u200b\xa0World!  ', {
    transformTrailingWhitespace: false
  })).toStrictEqual({
    text: 'Hello World!  ',
    count: 2
  });
  expect(humanizeString('Hello\u200b\xa0World!  ', {
    transformHidden: false
  })).toStrictEqual({
    text: 'Hello\u200b World!',
    count: 3
  });
  expect(humanizeString('Hello\u200b\xa0World!  ', {
    transformNbs: false
  })).toStrictEqual({
    text: 'Hello\xa0World!',
    count: 3
  });
});

test("Dashes", () => {
  expect(humanizeString('I — super — man – 💪')).toStrictEqual({
    text: 'I - super - man - 💪',
    count: 3
  });
})

test("Quotes", () => {
  expect(humanizeString('Angular “quote” «marks» looks„ like Christmas «« tree')).toStrictEqual({
    text: 'Angular "quote" "marks" looks" like Christmas "" tree',
    count: 7
  });
})