const { assert } = require("chai");
const {
  extractFieldsOfEveryLine,
  parseContent,
  parseOptions,
  readFileContent,
  cut
} = require("../src/cutLib.js");

describe("extractFieldsOfEveryLine", function() {
  it("should extract one field for only one line", function() {
    const actual = extractFieldsOfEveryLine(["cut:this"], {
      delimiter: ":",
      field: "2"
    });
    assert.deepStrictEqual(actual, { extractedLines: ["this"] });
  });
  it("should give empty line for field not found in line", function() {
    const actual = extractFieldsOfEveryLine(["cut:this"], {
      delimiter: ":",
      field: "4"
    });
    assert.deepStrictEqual(actual, { extractedLines: [""] });
  });
  it("should give whole line for delimiter not found", function() {
    const actual = extractFieldsOfEveryLine(["cut:this"], {
      delimiter: ",",
      field: "4"
    });
    assert.deepStrictEqual(actual, { extractedLines: ["cut:this"] });
  });
  it("should extract one field from each line for more than one line", function() {
    const actual = extractFieldsOfEveryLine(
      ["cut:this", "this:cut", "hello:hi"],
      { delimiter: ":", field: "2" }
    );
    assert.deepStrictEqual(actual, { extractedLines: ["this", "cut", "hi"] });
  });
  it(`should give error in the object if the field is 0`, () => {
    const actual = extractFieldsOfEveryLine(["cut"], {
      delimiter: ":",
      field: "0"
    });
    const expected = { error: "cut: [-cf] list: values may not include zero" };
    assert.deepStrictEqual(actual, expected);
  });
  it(`should give error in the object if the field is not a number`, () => {
    const actual = extractFieldsOfEveryLine(["cut"], {
      delimiter: ":",
      field: "a"
    });
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

describe("parseOptions", function() {
  it("should give the options for cut given", function() {
    const options = ["-d", ":", "-f", "2", "fileToCut1.txt"];
    const expected = { delimiter: ":", field: "2", filename: "fileToCut1.txt" };
    assert.deepStrictEqual(parseOptions(options), expected);
  });
});

describe("readFileContent", function() {
  it("should give the same data given", function() {
    const readFileSync = data => {
      assert.strictEqual(data, "cut\nthis");
      return data;
    };
    const existsSync = filename =>
      assert.strictEqual(filename, "cut\nthis") || true;
    assert.deepStrictEqual(
      readFileContent({ readFileSync, existsSync }, "cut\nthis"),
      {
        content: "cut\nthis"
      }
    );
  });
  it("should throw an error for the file not exists", function() {
    const readFileSync = data => {
      assert.strictEqual(data, "cut\nthis");
      return data;
    };
    const existsSync = filename =>
      assert.strictEqual(filename, "file") || false;
    assert.deepStrictEqual(
      readFileContent({ readFileSync, existsSync }, "file"),
      {
        error: `cut: file: No such file or directory`
      }
    );
  });
});

describe("performCut", function() {
  it("should give error for file not found", function() {
    const readFileSync = data => {};
    const existsSync = file => {
      assert.strictEqual(file, `badFile.txt`);
      return false;
    };
    const expected = {
      error: `cut: badFile.txt: No such file or directory`
    };
    assert.deepStrictEqual(
      cut({ readFileSync, existsSync }, ["-d", ":", "-f", "1", "badFile.txt"]),
      expected
    );
  });
  it("should give error for field list is zero", function() {
    const readFileSync = data => {
      assert.strictEqual(data, "cut:this");
      return data;
    };
    const existsSync = file => {
      assert.strictEqual(file, `cut:this`);
      return true;
    };
    const expected = {
      error: `cut: [-cf] list: values may not include zero`
    };
    assert.deepStrictEqual(
      cut({ readFileSync, existsSync }, ["-d", ":", "-f", "0", "cut:this"]),
      expected
    );
  });
  it("should give error for field list is string", function() {
    const readFileSync = data => {
      assert.strictEqual(data, "cut:this");
      return data;
    };
    const existsSync = file => {
      assert.strictEqual(file, `cut:this`);
      return true;
    };
    const expected = {
      error: `cut: [-cf] list: illegal list value`
    };
    assert.deepStrictEqual(
      cut({ readFileSync, existsSync }, ["-d", ":", "-f", "a", "cut:this"]),
      expected
    );
  });
  it("should give 2nd fields of the lines", function() {
    const readFileSync = data => {
      assert.strictEqual(data, "cut:this");
      return data;
    };
    const existsSync = file => {
      assert.strictEqual(file, `cut:this`);
      return true;
    };
    const expected = {
      cutLines: `this`
    };
    assert.deepStrictEqual(
      cut({ readFileSync, existsSync }, ["-d", ":", "-f", "2", "cut:this"]),
      expected
    );
  });
});
