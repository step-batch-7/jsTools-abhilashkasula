const extractLinePortion = function(line) {
  if (!line.includes(this.delimiter)) return line;
  const splitLine = line.split(this.delimiter);
  return splitLine[+this.field - 1] || "";
};

const cutReqPortions = (lines, cutOptions) => {
  const colZeroErr = { error: "cut: [-cf] list: values may not include zero" };
  const { field } = cutOptions;
  if (field == 0) return colZeroErr;
  if (isNaN(+field)) return { error: "cut: [-cf] list: illegal list value" };
  const cutPortions = lines.map(extractLinePortion.bind(cutOptions));
  return { cutPortions };
};

const parseOptions = options => {
  const [, delimiter, , field, filename] = options;
  return { delimiter, field, filename };
};

const readFileContent = ({ readFileSync, existsSync }, filename) => {
  if (existsSync(filename))
    return { content: readFileSync(filename, "utf8").split("\n") };
  return { error: `cut: ${filename}: No such file or directory` };
};

const generateCutLines = cutPortions => {
  return cutPortions.join("\n");
};

const cut = (fileSystem, options) => {
  const parsedOptions = parseOptions(options);
  let { content, error } = readFileContent(fileSystem, parsedOptions.filename);
  if (error) return { error };
  const linePortions = cutReqPortions(content, parsedOptions);
  if (linePortions.error) return { error: linePortions.error };
  return { cutLines: generateCutLines(linePortions.cutPortions) };
};

module.exports = {
  cutReqPortions,
  parseOptions,
  readFileContent,
  cut,
  generateCutLines
};
