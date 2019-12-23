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

module.exports = { joinLines, extractFieldsOfEveryLine, parseContent };
