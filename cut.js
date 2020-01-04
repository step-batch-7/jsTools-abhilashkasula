const {createReadStream} = require('fs');
const {performCut} = require('./src/cutLib');
const StreamPicker = require('./src/streamPicker');

const main = () => {
  const [,, ...options] = process.argv;
  const streamPicker = new StreamPicker(createReadStream, process.stdin);
  performCut(options, streamPicker, result => {
    process.stdout.write(result.rowsOfColumns);
    process.stderr.write(result.error);
  });
};

main();
