const extractFieldForLine = function(line) {
  if (!line.includes(this.delimiter)) return line;
  const splitLine = line.split(this.delimiter);
  let extractedField = "";
  const lastField = splitLine[this.newField - 1];
  lastField && (extractedField = lastField);
  return extractedField;
};

const extractFieldsOfEveryLine = (lines, cutOptions) => {
  const [, delimiter, , field] = cutOptions;
  const newField = +field;
  const fieldZero = { error: "cut: [-cf] list: values may not include zero" };
  const fieldNotNumErr = { error: "cut: [-cf] list: illegal list value" };
  if (newField == 0) return fieldZero;
  if (!Number.isInteger(newField)) return fieldNotNumErr;
  const extractField = extractFieldForLine.bind({ delimiter, newField });
  const extractedLines = lines.map(extractField);
  return { extractedLines };
};

const parseContent = content => {
  return content.split(`\n`);
};

const readFileName = options => {
  const [, , , , filename] = options;
  return filename;
};

const readCutOptions = options => {
  return options.slice(0, -1);
};

const readFileContent = (readFile, isFileExists, filename) => {
  if (isFileExists(filename)) return { content: readFile(filename, "utf8") };
  return { error: `cut: ${filename}: No such file or directory` };
};

module.exports = {
  extractFieldsOfEveryLine,
  parseContent,
  readFileName,
  readCutOptions,
  readFileContent
};
