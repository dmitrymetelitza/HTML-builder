const fs = require('fs');
const path = require('path');
const process = require('process');
const { stdout, stdin, exit } = process;

process.on('exit', () => stdout.write('Bye'));
process.on('SIGINT', () => exit());

fs.writeFile(path.join(__dirname, 'ThisIsTextFile.text'), '', (err) => {
  if (err) throw err;
  stdout.write('Hey!\nHere you can leave your text ...\n');
});
stdin.on('data', (data) => {
  const dataText = data.toString();
  if (dataText.trim() === 'exit') {
    exit();
  }
  fs.appendFile(
    path.join(__dirname, 'ThisIsTextFile.text'),
    dataText,
    (err) => {
      if (err) throw err;
    }
  );
});
