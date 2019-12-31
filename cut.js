const { createReadStream } = require('fs');
const { performCut } = require('./src/cutLib');

const main = () => {
  const [,, ...options] = process.argv;
  const createStdinStream = () => process.stdin;
  const createFileStream = createReadStream;
  const printResult = msg => {
    process.stdout.write(msg.rowsOfColumns);
    process.stderr.write(msg.error);
  };
  performCut({ createStdinStream, createFileStream }, options, printResult);
};

main();
