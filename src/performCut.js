const Cut = require('./cutLib');

const parseOptions = options => {
  const [, delimiter,, field, filename] = options;
  if (delimiter === '-f') {
    return {error: 'cut: bad delimiter'};
  }
  if (field === '0') {
    return {error: 'cut: [-cf] list: values may not include zero'};
  }
  if (isNaN(+field)) {
    return {error: 'cut: [-cf] list: illegal list value'};
  }
  return {delimiter, field, filename};
};

const performCut = (options, streamPicker, onComplete) => {
  const {delimiter, field, filename, error} = parseOptions(options);
  const rowsOfColumns = '';
  if (error) {
    return onComplete({error, rowsOfColumns});
  }
  const cut = new Cut(delimiter, field);
  const stream = streamPicker.pick(filename);
  cut.loadStreamContent(stream, onComplete);
};

module.exports = {performCut, parseOptions};
