const cutRowOfColumn = function(line) {
  if (!line.includes(this.delimiter)) return line;
  const splitLine = line.split(this.delimiter);
  return splitLine[+this.field - 1] || "";
};

const cutRowsOfColumns = (lines, cutOptions) => {
  let rowsOfColumns = "";
  const colZeroErr = "cut: [-cf] list: values may not include zero";
  const notANumberErr = "cut: [-cf] list: illegal list value";
  const { field } = cutOptions;
  if (field == 0) return { error: colZeroErr, rowsOfColumns };
  if (isNaN(+field)) return { error: notANumberErr, rowsOfColumns };
  rowsOfColumns = lines.map(cutRowOfColumn.bind(cutOptions)).join("\n");
  return { error: "", rowsOfColumns };
};

const parseOptions = options => {
  const [, delimiter, , field, filename] = options;
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
