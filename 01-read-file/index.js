const fs = require('fs');
const path = require('path');
let data = '';
let readableStream = fs.createReadStream(
  path.join(__dirname, 'text.txt'),
  'utf-8'
);

readableStream.on('data', (chunk) => {
  data += chunk.toString();
});
readableStream.on('end', () => {
  console.log(data);
});
