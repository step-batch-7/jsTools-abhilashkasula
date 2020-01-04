const {assert} = require('chai');
const sinon = require('sinon');
const StreamPicker = require('../src/streamPicker');

describe('pick', function() {
  let stream;
  beforeEach(() => {
    stream = {on: sinon.spy(), setEncoding: sinon.spy()};
  });

  it('should give file Stream for filename given', function() {
    const createFileStream = sinon.fake.returns(stream);
    const streamPicker = new StreamPicker(createFileStream);
    assert.strictEqual(streamPicker.pick('file.txt'), stream);
    assert.isTrue(createFileStream.calledWith('file.txt'));
  });
  
  it('should give stdin Stream for filename not given', function() {
    const streamPicker = new StreamPicker(null, stream);
    assert.strictEqual(streamPicker.pick(undefined), stream);
  });
});
