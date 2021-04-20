import { expect } from "chai";
import { describe, it } from "mocha";
import { inspect } from "util";
import { fromSequence, isSequence } from "../../custom_game/lib/lua";

interface isSequenceTestCase {
  desc: string;
  expected: boolean;
  subjects: unknown[];
}

describe("isSequence", () => {
  const testCases: isSequenceTestCase[] = [
    {
      desc: "with incompatible types",
      expected: false,
      subjects: [
        null,
        undefined,
        true,
        false,
        NaN,
        +Infinity,
        -Infinity,
        Symbol("sym"),
        123,
        BigInt(123),
        "abc",
        [],
        [1, 2, 3],
        ["a", "b", "c"],
        () => true,
        new Date(),
        new Set([1, 2, 3]),
        new Map([[1, "a"]]),
      ],
    },
    {
      desc: "empty",
      expected: false,
      subjects: [{}],
    },
    {
      desc: "without n-length, with only non-numeric indices",
      expected: false,
      subjects: [{ a: 1, b: 2, c: 3 }],
    },
    {
      desc: "without n-length, with negative indices",
      expected: false,
      subjects: [{ "-1": "a", 0: "b", 1: "c" }],
    },
    {
      desc: "without n-length, with zero-based indices",
      expected: false,
      subjects: [
        { 0: undefined },
        { 0: null },
        { 0: "a" },
        { 0: undefined, 1: "b" },
        { 0: null, 1: "b" },
        { 0: "a", 1: "b" },
        { 0: undefined, 1: "b", a: "a" },
        { 0: null, 1: "b", a: "a" },
        { 0: "a", 1: "b", a: "a" },
        { 0: "a", 1: "b", 3: "c" },
        { 0: "a", 1: "b", 3: "c", a: "a" },
      ],
    },
    {
      desc: "without n-length, with holes",
      expected: false,
      subjects: [
        { 1: "w", 2: "x", 4: "y" },
        { 1: "y", 2: "x", 4: "w", a: "a" },
      ],
    },
    {
      desc: "without n-length, with valid indices",
      expected: true,
      subjects: [
        { 1: "y", 2: "x" },
        { 1: "y", 2: "x", a: "a" },
        { 1: "y", 2: "x", 3: "w", 4: undefined, a: "a" },
        { 1: "y", 2: "x", 3: "w", 4: null, a: "a" },
      ],
    },
    {
      desc: "with negative n-length",
      expected: false,
      subjects: [{ n: -1 }, { n: -1, 1: "a", 2: "b" }],
    },
    {
      desc: "with zero n-length",
      expected: true,
      subjects: [
        { n: 0 },
        { n: 0, 0: 1, 1: 2 },
        { n: 0, a: "a", b: "b" },
        { n: 0, 0: 1, 1: 2, a: "a", b: "b" },
        { n: 0, 1: 1, 2: 2, a: "a", b: "b" },
      ],
    },
    {
      desc: "with positive n-length, with negative indices",
      expected: false,
      subjects: [{ n: -1, "1": "b" }],
    },
    {
      desc: "with positive n-length, with zero-based indices",
      expected: false,
      subjects: [
        { n: 2, 0: "a", 1: "b" },
        { n: 2, 0: "a", 1: "b", 3: "c" },
      ],
    },
    {
      desc: "with positive n-length, with holes",
      expected: false,
      subjects: [
        { n: 1 },
        { n: 1, a: "a" },
        { n: 2, 1: "b" },
        { n: 2, 1: "b", 3: "c" },
        { n: 10, 1: "y", 2: "x" },
        { n: 10, 1: "y", 2: "x", a: "a", b: "b" },
        { n: 10, 1: "y", 2: "x", 3: "w", 4: undefined, a: "a", b: "b" },
        { n: 10, 1: "y", 2: "x", 3: "w", 4: null, a: "a", b: "b" },
      ],
    },
    {
      desc: "with positive n-length, with valid indices",
      expected: true,
      subjects: [
        { n: 1, 1: "y", 2: "x" },
        { n: 2, 1: "y", 2: "x" },
        { n: 1, 1: "y", 2: "x", a: "a", b: "b" },
        { n: 2, 1: "y", 2: "x", a: "a", b: "b" },
        { n: 1, 1: "y", 2: "x", 3: "w", 4: null, a: "a", b: "b" },
        { n: 1, 1: "y", 2: "x", 3: "w", 4: undefined, a: "a", b: "b" },
        { n: 3, 1: "y", 2: "x", 3: "w", 4: undefined, a: "a", b: "b" },
        { n: 3, 1: "y", 2: "x", 3: "w", 4: null, a: "a", b: "b" },
      ],
    },
  ];

  testCases.forEach(({ desc, expected, subjects }, caseIdx) => {
    describe(desc, () => {
      subjects.forEach((subject, subjectIdx) => {
        it(`should return ${expected}`, () => {
          const actual = isSequence(subject);
          const message = `case #${caseIdx}, subject #${subjectIdx}: ${inspect(subject)}`;

          expect(actual, message).to.equal(expected);
        });
      });
    });
  });
});

interface fromSequenceTestCase {
  desc: string;
  expected: unknown[] | null;
  subjects: unknown[];
}

