const cutRowOfColumn = function(line) {
  const rowOfColumn = "";
  if (!line.includes(this.delimiter)) return line;
  const splitLine = line.split(this.delimiter);
  return splitLine[+this.field - 1] || rowOfColumn;
};

const cutRowsOfColumns = (lines, cutOptions) => {
  const error = ``;
  const replyWithRow = cutRowOfColumn.bind(cutOptions);
  const rowsOfColumns = lines.map(replyWithRow).join("\n");
  return { error, rowsOfColumns };
};

const parseOptions = options => {
  const [, delimiter, , field, filename] = options;
  if (delimiter == "-f") return { error: `cut: bad delimiter` };
  if (field == 0)
    return { error: `cut: [-cf] list: values may not include zero` };
  if (isNaN(+field)) return { error: `cut: [-cf] list: illegal list value` };
  return { delimiter, field, filename };
};

const readContent = function(err, content) {
  const { filename } = this.cutOptions;
  const rowsOfColumns = ``;
  const error = `cut: ${filename}: No such file or directory`;
  if (err) return this.onComplete({ error, rowsOfColumns });
  const lines = content.split("\n");
  this.onComplete(cutRowsOfColumns(lines, this.cutOptions));
};

const cut = (readFile, options, onComplete) => {
  const cutOptions = parseOptions(options);
  const rowsOfColumns = "";
  if (cutOptions.error) {
    onComplete({ error: cutOptions.error, rowsOfColumns });
    return;
  }
  const readFileContent = readContent.bind({ cutOptions, onComplete });
  readFile(cutOptions.filename, "utf8", readFileContent);
};

module.exports = {
  cutRowsOfColumns,
  parseOptions,
  readContent,
  cut
};
