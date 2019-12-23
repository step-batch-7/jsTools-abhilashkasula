const extractLinePortion = function(line) {
  if (!line.includes(this.delimiter)) return line;
  const splitLine = line.split(this.delimiter);
  return splitLine[+this.field - 1] || "";
};

const extractFieldsOfEveryLine = (lines, cutOptions) => {
  const fieldZero = { error: "cut: [-cf] list: values may not include zero" };
  const { field } = cutOptions;
  if (+field == 0) return fieldZero;
  if (isNaN(+field)) return { error: "cut: [-cf] list: illegal list value" };
  const extractedLines = lines.map(extractLinePortion.bind(cutOptions));
  return { extractedLines };
};

const parseContent = content => {
  return content.split(`\n`);
};

const parseOptions = options => {
  const [, delimiter, , field, filename] = options;
  return { delimiter, field, filename };
};

const readFileContent = ({ readFileSync, existsSync }, filename) => {
  if (existsSync(filename)) return { content: readFileSync(filename, "utf8") };
  return { error: `cut: ${filename}: No such file or directory` };
};

const cut = (fileSys, options) => {
  const parsedOptions = parseOptions(options);
  let { content, error } = readFileContent(fileSys, parsedOptions.filename);
  if (error) return { error };
  const parsedContent = parseContent(content);
  const linePortions = extractFieldsOfEveryLine(parsedContent, parsedOptions);
  if (linePortions.error) return { error: linePortions.error };
  const cutLines = linePortions.extractedLines.join("\n");
  return { cutLines };
};

module.exports = {
  extractFieldsOfEveryLine,
  parseContent,
  parseOptions,
  readFileContent,
  cut
};
