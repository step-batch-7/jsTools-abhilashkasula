const fs = require(`fs`);
const { stdout, stderr, argv } = require("process");
const { cut } = require("./src/cutLib");

const main = () => {
  const { error, rowsOfCols } = cut(fs, argv.slice(2));
  stdout.write(rowsOfCols);
  stderr.write(error);
};

main();