describe("fromSequence", () => {
  const testCases: fromSequenceTestCase[] = [
    {
      desc: "with incompatible types",
      expected: null,
      subjects: [
        null,
        undefined,
        true,
        false,
        NaN,
        +Infinity,
        -Infinity,
        Symbol("sym"),
        123,
        BigInt(123),
        "abc",
        [],
        [1, 2, 3],
        ["a", "b", "c"],
        () => true,
        new Date(),
        new Set([1, 2, 3]),
        new Map([[1, "a"]]),
      ],
    },
    {
      desc: "empty",
      expected: null,
      subjects: [{}],
    },
    {
      desc: "without n-length, with only non-numeric indices",
      expected: null,
      subjects: [{ a: 1, b: 2, c: 3 }],
    },
    {
      desc: "without n-length, with negative indices",
      expected: null,
      subjects: [{ "-1": "a", 0: "b", 1: "c" }],
    },
    {
      desc: "without n-length, with zero-based indices",
      expected: null,
      subjects: [
        { 0: undefined },
        { 0: null },
        { 0: "a" },
        { 0: undefined, 1: "b" },
        { 0: null, 1: "b" },
        { 0: "a", 1: "b" },
        { 0: undefined, 1: "b", a: "a" },
        { 0: null, 1: "b", a: "a" },
        { 0: "a", 1: "b", a: "a" },
        { 0: "a", 1: "b", 3: "c" },
        { 0: "a", 1: "b", 3: "c", a: "a" },
      ],
    },
    {
      desc: "without n-length, with holes",
      expected: null,
      subjects: [
        { 1: "w", 2: "x", 4: "y" },
        { 1: "y", 2: "x", 4: "w", a: "a" },
      ],
    },
    {
      desc: "without n-length, with valid indices",
      expected: ["x", "y"],
      subjects: [
        { 1: "x", 2: "y" },
        { 1: "x", 2: "y", a: "a" },
      ],
    },
    {
      desc: "without n-length, with valid indices, with undefined values",
      expected: ["x", "y", "w", undefined],
      subjects: [{ 1: "x", 2: "y", 3: "w", 4: undefined, a: "a" }],
    },
    {
      desc: "without n-length, with valid indices, with null values",
      expected: ["x", "y", "w", null],
      subjects: [{ 1: "x", 2: "y", 3: "w", 4: null, a: "a" }],
    },
    {
      desc: "with negative n-length",
      expected: null,
      subjects: [{ n: -1 }, { n: -1, 1: "a", 2: "b" }],
    },
    {
      desc: "with zero n-length",
      expected: [],
      subjects: [
        { n: 0 },
        { n: 0, 0: 1, 1: 2 },
        { n: 0, a: "a", b: "b" },
        { n: 0, 0: 1, 1: 2, a: "a", b: "b" },
        { n: 0, 1: 1, 2: 2, a: "a", b: "b" },
      ],
    },
    {
      desc: "with positive n-length, with negative indices",
      expected: null,
      subjects: [{ n: -1, "1": "b" }],
    },
    {
      desc: "with positive n-length, with zero-based indices",
      expected: null,
      subjects: [
        { n: 2, 0: "a", 1: "b" },
        { n: 2, 0: "a", 1: "b", 3: "c" },
      ],
    },
    {
      desc: "with positive n-length, with holes",
      expected: null,
      subjects: [
        { n: 1 },
        { n: 1, a: "a" },
        { n: 2, 1: "b" },
        { n: 2, 1: "b", 3: "c" },
        { n: 10, 1: "x", 2: "y" },
        { n: 10, 1: "x", 2: "y", a: "a", b: "b" },
      ],
    },
    {
      desc: "with positive n-length, with valid indices, with n < max(index)",
      expected: ["x"],
      subjects: [
        { n: 1, 1: "x", 2: "y" },
        { n: 1, 1: "x", 2: "y", a: "a", b: "b" },
        { n: 1, 1: "x", 2: "y", 3: "z", 4: undefined, a: "a", b: "b" },
        { n: 1, 1: "x", 2: "y", 3: "z", 4: null, a: "a", b: "b" },
      ],
    },
    {
      desc: "with positive n-length, with valid indices, with n == max(index)",
      expected: ["x", "y"],
      subjects: [
        { n: 2, 1: "x", 2: "y" },
        { n: 2, 1: "x", 2: "y", a: "a", b: "b" },
      ],
    },
    {
      desc: "with positive n-length, with valid indices, with undefined values",
      expected: ["x", "y", undefined, "w"],
      subjects: [{ n: 4, 1: "x", 2: "y", 3: undefined, 4: "w", a: "a", b: "b" }],
    },
    {
      desc: "with positive n-length, with valid indices, with null values",
      expected: ["x", "y", null, "w"],
      subjects: [{ n: 4, 1: "x", 2: "y", 3: null, 4: "w", a: "a", b: "b" }],
    },
  ];

  testCases.forEach(({ desc, expected, subjects }, caseIdx) => {
    describe(desc, () => {
      subjects.forEach((subject, subjectIdx) => {
        const testDesc =
          expected === null ? "should return null" : "should correctly convert to array";

        it(testDesc, () => {
          const actual = fromSequence(subject);
          const message = `case #${caseIdx}, subject #${subjectIdx}`;

          if (expected === null) {
            expect(actual, message).to.be.null;
          } else {
            expect(actual, message).to.deep.equal(expected);
          }
        });
      });
    });
  });
});
