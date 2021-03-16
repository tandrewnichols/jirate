const chalk = require('chalk');
const settings = require('../lib/settings');

module.exports = async () => {
  await settings.setDefaults();
  console.log(chalk.green('Settings reset.'));
};
