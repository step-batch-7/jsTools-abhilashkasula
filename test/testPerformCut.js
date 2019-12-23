const { assert } = require("chai");
const { performCut } = require(`../src/performCut`);

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
      performCut({ readFileSync, existsSync }, [
        "-d",
        ":",
        "-f",
        "1",
        "badFile.txt"
      ]),
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
      performCut({ readFileSync, existsSync }, [
        "-d",
        ":",
        "-f",
        "0",
        "cut:this"
      ]),
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
      performCut({ readFileSync, existsSync }, [
        "-d",
        ":",
        "-f",
        "a",
        "cut:this"
      ]),
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
      performCut({ readFileSync, existsSync }, [
        "-d",
        ":",
        "-f",
        "2",
        "cut:this"
      ]),
      expected
    );
  });
});
