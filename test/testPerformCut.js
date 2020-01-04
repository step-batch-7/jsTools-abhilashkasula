const {assert} = require('chai');
const sinon = require('sinon');
const {performCut, parseOptions} = require('../src/performCut');
const StreamPicker = require('../src/streamPicker');

describe('parseOptions', function() {
  it('should give the options for cut given', function() {
    const options = ['-d', ':', '-f', '2', 'fileToCut1.txt'];
    const expected = {delimiter: ':', field: '2', filename: 'fileToCut1.txt'};
    assert.deepStrictEqual(parseOptions(options), expected);
  });

  it('should give error in the object if the field is 0', () => {
    const actual = parseOptions(['-d', ':', '-f', '0', 'filename']);
    const expected = {error: 'cut: [-cf] list: values may not include zero'};
    assert.deepStrictEqual(actual, expected);
  });

  it('should give error in the object if the field is not a number', () => {
    const actual = parseOptions(['-d', ':', '-f', 'a', 'filename']);
    const expected = {error: 'cut: [-cf] list: illegal list value'};
    assert.deepStrictEqual(actual, expected);
  });

  it('should give error in the object if the delimiter is not given', () => {
    const actual = parseOptions(['-d', '-f', '1', 'filename']);
    const expected = {error: 'cut: bad delimiter'};
    assert.deepStrictEqual(actual, expected);
  });
});

describe('performCut', function() {
  let stream, onComplete;
  beforeEach(() => {
    stream = {setEncoding: sinon.fake(), on: sinon.fake()};
    onComplete = sinon.spy();
  });

  it('should give error to onComplete for triggering error event', function() {
    const options = ['-d', ':', '-f', '2', 'badFile.txt'], arg1 = 1, arg0 = 0;
    const createFileStream = sinon.fake.returns(stream);
    const error = 'cut: badFile.txt: No such file or directory';
    const streamPicker = new StreamPicker(createFileStream);
    performCut(options, streamPicker, onComplete);
    stream.on.firstCall.args[arg1]({path: 'badFile.txt'});
    assert.strictEqual(stream.on.firstCall.args[arg0], 'error');
    assert.isTrue(createFileStream.calledWith('badFile.txt'));
    assert.isTrue(stream.setEncoding.calledWithExactly('utf8'));
    assert(onComplete.calledWith({error, rowsOfColumns: ''}));
  });

  it('should give result to onComplete for data event are found', () => {
    const options = ['-d', ':', '-f', '2', 'one.txt'], arg1 = 1, arg0 = 0;
    const createFileStream = sinon.fake.returns(stream);
    const streamPicker = new StreamPicker(createFileStream);
    performCut(options, streamPicker, onComplete);
    stream.on.secondCall.args[arg1]('cut:this\nthis:cut');
    assert.strictEqual(stream.on.secondCall.args[arg0], 'data');
    assert.isTrue(createFileStream.calledWith('one.txt'));
    assert.isTrue(stream.setEncoding.calledWithExactly('utf8'));
    assert(onComplete.calledWith({error: '', rowsOfColumns: 'this\ncut'}));
  });

  it('should give empty lines to onComplete for field is not found', () => {
    const options = ['-d', ':', '-f', '100', 'file.txt'], arg1 = 1, arg0 = 0;
    const createFileStream = sinon.fake.returns(stream);
    const streamPicker = new StreamPicker(createFileStream);
    performCut(options, streamPicker, onComplete);
    stream.on.secondCall.args[arg1]('cut:this\nthis:cut');
    assert.strictEqual(stream.on.secondCall.args[arg0], 'data');
    assert.isTrue(createFileStream.calledWith('file.txt'));
    assert.isTrue(stream.setEncoding.calledWithExactly('utf8'));
    assert(onComplete.calledWith({error: '', rowsOfColumns: '\n'}));
  });

  it('should give whole lines to onComplete for delimiter is not found', () => {
    const options = ['-d', ',', '-f', '1', 'file.txt'], arg1 = 1, arg0 = 0;
    const createFileStream = sinon.fake.returns(stream);
    const rowsOfColumns = 'cut:this\nthis:cut';
    const streamPicker = new StreamPicker(createFileStream);
    performCut(options, streamPicker, onComplete);
    stream.on.secondCall.args[arg1]('cut:this\nthis:cut');
    assert.strictEqual(stream.on.secondCall.args[arg0], 'data');
    assert.isTrue(createFileStream.calledWith('file.txt'));
    assert.isTrue(stream.setEncoding.calledWithExactly('utf8'));
    assert(onComplete.calledWith({error: '', rowsOfColumns}));
  });

  it('should give bad delimiter error to onComplete for no delimiter', () => {
    const options = ['-d', '-f', '1', 'file.txt'];
    const createFileStream = sinon.fake.returns(stream);
    const error = 'cut: bad delimiter';
    const streamPicker = new StreamPicker(createFileStream);
    performCut(options, streamPicker, onComplete);
    assert.isFalse(createFileStream.called);
    assert(onComplete.calledWith({error, rowsOfColumns: ''}));
  });

  it('should give field zero error to onComplete for field is zero', () => {
    const options = ['-d', ':', '-f', '0', 'file'];
    const createFileStream = sinon.fake.returns(stream);
    const error = 'cut: [-cf] list: values may not include zero';
    const streamPicker = new StreamPicker(createFileStream);
    performCut(options, streamPicker, onComplete);
    assert.isFalse(createFileStream.called);
    assert(onComplete.calledWith({error, rowsOfColumns: ''}));
  });

  it('should give result to onComplete for stdin', () => {
    const options = ['-d', ':', '-f', '1'], arg1 = 1, arg0 = 0;
    const streamPicker = new StreamPicker(undefined, stream);
    const rowsOfColumns = 'cut\nthis';
    performCut(options, streamPicker, onComplete);
    stream.on.secondCall.args[arg1]('cut:this\nthis:cut');
    assert.strictEqual(stream.on.secondCall.args[arg0], 'data');
    assert.isTrue(stream.setEncoding.calledWithExactly('utf8'));
    assert(onComplete.calledWith({error: '', rowsOfColumns}));
  });
});
