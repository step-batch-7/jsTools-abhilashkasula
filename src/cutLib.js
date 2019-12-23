const joinLines = extractedFields => extractedFields.join("\n");

const extractFieldForLine = function(line) {
  if (!line.includes(this.delimiter)) return line;
  const splitLine = line.split(this.delimiter);
  let extractedField = "";
  splitLine[this.field - 1] && (extractedField = splitLine[this.field - 1]);
  return extractedField;
};

const extractFieldsOfEveryLine = (lines, cutOptions) => {
  const [, delimiter, , field] = cutOptions;
  return lines.map(extractFieldForLine.bind({ delimiter, field }));
};

const parseContent = content => {
  return content.split(`\n`);
};

module.exports = { joinLines, extractFieldsOfEveryLine, parseContent };
