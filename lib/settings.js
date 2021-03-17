const chalk = require('chalk');
const cache = require('./cache');
const { coerce } = require('./utils');

exports.knownSettings = {
  autocacheCredentials: [true, false],
  autocheckoutMaster: [true, false, 'prompt'],
  autoupdateMaster: [true, false, 'prompt'],
  updateCommand: ['pull', 'merge', 'rebase'],
  allowNonMasterBranching: [true, false, 'prompt'],
  autoupdateIssue: [true, false, 'prompt'],
  filterLabels: undefined
};

exports.formatters = {
  filterLabels: (labels) => labels?.split(/,\s*/g) || []
};

const defaults = {
  autocacheCredentials: true,
  autocheckoutMaster: true,
  autoupdateMaster: true,
  updateCommand: 'pull',
  allowNonMasterBranching: false,
  autoupdateIssue: true,
  filterLabels: []
};

let _settings;

const getSettings = async () => {
  return _settings || (_settings = await cache.read('settings'));
};

exports.get = async (key) => {
  const settings = await getSettings();
  if (key) {
    return settings[key];
  } else {
    return settings;
  }
};

exports.set = async (setting, value, skipWrite) => {
  value = coerce(value);
  value = this.formatters[setting]?.(value) || value;

  if (!(setting in this.knownSettings)) {
    console.log(chalk.red(`Unknown setting: ${ setting }`));
    process.exit(1);
  }

  // If the known setting is undefined, it means there is no validation
  // on the options set. This is for open-ended options.
  if (this.knownSettings[setting] && !this.knownSettings[setting].includes(value)) {
    console.log(chalk.red(`Unknown value for setting ${ setting }: ${ value }. Valid values are ${ this.knownSettings[setting].join(', ') }.`));
    process.exit(1);
  }

  const settings = await this.get();
  settings[setting] = value;
  await cache.write('settings', settings);
};

exports.setAll = async (settings) => {
  for (let [setting, value] of Object.entries(settings)) {
    // Why do this instead of just setting the whole
    // object at once? This allows validting the
    // settings and their values. However, we only
    // need to _write_ the settings once.
    await this.set(setting, value, true);
  }

  await cache.write('settings', _settings);
};

exports.setDefaults = async () => {
  await cache.write('settings', defaults);
};
