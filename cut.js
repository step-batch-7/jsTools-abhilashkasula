const { createReadStream } = require('fs');
const { cut } = require('./src/cutLib');

const main = () => {
  const optionsStartFrom = 2;
  const writeToStream = msg => {
    process.stdout.write(msg.rowsOfColumns);
    process.stderr.write(msg.error);
  };
  const readStreams = { stdin: process.stdin, fileStream: createReadStream };
  cut(readStreams, process.argv.slice(optionsStartFrom), writeToStream);
};

main();
