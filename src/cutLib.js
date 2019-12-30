class Cut {
  constructor({ delimiter, field, filename }) {
    this.delimiter = delimiter;
    this.field = +field;
    this.filename = filename;
  }

  cutColumnOfRow(line) {
    const rowOfColumn = '';
    const extraField = 1;
    if (!line.includes(this.delimiter)) {
      return line;
    }
    const splitLine = line.split(this.delimiter);
    return splitLine[this.field - extraField] || rowOfColumn;
  }

  cutRowsOfColumns(content) {
    const error = '';
    const lines = content.split('\n');
    const replyWithRow = this.cutColumnOfRow.bind(this);
    const rowsOfColumns = lines.map(replyWithRow).join('\n');
    return { error, rowsOfColumns };
  }

  loadStreamContent(stream, onComplete) {
    stream.on('error', () => {
      const error = `cut: ${this.filename}: No such file or directory`;
      onComplete({ error, rowsOfColumns: '' });
    });
    stream.on('data', content => {
      onComplete(this.cutRowsOfColumns(''+content));
    });
  }
}

const parseOptions = options => {
  const [, delimiter, , field, filename] = options;
  if (delimiter === '-f') {
    return { error: 'cut: bad delimiter' };
  }
  if (field === '0') {
    return { error: 'cut: [-cf] list: values may not include zero' };
  }
  if (isNaN(+field)) {
    return { error: 'cut: [-cf] list: illegal list value' };
  }
  return { delimiter, field, filename };
};

const cut = (readStreams, options, onComplete) => {
  const cutOptions = parseOptions(options);
  const rowsOfColumns = '';
  if (cutOptions.error) {
    return onComplete({ error: cutOptions.error, rowsOfColumns });
  }
  const cutLines = new Cut(cutOptions);
  const {fileStream, stdin} = readStreams;
  const inputStream = cutLines.filename ? fileStream(cutLines.filename) : stdin;
  cutLines.loadStreamContent(inputStream, onComplete);
};

module.exports = { parseOptions, cut, Cut };
