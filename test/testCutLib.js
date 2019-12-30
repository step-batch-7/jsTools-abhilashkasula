const { assert } = require('chai');
const sinon = require('sinon');
const {
  cutRowsOfColumns,
  parseOptions,
  cut,
  readContent
} = require('../src/cutLib.js');

describe('cutRowsOfColumns', function() {
  it('should extract one field for only one line', function() {
    const cutOptions = { field: '2', delimiter: ':' };
    const actual = cutRowsOfColumns(['cut:this'], cutOptions);
    assert.deepStrictEqual(actual, { error: '', rowsOfColumns: 'this' });
  });

  it('should give empty line for field not found in line', function() {
    const cutOptions = { field: '4', delimiter: ':' };
    const actual = cutRowsOfColumns(['cut:this'], cutOptions);
    assert.deepStrictEqual(actual, { error: '', rowsOfColumns: '' });
  });

  it('should give whole line for delimiter not found', function() {
    const cutOptions = { field: '4', delimiter: ',' };
    const actual = cutRowsOfColumns(['cut:this'], cutOptions);
    assert.deepStrictEqual(actual, { error: '', rowsOfColumns: 'cut:this' });
  });

  it('should extract one field from each line for more than one line', () => {
    const cutOptions = { field: '2', delimiter: ':' };
    const options = ['cut:this', 'this:cut', 'hello:hi'];
    const actual = cutRowsOfColumns(options, cutOptions);
    const expected = { error: '', rowsOfColumns: 'this\ncut\nhi' };
    assert.deepStrictEqual(actual, expected);
  });
});

describe('parseOptions', function() {
  it('should give the options for cut given', function() {
    const options = ['-d', ':', '-f', '2', 'fileToCut1.txt'];
    const expected = { delimiter: ':', field: '2', filename: 'fileToCut1.txt' };
    assert.deepStrictEqual(parseOptions(options), expected);
  });

  it('should give error in the object if the field is 0', () => {
    const actual = parseOptions(['-d', ':', '-f', '0', 'filename']);
    const expected = { error: 'cut: [-cf] list: values may not include zero' };
    assert.deepStrictEqual(actual, expected);
  });

  it('should give error in the object if the field is not a number', () => {
    const actual = parseOptions(['-d', ':', '-f', 'a', 'filename']);
    const expected = { error: 'cut: [-cf] list: illegal list value' };
    assert.deepStrictEqual(actual, expected);
  });

  it('should give error in the object if the delimiter is not given', () => {
    const actual = parseOptions(['-d', '-f', '1', 'filename']);
    const expected = { error: 'cut: bad delimiter' };
    assert.deepStrictEqual(actual, expected);
  });
});

describe('readContent', function() {
  it('should give error to onComplete for file not found', function() {
    const cutOptions = { delimiter: ':', field: '2', filename: 'badFile' };
    const onComplete = sinon.spy();
    readContent.call({ cutOptions, onComplete }, 'ENOENT', '');
    const error = 'cut: badFile: No such file or directory';
    const parametersToOnComplete = {error, rowsOfColumns: ''};
    assert.isTrue(onComplete.calledWith(parametersToOnComplete));
  });

  it('should give result to onComplete when options are found in line', () => {
    const cutOptions = { delimiter: ':', field: '2', filename: 'fileToCut' };
    const onComplete = sinon.spy();
    const fileContent = 'cut:this\nthis:cut\nhello:hi';
    readContent.call( { cutOptions, onComplete }, undefined, fileContent );
    const rowsOfColumns = 'this\ncut\nhi';
    const parametersToOnComplete = {error: '', rowsOfColumns};
    assert.isTrue(onComplete.calledWith(parametersToOnComplete));
  });

  it('should give empty to onComplete for given field is not found', () => {
    const cutOptions = { delimiter: ':', field: '100', filename: 'fileToCut' };
    const onComplete = sinon.spy();
    readContent.call({ cutOptions, onComplete }, undefined, 'cut:this');
    assert.isTrue(onComplete.calledWith({error: '', rowsOfColumns: ''}));
  });

  it('should give whole line to onComplete for delimiter is not found', () => {
    const cutOptions = { delimiter: ',', field: '2', filename: 'fileToCut' };
    const onComplete = sinon.spy();
    readContent.call({ cutOptions, onComplete }, undefined, 'cut:this');
    assert(onComplete.calledWith({error: '', rowsOfColumns: 'cut:this'}));
  });
});

describe('cut', function() {
  it('should give error to onComplete for file not found', function() {
    const options = ['-d', ':', '-f', '2', 'badFile'];
    const onComplete = sinon.spy();
    const readFile = sinon.fake.yields('ENOENT', undefined);
    cut(readFile, options, onComplete);
    const error = 'cut: badFile: No such file or directory';
    assert(onComplete.calledWith({error, rowsOfColumns: ''}));
  });

  it('should give result to onComplete for given options are found', () => {
    const options = ['-d', ':', '-f', '2', 'file'];
    const onComplete = sinon.spy();
    const readFile = sinon.fake.yields(null, 'cut:this\nthis:cut');
    cut(readFile, options, onComplete);
    assert(onComplete.calledWith({error: '', rowsOfColumns: 'this\ncut'}));
  });

  it('should give empty lines to onComplete for field is not found', () => {
    const options = ['-d', ':', '-f', '100', 'file'];
    const onComplete = sinon.spy();
    const readFile = sinon.fake.yields(null, 'cut:this');
    cut(readFile, options, onComplete);
    assert(onComplete.calledWith({error: '', rowsOfColumns: ''}));
  });

  it('should give whole lines to onComplete for delimiter is not found', () => {
    const options = ['-d', ',', '-f', '1', 'file'];
    const onComplete = sinon.spy();
    const readFile = sinon.fake.yields(null, 'cut:this');
    cut(readFile, options, onComplete);
    assert(onComplete.calledWith({error: '', rowsOfColumns: 'cut:this'}));
  });

  it('should give bad delimiter error to onComplete for no delimiter', () => {
    const options = ['-d', '-f', '1', 'file'];
    const onComplete = sinon.spy();
    const readFile = sinon.fake.yields(null, 'cut:this');
    cut(readFile, options, onComplete);
    const error = 'cut: bad delimiter';
    assert(onComplete.calledWith({error, rowsOfColumns: ''}));
  });

  it('should give field zero error to onComplete for field is zero', () => {
    const options = ['-d', ':', '-f', '0', 'file'];
    const onComplete = sinon.spy();
    const readFile = sinon.fake.yields(null, 'cut:this');
    cut(readFile, options, onComplete);
    const error = 'cut: [-cf] list: values may not include zero';
    assert(onComplete.calledWith({error, rowsOfColumns: ''}));
  });
});
