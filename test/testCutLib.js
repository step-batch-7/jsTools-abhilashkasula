const { assert } = require("chai");
const {
  joinLines,
  extractFieldsOfEveryLine,
  parseContent,
  readFileName
} = require("../src/cutLib.js");

describe("joinLines", function() {
  it("should give only one line without new lines for only one element in given array", function() {
    assert.strictEqual(joinLines(["cut"]), "cut");
  });
  it("should join the given lines with newLine", function() {
    assert.strictEqual(joinLines(["cut", "hello", "hi"]), "cut\nhello\nhi");
  });
});

describe("extractFieldsOfEveryLine", function() {
  it("should extract one field for only one line", function() {
    const actual = extractFieldsOfEveryLine(
      ["cut:this"],
      ["-d", ":", "-f", "2"]
    );
    assert.deepStrictEqual(actual, { extractedLines: ["this"] });
  });
  it("should give empty line for field not found in line", function() {
    const actual = extractFieldsOfEveryLine(
      ["cut:this"],
      ["-d", ":", "-f", "4"]
    );
    assert.deepStrictEqual(actual, { extractedLines: [""] });
  });
  it("should give whole line for delimiter not found", function() {
    const actual = extractFieldsOfEveryLine(
      ["cut:this"],
      ["-d", ",", "-f", "4"]
    );
    assert.deepStrictEqual(actual, { extractedLines: ["cut:this"] });
  });
  it("should extract one field from each line for more than one line", function() {
    const actual = extractFieldsOfEveryLine(
      ["cut:this", "this:cut", "hello:hi"],
      ["-d", ":", "-f", "2"]
    );
    assert.deepStrictEqual(actual, { extractedLines: ["this", "cut", "hi"] });
  });
  it(`should give error in the object if the field is 0`, () => {
    const actual = extractFieldsOfEveryLine(["cut"], ["-d", ":", "-f", "0"]);
    const expected = { error: "cut: [-cf] list: illegal list value" };
    assert.deepStrictEqual(actual, expected);
  });
  it(`should give error in the object if the field is not a number`, () => {
    const actual = extractFieldsOfEveryLine(["cut"], ["-d", ":", "-f", "a"]);
    const expected = { error: "cut: [-cf] list: illegal list value" };
    assert.deepStrictEqual(actual, expected);
  });
});

describe("parseContent", function() {
  it("should give only one line for no new line character in the given string", function() {
    assert.deepStrictEqual(parseContent(`cut`), ["cut"]);
  });
  it(`should give two lines in an array for only one new line character in the given string`, () => {
    assert.deepStrictEqual(parseContent(`cut\nthis`), ["cut", "this"]);
  });
  it(`should give lines in an array for more than one new line character in the given string`, () => {
    assert.deepStrictEqual(parseContent(`cut\nthis\nright\nnow`), [
      "cut",
      "this",
      "right",
      "now"
    ]);
  });
});

describe("readFileName", function() {
  it("should give filename for the given options", function() {
    const options = ["-d", ":", "-f", "2", "fileToCut1.txt"];
    assert.strictEqual(readFileName(options), "fileToCut1.txt");
  });
});
