const {assert} = require('chai');
const sinon = require('sinon');
const {
  Cut,
  parseOptions,
  performCut,
  createStream
} = require('../src/cutLib.js');

describe('Cut', function() {
  describe('cutRowsOfColumns', function() {
    it('should extract one field for only one line', function() {
      const cut = new Cut(':', '2');
      const actual = cut.cutRowsOfColumns('cut:this');
      assert.deepStrictEqual(actual, {error: '', rowsOfColumns: 'this'});
    });

    it('should give empty line for field not found in line', function() {
      const cut = new Cut(':', '4');
      const actual = cut.cutRowsOfColumns('cut:this');
      assert.deepStrictEqual(actual, {error: '', rowsOfColumns: ''});
    });

    it('should give whole line for delimiter not found', function() {
      const cut = new Cut(',', '4');
      const actual = cut.cutRowsOfColumns('cut:this');
      assert.deepStrictEqual(actual, {error: '', rowsOfColumns: 'cut:this'});
    });

    it('should extract one field from each line for more than one line', () => {
      const cut = new Cut(':', '2');
      const actual = cut.cutRowsOfColumns('cut:this\nthis:cut\nhello:hi');
      const expected = {error: '', rowsOfColumns: 'this\ncut\nhi'};
      assert.deepStrictEqual(actual, expected);
    });
  });

  describe('loadStreamContent', () => {
    let stream, onComplete;
    beforeEach(() => {
      stream = {setEncoding: sinon.fake(), on: sinon.fake()};
      onComplete = sinon.spy();
    });

    it('should give cut content to onComplete after loading from file', () => {
      const cut = new Cut(':', '1'), arg1 = 1, arg0 = 0;
      const expectedParameters = {error: '', rowsOfColumns: 'cut\nthis'};
      cut.loadStreamContent(stream, onComplete);
      stream.on.secondCall.args[arg1]('cut:this\nthis:cut');
      assert.strictEqual(stream.on.secondCall.args[arg0], 'data');
      assert.isTrue(stream.setEncoding.calledWithExactly('utf8'));
      assert.isTrue(onComplete.calledWith(expectedParameters));
    });

    it('should give empty content to onComplete for no content loaded', () => {
      const cut = new Cut(':', '1'), arg1 = 1, arg0 = 0;
      const expectedParameters = {error: '', rowsOfColumns: ''};
      cut.loadStreamContent(stream, onComplete);
      stream.on.secondCall.args[arg1]('');
      assert.strictEqual(stream.on.secondCall.args[arg0], 'data');
      assert.isTrue(stream.setEncoding.calledWithExactly('utf8'));
      assert.isTrue(onComplete.calledWith(expectedParameters));
    });

    it('should give error to onComplete for error is given', () => {
      const cut = new Cut(':', '1'), arg1 = 1, arg0 = 0;
      const error = 'cut: one.txt: No such file or directory';
      const expectedParameters = {error, rowsOfColumns: ''};
      cut.loadStreamContent(stream, onComplete);
      stream.on.firstCall.args[arg1]({path: 'one.txt'});
      assert.strictEqual(stream.on.firstCall.args[arg0], 'error');
      assert.isTrue(stream.setEncoding.calledWithExactly('utf8'));
      assert.isTrue(onComplete.calledWith(expectedParameters));
    });
  });
});

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

describe('createStream', function() {
  it('should give file stream for filename given', function() {
    const stream = {setEncoding: sinon.fake(), on: sinon.fake()};
    const createFileStream = sinon.fake.returns(stream);
    const actual = createStream('file.txt', {createFileStream});
    assert.deepStrictEqual(actual, stream);
    assert.isTrue(createFileStream.calledWith('file.txt'));
  });

  it('should give stdin stream for filename not given', function() {
    const stream = {setEncoding: sinon.fake(), on: sinon.fake()};
    const createStdinStream = sinon.fake.returns(stream);
    const actual = createStream(undefined, {createStdinStream});
    assert.deepStrictEqual(actual, stream);
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
    performCut(options, {createFileStream}, onComplete);
    stream.on.firstCall.args[arg1]({path: 'badFile.txt'});
    assert.strictEqual(stream.on.firstCall.args[arg0], 'error');
    assert.isTrue(createFileStream.calledWith('badFile.txt'));
    assert.isTrue(stream.setEncoding.calledWithExactly('utf8'));
    assert(onComplete.calledWith({error, rowsOfColumns: ''}));
  });

  it('should give result to onComplete for data event are found', () => {
    const options = ['-d', ':', '-f', '2', 'one.txt'], arg1 = 1, arg0 = 0;
    const createFileStream = sinon.fake.returns(stream);
    performCut(options, {createFileStream}, onComplete);
    stream.on.secondCall.args[arg1]('cut:this\nthis:cut');
    assert.strictEqual(stream.on.secondCall.args[arg0], 'data');
    assert.isTrue(createFileStream.calledWith('one.txt'));
    assert.isTrue(stream.setEncoding.calledWithExactly('utf8'));
    assert(onComplete.calledWith({error: '', rowsOfColumns: 'this\ncut'}));
  });

  it('should give empty lines to onComplete for field is not found', () => {
    const options = ['-d', ':', '-f', '100', 'file.txt'], arg1 = 1, arg0 = 0;
    const createFileStream = sinon.fake.returns(stream);
    performCut(options, {createFileStream}, onComplete);
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
    performCut(options, {createFileStream}, onComplete);
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
    performCut(options, {createFileStream}, onComplete);
    assert.isFalse(createFileStream.called);
    assert(onComplete.calledWith({error, rowsOfColumns: ''}));
  });

  it('should give field zero error to onComplete for field is zero', () => {
    const options = ['-d', ':', '-f', '0', 'file'];
    const createFileStream = sinon.fake.returns(stream);
    const error = 'cut: [-cf] list: values may not include zero';
    performCut(options, {createFileStream}, onComplete);
    assert.isFalse(createFileStream.called);
    assert(onComplete.calledWith({error, rowsOfColumns: ''}));
  });

  it('should give result to onComplete for stdin', () => {
    const options = ['-d', ':', '-f', '1'], arg1 = 1, arg0 = 0;
    const createStdinStream = sinon.fake.returns(stream);
    const rowsOfColumns = 'cut\nthis';
    performCut(options, {createStdinStream}, onComplete);
    stream.on.secondCall.args[arg1]('cut:this\nthis:cut');
    assert.strictEqual(stream.on.secondCall.args[arg0], 'data');
    assert.isTrue(stream.setEncoding.calledWithExactly('utf8'));
    assert(onComplete.calledWith({error: '', rowsOfColumns}));
  });
});
