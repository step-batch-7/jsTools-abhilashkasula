const {
  readCutOptions,
  readFileName,
  readFileContent,
  parseContent,
  extractFieldsOfEveryLine,
  joinLines
} = require(`./cutLib`);

const performCut = (helpers, options) => {
  const { readFileSync, existsSync } = helpers;
  const cutOptions = readCutOptions(options);
  const filename = readFileName(options);
  let { content, error } = readFileContent(readFileSync, existsSync, filename);
  if (error) return { error };
  const parsedContent = parseContent(content);
  const fieldsOrError = extractFieldsOfEveryLine(parsedContent, cutOptions);
  if (fieldsOrError.error) return { error: fieldsOrError.error };
  const cutLines = joinLines(fieldsOrError.extractedLines);
  return { cutLines };
};

module.exports = { performCut };
