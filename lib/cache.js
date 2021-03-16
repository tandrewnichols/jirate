const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const root = path.resolve(__dirname);
const cacheDir = path.join(root, '..', '.cache');

const full = (filename) => path.join(cacheDir, `${ filename }.json`);

exports.ensure = async () => {
  try {
    await fs.ensureDir(cacheDir)
  } catch (e) {
    console.log(chalk.red('Unable to create cache directory because of the following error:'))
    console.log(e);
    process.exit(1);
  }
};

exports.read = async (filename) => {
  const fullpath = full(filename);

  try {
    if (await this.has(filename)) {
      return require(fullpath);
    } else {
      return {};
    }
  } catch (e) {
    return {};
  }
};

exports.write = async (filename, contents) => {
  const fullpath = full(filename);

  try {
    await fs.outputJson(fullpath, contents, { spaces: 2 });
  } catch (e) {
    console.log(chalk.red(`Unable to write ${ filename } to cache`));
  }
};

exports.clear = async (filename) => {
  const fullpath = full(filename);
  try {
    await fs.remove(fullpath);
  } catch (e) {
    console.log(chalk.red(`Unable to remove ${ filename } from cache`));
  }
};

exports.has = async (filename) => {
  const fullpath = full(filename);
  try {
    return await fs.pathExists(fullpath);
  } catch (e) {
    return false;
  }
};
