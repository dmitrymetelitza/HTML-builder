const fsPromises = require('fs').promises;
const path = require('path');
const { stdout } = require('process');

const BUILD_FOLDER_NAME = 'project-dist';
const STYLE_FOLDER_NAME = 'styles';
const BUNDLE_CSS_NAME = 'style.css';

const buildPath = path.join(__dirname, BUILD_FOLDER_NAME);
const components = [];
const styles = [];
const styleFolderPath = path.join(__dirname, STYLE_FOLDER_NAME);

const ASSETS_FOLDER_NAME = 'assets';
const copyAssetsPath = path.join(buildPath, ASSETS_FOLDER_NAME);

const copy = async (partsOfPath) => {
  try {
    const pathTale = partsOfPath.slice(1);
    await fsPromises.copyFile(
      path.join(...partsOfPath),
      path.join(buildPath, ...pathTale)
    );
  } catch (error) {
    stdout.write('The file could not be copied\n');
    stdout.write(error.message);
  }
};

const readAssetsFolder = async (partsOfPath) => {
  try {
    const files = await fsPromises.readdir(path.join(...partsOfPath), {
      withFileTypes: true,
    });
    for (let file of files) {
      if (file.isFile()) {
        await copy([...partsOfPath, file.name]);
      }

      if (file.isDirectory()) {
        const newDirectoryPath = [
          buildPath,
          ...partsOfPath.slice(1),
          file.name,
        ];

        await fsPromises.mkdir(path.join(...newDirectoryPath), {
          recursive: true,
        });

        await readAssetsFolder([...partsOfPath, file.name]);
      }
    }
  } catch (error) {
    stdout.write(error.message);
  }
};

const copyAssets = async () => {
  await fsPromises.mkdir(copyAssetsPath, { recursive: true });
  readAssetsFolder([__dirname, ASSETS_FOLDER_NAME]);
};

const createCssBundle = async () => {
  try {
    const files = await fsPromises.readdir(styleFolderPath);

    for (const file of files) {
      const fileExt = path.extname(file).slice(1);
      if (fileExt === 'css') {
        styles.push(await getFileContent([styleFolderPath, file]));
      }
    }
    createFile([buildPath, BUNDLE_CSS_NAME], styles.join(' '));
  } catch (error) {
    stdout.write(error.message);
  }
};

const createFile = async (partsOfPath, data) => {
  fsPromises.writeFile(path.join(...partsOfPath), data, (err) => {
    if (err) throw err;
    stdout.write('file created.\n');
  });
};

const createHtml = async (htmlTemplate) => {
  components.forEach(({ name, html }) => {
    htmlTemplate = htmlTemplate.replace(`{{${name}}}`, html);
  });
  await createFile([__dirname, 'project-dist', 'index.html'], htmlTemplate);
};

const getComponents = async () => {
  try {
    const files = await fsPromises.readdir(path.join(__dirname, 'components'), {
      withFileTypes: true,
    });
    for (const file of files) {
      if (file.isFile()) {
        const fileName = file.name.split('.')[0];
        const fileExt = path.extname(file.name).slice(1);
        if (fileExt === 'html') {
          const component = {
            name: fileName,
            html: await getFileContent([__dirname, 'components', file.name]),
          };
          components.push(component);
        }
      }
    }
  } catch (error) {
    stdout.write(error.message);
  }
};

const getFileContent = async (partsOfPath) => {
  return await fsPromises
    .readFile(path.join(...partsOfPath))
    .then((result) => result.toString())
    .catch((error) => stdout.write(error));
};

const clean = async () => {
  await fsPromises.rm(buildPath, { recursive: true, force: true }, (err) => {
    if (err) throw err;
  });
};

const createBuild = async () => {
  await clean();

  await fsPromises.mkdir(buildPath, { recursive: true });
  let htmlTemplate = await getFileContent([__dirname, 'template.html']);
  await getComponents();
  await createHtml(htmlTemplate);
  createCssBundle();
  copyAssets();

  stdout.write('build created\n');
};

createBuild();
