const fsPromises = require('fs').promises;
const path = require('path');
const { stdout } = require('process');

const STYLE_FOLDER_NAME = 'styles';
const BUILD_FOLDER_NAME = 'project-dist';
const BUNDLE_CSS_NAME = 'bundle.css';

const styles = [];
const styleFolderPath = path.join(__dirname, STYLE_FOLDER_NAME);

const readFile = async (fileName) => {
  await fsPromises
    .readFile(path.join(styleFolderPath, fileName))
    .then((result) => styles.push(result.toString()))
    .catch((error) => console.log(error));
};

const createBundle = async () => {
  fsPromises.writeFile(
    path.join(__dirname, BUILD_FOLDER_NAME, BUNDLE_CSS_NAME),
    styles.join(' '),
    (err) => {
      if (err) throw console.log(err);
      stdout.write('Bundle CSS created.\n');
    }
  );
};

const readFolder = async () => {
  try {
    const files = await fsPromises.readdir(styleFolderPath);

    for (const file of files) {
      const fileExt = path.extname(file).slice(1);
      if (fileExt === 'css') {
        await readFile(file);
      }
    }
    createBundle();
  } catch (error) {
    stdout.write(error.message);
  }
};

readFolder();
