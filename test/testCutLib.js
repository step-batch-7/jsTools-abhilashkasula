const { assert } = require("chai");
const sinon = require("sinon");
const {
  cutRowsOfColumns,
  parseOptions,
  cut,
  readContent
} = require("../src/cutLib.js");

describe("cutRowsOfColumns", function() {
  it("should extract one field for only one line", function() {
    const cutOptions = { field: "2", delimiter: ":" };
    const actual = cutRowsOfColumns(["cut:this"], cutOptions);
    assert.deepStrictEqual(actual, { error: "", rowsOfColumns: "this" });
  });

  it("should give empty line for field not found in line", function() {
    const cutOptions = { field: "4", delimiter: ":" };
    const actual = cutRowsOfColumns(["cut:this"], cutOptions);
    assert.deepStrictEqual(actual, { error: "", rowsOfColumns: "" });
  });

  it("should give whole line for delimiter not found", function() {
    const cutOptions = { field: "4", delimiter: "," };
    const actual = cutRowsOfColumns(["cut:this"], cutOptions);
    assert.deepStrictEqual(actual, { error: "", rowsOfColumns: "cut:this" });
  });

  it("should extract one field from each line for more than one line", function() {
    const cutOptions = { field: "2", delimiter: ":" };
    const actual = cutRowsOfColumns(
      ["cut:this", "this:cut", "hello:hi"],
      cutOptions
    );
    assert.deepStrictEqual(actual, {
      error: "",
      rowsOfColumns: "this\ncut\nhi"
    });
  });
});

describe("parseOptions", function() {
  it("should give the options for cut given", function() {
    const options = ["-d", ":", "-f", "2", "fileToCut1.txt"];
    const expected = { delimiter: ":", field: "2", filename: "fileToCut1.txt" };
    assert.deepStrictEqual(parseOptions(options), expected);
  });

  it(`should give error in the object if the field is 0`, () => {
    const actual = parseOptions(["-d", ":", "-f", "0", "filename"]);
    const expected = {
      error: "cut: [-cf] list: values may not include zero"
    };
    assert.deepStrictEqual(actual, expected);
  });

  it(`should give error in the object if the field is not a number`, () => {
    const actual = parseOptions(["-d", ":", "-f", "a", "filename"]);
    const expected = {
      error: "cut: [-cf] list: illegal list value"
    };
    assert.deepStrictEqual(actual, expected);
  });

  it(`should give error in the object if the delimiter is not given`, () => {
    const actual = parseOptions(["-d", "-f", "1", "filename"]);
    const expected = {
      error: "cut: bad delimiter"
    };
    assert.deepStrictEqual(actual, expected);
  });
});

describe("readContent", function() {
  it("should give error to onComplete for file not found", function() {
    const onComplete = ({ error, rowsOfColumns }) => {
      assert.strictEqual(error, `cut: badFile: No such file or directory`);
      assert.strictEqual(rowsOfColumns, "");
    };
    const cutOptions = { delimiter: ":", field: "2", filename: "badFile" };
    readContent.call({ cutOptions, onComplete }, "ENOENT", "");
  });

  it("should give result to onComplete for given delimiter and field is found", function() {
    const onComplete = ({ error, rowsOfColumns }) => {
      assert.strictEqual(error, "");
      assert.strictEqual(rowsOfColumns, `this\ncut\nhi`);
    };
    const cutOptions = { delimiter: ":", field: "2", filename: "fileToCut" };
    readContent.call(
      { cutOptions, onComplete },
      undefined,
      "cut:this\nthis:cut\nhello:hi"
    );
  });

  it("should give empty to onComplete for given field is not found", function() {
    const onComplete = ({ error, rowsOfColumns }) => {
      assert.strictEqual(error, "");
      assert.strictEqual(rowsOfColumns, ``);
    };
    const cutOptions = { delimiter: ":", field: "100", filename: "fileToCut" };
    readContent.call({ cutOptions, onComplete }, undefined, "cut:this");
  });

  it("should give whole line to onComplete for given delimiter is not found", function() {
    const onComplete = ({ error, rowsOfColumns }) => {
      assert.strictEqual(error, "");
      assert.strictEqual(rowsOfColumns, `cut:this`);
    };
    const cutOptions = { delimiter: ",", field: "2", filename: "fileToCut" };
    readContent.call({ cutOptions, onComplete }, undefined, "cut:this");
  });
});

describe("cut", function() {
  it("should give error to onComplete for file not found", function() {
    const onComplete = ({ error, rowsOfColumns }) => {
      assert.strictEqual(error, `cut: badFile: No such file or directory`);
      assert.strictEqual(rowsOfColumns, "");
    };
    const readFile = (path, encoding, callback) => {
      assert.strictEqual(path, "badFile");
      assert.strictEqual(encoding, "utf8");
      callback("ENOENT", "");
    };
    const options = ["-d", ":", "-f", "2", "badFile"];
    cut(readFile, options, onComplete);
  });

  it("should give lines cut to onComplete for given field and delimiter is found", function() {
    const onComplete = ({ error, rowsOfColumns }) => {
      assert.strictEqual(error, ``);
      assert.strictEqual(rowsOfColumns, `this\ncut`);
    };
    const readFile = (path, encoding, callback) => {
      assert.strictEqual(path, "file");
      assert.strictEqual(encoding, "utf8");
      callback(undefined, "cut:this\nthis:cut");
    };
    const options = ["-d", ":", "-f", "2", "file"];
    cut(readFile, options, onComplete);
  });

  it("should give empty lines to onComplete for given field is not found", function() {
    const onComplete = ({ error, rowsOfColumns }) => {
      assert.strictEqual(error, ``);
      assert.strictEqual(rowsOfColumns, ``);
    };
    const readFile = (path, encoding, callback) => {
      assert.strictEqual(path, "file");
      assert.strictEqual(encoding, "utf8");
      callback(undefined, "cut:this");
    };
    const options = ["-d", ":", "-f", "100", "file"];
    cut(readFile, options, onComplete);
  });

  it("should give whole lines to onComplete for given delimiter is not found", function() {
    const onComplete = ({ error, rowsOfColumns }) => {
      assert.strictEqual(error, ``);
      assert.strictEqual(rowsOfColumns, `cut:this`);
    };
    const readFile = (path, encoding, callback) => {
      assert.strictEqual(path, "file");
      assert.strictEqual(encoding, "utf8");
      callback(undefined, "cut:this");
    };
    const options = ["-d", ",", "-f", "1", "file"];
    cut(readFile, options, onComplete);
  });

  it("should give bad delimiter error to onComplete for no delimiter is given", function() {
    const onComplete = ({ error, rowsOfColumns }) => {
      assert.strictEqual(error, `cut: bad delimiter`);
      assert.strictEqual(rowsOfColumns, ``);
    };
    const readFile = (path, encoding, callback) => {
      assert.strictEqual(path, "file");
      assert.strictEqual(encoding, "utf8");
      callback(undefined, "cut:this");
    };
    const options = ["-d", "-f", "1", "file"];
    cut(readFile, options, onComplete);
  });

  it("should give field zero error to onComplete for no delimiter is given", function() {
    const onComplete = ({ error, rowsOfColumns }) => {
      assert.strictEqual(error, `cut: [-cf] list: values may not include zero`);
      assert.strictEqual(rowsOfColumns, ``);
    };
    const readFile = (path, encoding, callback) => {
      assert.strictEqual(path, "file");
      assert.strictEqual(encoding, "utf8");
      callback(undefined, "cut:this");
    };
    const options = ["-d",':', "-f", "0", "file"];
    cut(readFile, options, onComplete);
  });
});