const { assert } = require('chai');
const sinon = require('sinon');
const { EventEmitter } = require('events');
const { Cut,
  parseOptions,
  performCut,
  loadStreamContent
} = require('../src/cutLib.js');

describe('Cut', function() {
  describe('cutRowsOfColumns', function() {
    it('should extract one field for only one line', function() {
      const cut = new Cut(':', '2');
      const actual = cut.cutRowsOfColumns('cut:this');
      assert.deepStrictEqual(actual, { error: '', rowsOfColumns: 'this' });
    });

    it('should give empty line for field not found in line', function() {
      const cut = new Cut(':', '4');
      const actual = cut.cutRowsOfColumns('cut:this');
      assert.deepStrictEqual(actual, { error: '', rowsOfColumns: '' });
    });

    it('should give whole line for delimiter not found', function() {
      const cut = new Cut(',', '4');
      const actual = cut.cutRowsOfColumns('cut:this');
      assert.deepStrictEqual(actual, { error: '', rowsOfColumns: 'cut:this' });
    });

    it('should extract one field from each line for more than one line', () => {
      const cut = new Cut(':', '2');
      const actual = cut.cutRowsOfColumns('cut:this\nthis:cut\nhello:hi');
      const expected = { error: '', rowsOfColumns: 'this\ncut\nhi' };
      assert.deepStrictEqual(actual, expected);
    });
  });

  describe('cutColumnOfRow', function() {
    it('should give the field given from the line', () => {
      const cut = new Cut(':', '2');
      assert.strictEqual(cut.cutColumnOfRow('cut:this'), 'this');
    });
    
    it('should give empty field for the given column number not found', () => {
      const cut = new Cut(':', '10');
      assert.strictEqual(cut.cutColumnOfRow('cut:this'), '');
    });

    it('should give whole line field for the given delimiter not found', () => {
      const cut = new Cut(',', '1');
      assert.strictEqual(cut.cutColumnOfRow('cut:this'), 'cut:this');
    });
  });

  describe('loadStreamContent', () => {
    it('should give cut content to onComplete after loading from file', () => {
      const cut = new Cut(':', '1');
      const fileStream = new EventEmitter();
      const onComplete = sinon.spy();
      loadStreamContent.call(cut, fileStream, onComplete);
      fileStream.emit('data', 'cut:this\nthis:cut');
      const rowsOfColumns = 'cut\nthis';
      const parametersToOnComplete = { error: '', rowsOfColumns };
      assert.isTrue(onComplete.calledWith(parametersToOnComplete));
    });

    it('should give empty content to onComplete for no content loaded', () => {
      const cut = new Cut(':', '1');
      const fileStream = new EventEmitter();
      const onComplete = sinon.spy();
      loadStreamContent.call(cut, fileStream, onComplete);
      fileStream.emit('data', '');
      const rowsOfColumns = '';
      const parametersToOnComplete = { error: '', rowsOfColumns };
      assert.isTrue(onComplete.calledWith(parametersToOnComplete));
    });

    it('should give error to onComplete for error is given', () => {
      const cut = new Cut(':', '1');
      const fileStream = new EventEmitter();
      const onComplete = sinon.spy();
      loadStreamContent.call(cut, fileStream, onComplete);
      fileStream.emit('error', {path: 'one.txt'});
      const error = 'cut: one.txt: No such file or directory';
      const parametersToOnComplete = { error, rowsOfColumns: '' };
      assert.isTrue(onComplete.calledWith(parametersToOnComplete));
    });
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

describe('performCut', function() {
  it('should give error to onComplete for triggering error event', function() {
    const options = ['-d', ':', '-f', '2', 'badFile.txt'];
    const onComplete = sinon.spy();
    const fileReadStream = new EventEmitter();
    const fileStream = sinon.fake.returns(fileReadStream);
    const stdin = new EventEmitter();
    performCut({ fileStream, stdin }, options, onComplete);
    fileReadStream.emit('error', {path: 'badFile.txt'});
    const error = 'cut: badFile.txt: No such file or directory';
    assert(onComplete.calledWith({error, rowsOfColumns: ''}));
  });

  it('should give result to onComplete for data event are found', () => {
    const options = ['-d', ':', '-f', '2', 'file'];
    const onComplete = sinon.spy();
    const fileReadStream = new EventEmitter();
    const fileStream = sinon.fake.returns(fileReadStream);
    const stdin = new EventEmitter();
    performCut({ fileStream, stdin }, options, onComplete);
    fileReadStream.emit('data', 'cut:this\nthis:cut');
    assert(onComplete.calledWith({error: '', rowsOfColumns: 'this\ncut'}));
  });

  it('should give empty lines to onComplete for field is not found', () => {
    const options = ['-d', ':', '-f', '100', 'file'];
    const onComplete = sinon.spy();
    const fileReadStream = new EventEmitter();
    const fileStream = sinon.fake.returns(fileReadStream);
    const stdin = new EventEmitter();
    performCut({ fileStream, stdin }, options, onComplete);
    fileReadStream.emit('data', 'cut:this\nthis:cut');
    assert(onComplete.calledWith({ error: '', rowsOfColumns: '\n' }));
  });

  it('should give whole lines to onComplete for delimiter is not found', () => {
    const options = ['-d', ',', '-f', '1', 'file'];
    const onComplete = sinon.spy();
    const fileReadStream = new EventEmitter();
    const fileStream = sinon.fake.returns(fileReadStream);
    const stdin = new EventEmitter();
    performCut({ fileStream, stdin }, options, onComplete);
    fileReadStream.emit('data', 'cut:this\nthis:cut');
    const rowsOfColumns = 'cut:this\nthis:cut';
    assert(onComplete.calledWith({ error: '', rowsOfColumns }));
  });

  it('should give bad delimiter error to onComplete for no delimiter', () => {
    const options = ['-d', '-f', '1', 'file'];
    const onComplete = sinon.spy();
    const fileReadStream = new EventEmitter();
    const fileStream = sinon.fake.returns(fileReadStream);
    const stdin = new EventEmitter();
    performCut({ fileStream, stdin }, options, onComplete);
    fileReadStream.emit('data', 'cut:this\nthis:cut');
    const error = 'cut: bad delimiter';
    assert(onComplete.calledWith({ error, rowsOfColumns: '' }));
  });

  it('should give field zero error to onComplete for field is zero', () => {
    const options = ['-d', ':', '-f', '0', 'file'];
    const onComplete = sinon.spy();
    const fileReadStream = new EventEmitter();
    const fileStream = sinon.fake.returns(fileReadStream);
    const stdin = new EventEmitter();
    performCut({ fileStream, stdin }, options, onComplete);
    fileReadStream.emit('data', 'cut:this\nthis:cut');
    const error = 'cut: [-cf] list: values may not include zero';
    assert(onComplete.calledWith({ error, rowsOfColumns: '' }));
  });

  it('should give result to onComplete for stdin', () => {
    const options = ['-d', ':', '-f', '1'];
    const onComplete = sinon.spy();
    const fileReadStream = new EventEmitter();
    const fileStream = sinon.fake.returns(fileReadStream);
    const stdin = new EventEmitter();
    performCut({ fileStream, stdin }, options, onComplete);
    stdin.emit('data', 'cut:this\nthis:cut');
    const rowsOfColumns = 'cut\nthis';
    assert(onComplete.calledWith({ error: '', rowsOfColumns }));
  });
});
