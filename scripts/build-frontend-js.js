const fs = require('fs/promises');
const path = require('path');

const babel = require('@babel/core');

const sourceDirectory = path.join(__dirname, '..', 'public', 'js');
const destinationDirectory = path.join(__dirname, '..', 'public', 'dist', 'js');

const collectJavaScriptFiles = async directory => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async entry => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectJavaScriptFiles(fullPath);
      }

      if (entry.isFile() && entry.name.endsWith('.js')) {
        return [fullPath];
      }

      return [];
    })
  );

  return files.flat();
};

const buildFile = async filePath => {
  const relativePath = path.relative(sourceDirectory, filePath);
  const outputPath = path.join(
    destinationDirectory,
    relativePath.replace(/\.js$/, '.min.js')
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const result = await babel.transformFileAsync(filePath, {
    sourceMaps: false,
    comments: false,
    compact: true,
    plugins: ['@babel/plugin-transform-react-jsx']
  });

  if (result === null || result.code === undefined) {
    throw new Error(`Unable to compile ${relativePath}`);
  }

  await fs.writeFile(outputPath, result.code);
};

const main = async () => {
  const files = await collectJavaScriptFiles(sourceDirectory);

  await Promise.all(files.map(buildFile));

  console.log(`Compiled ${files.length} frontend files with Babel 7.`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
