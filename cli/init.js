const auth = require('../lib/auth');
const settings = require('../lib/settings');
const chalk = require('chalk');
const fs = require('fs-extra');

module.exports = async (file, options) => {
  const { credentials, username, password } = options;
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
    console.log(chalk.green('Credentials cached.'), `Run ${ chalk.cyan('jira reset') } to remove them.`);

    await settings.setDefaults();
  } else {
    console.log(chalk.red('Either --credentials or --username/--password is required.'));
  }
};
