const chalk = require('chalk');
const cache = require('./cache');
const { coerce } = require('./utils');

const knownSettings = {
  autocacheCredentials: [true, false],
  autocheckoutMaster: [true, false, 'prompt'],
  autoupdateMaster: [true, false, 'prompt'],
  updateCommand: ['pull', 'merge', 'rebase'],
  allowNonMasterBranching: [true, false, 'prompt'],
  autoupdateIssue: [true, false, 'prompt']
};

const defaults = {
  autocacheCredentials: true,
  autocheckoutMaster: true,
  autoupdateMaster: true,
  updateCommand: 'pull',
  allowNonMasterBranching: false,
  autoupdateIssue: true
};

let settings;

const getSettings = async () => {
  return settings || (settings = await cache.read('settings'));
};

exports.get = async (key) => {
  const settings = await getSettings();
  if (key) {
    return settings[key];
  } else {
    return settings;
  }
};

exports.set = async (setting, value) => {
  value = coerce(value);

  if (!knownSettings[setting]) {
    console.log(chalk.red(`Unknown setting: ${ setting }`));
    process.exit(1);
  }

  if (!knownSettings[setting].includes(value)) {
    console.log(chalk.red(`Unknown value for setting ${ setting }: ${ value }. Valid values are ${ knownSettings[setting].join(', ') }.`));
    process.exit(1);
  }

  const settings = await this.get();
  settings[setting] = value;
  await cache.write('settings', settings);
};

exports.setDefaults = async () => {
  await cache.write('settings', defaults);
};
