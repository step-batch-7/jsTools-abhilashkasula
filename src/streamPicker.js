class StreamPicker {
  constructor(createFileStream, stdin) {
    this.createFileStream = createFileStream;
    this.stdin = stdin;
  }

  pick(filename) {
    if(filename) {
      return this.createFileStream(filename);
    }
    return this.stdin;
  }
}

module.exports = StreamPicker;
