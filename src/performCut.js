const {
  readCutOptions,
  readFileName,
  readFileContent,
  parseContent,
  extractFieldsOfEveryLine
} = require(`./cutLib`);

const performCut = (utils, options) => {
  const { readFileSync, existsSync } = utils;
  const cutOptions = readCutOptions(options);
  const filename = readFileName(options);
  let { content, error } = readFileContent(readFileSync, existsSync, filename);
  if (error) return { error };
  const parsedContent = parseContent(content);
  const fieldsOrError = extractFieldsOfEveryLine(parsedContent, cutOptions);
  if (fieldsOrError.error) return { error: fieldsOrError.error };
  const cutLines = fieldsOrError.extractedLines.join("\n");
  return { cutLines };
};

module.exports = { performCut };
