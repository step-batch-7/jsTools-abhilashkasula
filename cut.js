const { createReadStream } = require('fs');
const { performCut } = require('./src/cutLib');

const main = () => {
  const [,, ...options] = process.argv;
  const createStdinStream = () => process.stdin;
  const createFileStream = createReadStream;
  performCut(options, { createFileStream, createStdinStream}, result => {
    process.stdout.write(result.rowsOfColumns);
    process.stderr.write(result.error);
  });
};

main();
