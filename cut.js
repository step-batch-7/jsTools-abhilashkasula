const { performCut } = require("./src/performCut");
const { readFileSync, existsSync } = require(`fs`);
const { stdout, stderr, argv } = require("process");

const main = () => {
  const errStream = err => stderr.write(err);
  const outStream = msg => stdout.write(msg);
  performCut(
    {
      readFileSync,
      existsSync,
      outStream,
      errStream
    },
    argv.slice(2)
  );
};

main();
