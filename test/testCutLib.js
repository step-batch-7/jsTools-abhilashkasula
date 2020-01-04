const {assert} = require('chai');
const sinon = require('sinon');
const Cut = require('../src/cutLib.js');

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
