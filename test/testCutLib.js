const { assert } = require("chai");
const {
  joinLines,
  extractFieldsOfEveryLine,
  parseContent
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
    assert.deepStrictEqual(actual, ["this"]);
  });
  it("should give empty line for field not found in line", function() {
    const actual = extractFieldsOfEveryLine(
      ["cut:this"],
      ["-d", ":", "-f", "4"]
    );
    assert.deepStrictEqual(actual, [""]);
  });
  it("should give whole line for delimiter not found", function() {
    const actual = extractFieldsOfEveryLine(
      ["cut:this"],
      ["-d", ",", "-f", "4"]
    );
    assert.deepStrictEqual(actual, ["cut:this"]);
  });
  it("should extract one field from each line for more than one line", function() {
    const actual = extractFieldsOfEveryLine(
      ["cut:this", "this:cut", "hello:hi"],
      ["-d", ":", "-f", "2"]
    );
    assert.deepStrictEqual(actual, ["this", "cut", "hi"]);
  });
});

describe("parseContent", function() {
  it("should only one line for no new line character in the given string", function() {
    assert.deepStrictEqual(parseContent(`cut`), ["cut"]);
  });
});
