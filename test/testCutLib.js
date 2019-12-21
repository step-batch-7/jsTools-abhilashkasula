const { assert } = require("chai");
const { joinLines, extractFieldsOfEachLine } = require("../src/cutLib.js");

describe("joinLines", function() {
  it("should give only one line without new lines for only one element in given array", function() {
    assert.strictEqual(joinLines(["cut"]), "cut");
  });
  it("should join the given lines with newLine", function() {
    assert.strictEqual(joinLines(["cut", "hello", "hi"]), "cut\nhello\nhi");
  });
});

describe("extractFieldsOfEachLine", function() {
  it("should extract fields for only one line", function() {
    const actual = extractFieldsOfEachLine(
      ["cut:this"],
      ["-d", ":", "-f", "2"]
    );
    assert.deepStrictEqual(actual, ["this"]);
  });
});
