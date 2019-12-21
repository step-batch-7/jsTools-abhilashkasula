const joinLines = extractedFields => extractedFields.join("\n");

const extractFieldsOfEachLine = (lines, cutOptions) => {
  const delimiter = cutOptions[1];
  const field = cutOptions[3];
  return lines.map(line => line.split(delimiter)[field - 1]);
};

module.exports = { joinLines, extractFieldsOfEachLine };
