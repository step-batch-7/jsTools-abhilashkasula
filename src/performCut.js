const {
  filterUserOptions,
  readCutOptions,
  readFileName,
  readFileContent,
  parseContent,
  extractFieldsOfEveryLine,
  joinLines
} = require(`./cutLib`);

const performCut = (helpers, options) => {
  const { readFileSync, existsSync, errStream, outStream } = helpers;
  const cutOptions = readCutOptions(options);
  const filename = readFileName(options);
  let { content, error } = readFileContent(readFileSync, existsSync, filename);
  if (error) {
    errStream(error);
    return;
  }
  const parsedContent = parseContent(content);
  const fieldsOrError = extractFieldsOfEveryLine(parsedContent, cutOptions);
  if (fieldsOrError.error) {
    errStream(fieldsOrError.error);
    return;
  }
  const cutLines = joinLines(fieldsOrError.extractedLines);
  outStream(cutLines);
};

module.exports = { performCut };
