const { assert } = require("chai");
const {
  cutReqPortions,
  parseOptions,
  readFileContent,
  cut,
  generateCutLines
} = require("../src/cutLib.js");

describe("cutReqPortions", function() {
  it("should extract one field for only one line", function() {
    const actual = cutReqPortions(["cut:this"], {
      delimiter: ":",
      field: "2"
    });
    assert.deepStrictEqual(actual, { cutPortions: ["this"] });
  });
  it("should give empty line for field not found in line", function() {
    const actual = cutReqPortions(["cut:this"], {
      delimiter: ":",
      field: "4"
    });
    assert.deepStrictEqual(actual, { cutPortions: [""] });
  });
  it("should give whole line for delimiter not found", function() {
    const actual = cutReqPortions(["cut:this"], {
      delimiter: ",",
      field: "4"
    });
    assert.deepStrictEqual(actual, { cutPortions: ["cut:this"] });
  });
  it("should extract one field from each line for more than one line", function() {
    const actual = cutReqPortions(["cut:this", "this:cut", "hello:hi"], {
      delimiter: ":",
      field: "2"
    });
    assert.deepStrictEqual(actual, { cutPortions: ["this", "cut", "hi"] });
  });
  it(`should give error in the object if the field is 0`, () => {
    const actual = cutReqPortions(["cut"], {
      delimiter: ":",
      field: "0"
    });
    const expected = { error: "cut: [-cf] list: values may not include zero" };
    assert.deepStrictEqual(actual, expected);
  });
  it(`should give error in the object if the field is not a number`, () => {
    const actual = cutReqPortions(["cut"], {
      delimiter: ":",
      field: "a"
    });
    const expected = { error: "cut: [-cf] list: illegal list value" };
    assert.deepStrictEqual(actual, expected);
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
        content: ["cut", "this"]
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

describe("cut", function() {
  it("should give error for file not found", function() {
    const readFileSync = data => {};
    const existsSync = file => {
      assert.strictEqual(file, `badFile.txt`);
      return false;
    };
    const expected = {
      error: `cut: badFile.txt: No such file or directory`,
      cutLines: ""
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
      error: `cut: [-cf] list: values may not include zero`,
      cutLines: ""
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
      error: `cut: [-cf] list: illegal list value`,
      cutLines: ""
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
      cutLines: `this`,
      error: ""
    };
    assert.deepStrictEqual(
      cut({ readFileSync, existsSync }, ["-d", ":", "-f", "2", "cut:this"]),
      expected
    );
  });
});

describe("generateCutLines", function() {
  it("should give string representation for only one line given", function() {
    assert.strictEqual(generateCutLines(["line1"]), "line1");
  });
  it(`should give string representation for more than one line given`, () => {
    assert.strictEqual(
      generateCutLines([`line1`, `line2`, `line3`]),
      `line1\nline2\nline3`
    );
  });
});
