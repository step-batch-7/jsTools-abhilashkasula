const cutField = (field, delimiter, line) => {
  const rowOfColumn = '';
  const extraField = 1;
  if (!line.includes(delimiter)) {
    return line;
  }
  const splitLine = line.split(delimiter);
  return splitLine[field - extraField] || rowOfColumn;
};

class Cut {
  constructor(delimiter, field) {
    this.delimiter = delimiter;
    this.field = +field;
  }

  cutRowsOfColumns(content) {
    const error = '';
    const lines = content.split('\n');
    const replyWithColumn = cutField.bind(null, this.field, this.delimiter);
    const rowsOfColumns = lines.map(replyWithColumn).join('\n');
    return {error, rowsOfColumns};
  }

  loadStreamContent(stream, onComplete) {
    stream.setEncoding('utf8');
    stream.on('error', error => {
      const fileError = `cut: ${error.path}: No such file or directory`;
      onComplete({error: fileError, rowsOfColumns: ''});
    });
    stream.on('data', content => {
      onComplete(this.cutRowsOfColumns(content));
    });
  }
}

module.exports = Cut;
