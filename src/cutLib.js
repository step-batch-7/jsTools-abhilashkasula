const cutRowOfColumn = function(line) {
  const rowOfColumn = "";
  if (!line.includes(this.delimiter)) return line;
  const splitLine = line.split(this.delimiter);
  return splitLine[+this.field - 1] || rowOfColumn;
};

const cutRowsOfColumns = (lines, cutOptions) => {
  const error = ``;
  rowsOfColumns = lines.map(cutRowOfColumn.bind(cutOptions)).join("\n");
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

const readFileContent = ({ readFileSync, existsSync }, filename) => {
  if (existsSync(filename))
    return { lines: readFileSync(filename, "utf8").split("\n") };
  return { error: `cut: ${filename}: No such file or directory` };
};

const cut = (fileSystem, options) => {
  const rowsOfColumns = "";
  const cutOptions = parseOptions(options);
  if (cutOptions.error) return { error: cutOptions.error, rowsOfColumns };
  let { lines, error } = readFileContent(fileSystem, cutOptions.filename);
  if (error) return { error, rowsOfColumns };
  return cutRowsOfColumns(lines, cutOptions);
};

module.exports = {
  cutRowsOfColumns,
  parseOptions,
  readFileContent,
  cut
};
