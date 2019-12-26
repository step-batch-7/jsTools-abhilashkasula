const fs = require(`fs`);
const { stdout, stderr, argv } = require("process");
const { cut } = require("./src/cutLib");

const main = () => {
  const { error, rowsOfColumns } = cut(fs, argv.slice(2));
  stdout.write(rowsOfColumns);
  stderr.write(error);
};

main();
