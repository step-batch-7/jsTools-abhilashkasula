const { cut } = require("./src/cutLib");
const { readFileSync, existsSync } = require(`fs`);
const { stdout, stderr, argv } = require("process");

const main = () => {
  const { cutLines, error } = cut({ readFileSync, existsSync }, argv.slice(2));
  cutLines && stdout.write(cutLines);
  error && stderr.write(error);
};

main();
