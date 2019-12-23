const joinLines = extractedFields => extractedFields.join("\n");

const extractFieldForLine = function(line) {
  if (!line.includes(this.delimiter)) return line;
  const splitLine = line.split(this.delimiter);
  let extractedField = "";
  splitLine[this.newField - 1] &&
    (extractedField = splitLine[this.newField - 1]);
  return extractedField;
};

const extractFieldsOfEveryLine = (lines, cutOptions) => {
  const [, delimiter, , field] = cutOptions;
  const newField = +field;
  if (newField == 0 || !Number.isInteger(newField))
    return { error: "cut: [-cf] list: illegal list value" };
  return {
    extractedLines: lines.map(extractFieldForLine.bind({ delimiter, newField }))
  };
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

const filterUserOptions = cmdLineArgs => {
  return cmdLineArgs.slice(2);
};

module.exports = {
  joinLines,
  extractFieldsOfEveryLine,
  parseContent,
  readFileName,
  readCutOptions,
  filterUserOptions
};
