const { readFile } = require('fs');
const { cut } = require('./src/cutLib');

const main = () => {
  const optionsStartFrom = 2;
  const writeToStream = msg => {
    process.stdout.write(msg.rowsOfColumns);
    process.stderr.write(msg.error);
  };
  cut(readFile, process.argv.slice(optionsStartFrom), writeToStream);
};

main();
