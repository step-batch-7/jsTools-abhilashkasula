class Cut {
  constructor(delimiter, field) {
    this.delimiter = delimiter;
    this.field = +field;
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
    const replyWithColumn = this.cutColumnOfRow.bind(this);
    const rowsOfColumns = lines.map(replyWithColumn).join('\n');
    return { error, rowsOfColumns };
  }

  loadStreamContent(stream, onComplete) {
    stream.setEncoding('utf8');
    stream.on('error', error => {
      const fileError = `cut: ${error.path}: No such file or directory`;
      onComplete({ error: fileError, rowsOfColumns: '' });
    });
    stream.on('data', content => {
      onComplete(this.cutRowsOfColumns(content));
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

const performCut = (streamCreators, options, onComplete) => {
  const { delimiter, field, filename, error} = parseOptions(options);
  const rowsOfColumns = '';
  if (error) {
    return onComplete({ error, rowsOfColumns });
  }
  const cut = new Cut(delimiter, field);
  const { createStdinStream, createFileStream } = streamCreators;
  const stream = filename ? createFileStream(filename) : createStdinStream();
  cut.loadStreamContent(stream, onComplete);
};

module.exports = { parseOptions, performCut, Cut };
