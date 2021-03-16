const auth = require('../lib/auth');
const settings = require('../lib/settings');
const chalk = require('chalk');
const fs = require('fs-extra');
const prompt = require('../lib/prompt');

module.exports = async (file, options) => {
  const { credentials, username, password } = options;
  try {
    if (file || credentials) {
      const credentialsFile = file || credentials;
      try {
        const creds = await fs.readJson(credentialsFile)
        await auth.saveCredentials(creds);
      } catch (e) {
        console.log(chalk.red(`Credentials file ${ credentialsFile } does not exist or something went wrong reading from it.`));
        console.log(e);
      }
    } else if (username && password) {
      const creds = { username, password };
      await auth.saveCredentials(creds);
    } else {
      const creds = await prompt.forLogin();
      await auth.saveCredentials(creds);
    }

    console.log(chalk.green('Credentials cached.'), `Run ${ chalk.cyan('jira reset') } to remove them.`);
  } catch (e) {
    console.log(chalk.red('Unable to cache credentials. The following error occurred:'));
    console.log(e);
    process.exit(1);
  }

  try {
    if (options.full) {
      const config = await prompt.forSettings();
      await settings.setAll(config);
    } else {
      await settings.setDefaults();
    }

    console.log(chalk.green('Settings saved.'));
  } catch (e) {
    console.log(chalk.red('Unable to update settings. The following error occurred:'));
    console.log(e);
    process.exit(1);
  }
};
