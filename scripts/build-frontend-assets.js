const fs = require('fs/promises');
const path = require('path');

const CleanCSS = require('clean-css');

const {
  compiledDirectory,
  compiledScripts,
  bundleOutput,
  styleInput,
  styleOutput
} = require('./frontend-build-config');

const projectRoot = path.join(__dirname, '..');

const resolveProjectPath = relativePath => path.join(projectRoot, relativePath);

const buildScriptBundle = async () => {
  const compiledSources = await Promise.all(
    compiledScripts.map(relativePath =>
      fs.readFile(resolveProjectPath(relativePath), 'utf8')
    )
  );

  const bundlePath = resolveProjectPath(bundleOutput);
  await fs.mkdir(path.dirname(bundlePath), { recursive: true });
  await fs.writeFile(bundlePath, compiledSources.join('\n'));
};

const buildStyles = async () => {
  const inputPath = resolveProjectPath(styleInput);
  const outputPath = resolveProjectPath(styleOutput);
  const source = await fs.readFile(inputPath, 'utf8');
  const result = new CleanCSS().minify(source);

  if (result.errors.length > 0) {
    throw new Error(result.errors.join('\n'));
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, result.styles);
};

const cleanCompiledDirectory = async () => {
  await fs.rm(resolveProjectPath(compiledDirectory), {
    recursive: true,
    force: true
  });
};

const main = async () => {
  await buildScriptBundle();
  await buildStyles();
  await cleanCompiledDirectory();

  console.log('Built frontend JS bundle and CSS assets.');
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
