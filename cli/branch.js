const auth = require('../lib/auth');
const chalk = require('chalk');
const jira = require('../lib/jira');
const prompt = require('../lib/prompt');
const git = require('../lib/git');
const settings = require('../lib/settings');

module.exports = async (options) => {
  const { username, password } = await auth.getCredentials(options);

  if (!username || !password) {
    console.log(chalk.red('No credentials provided to access Jira'));
    process.exit(1);
  }

  if (!(await auth.hasCredentials())) {
    await auth.saveCredentials({ username, password });
  }

  try {
    jira.authenticate({ username, password });
    const issues = await jira.findIssues();
    const { issue } = await prompt.chooseIssue(issues);
    const branchName = await prompt.createBranchName(issue);
    git.createBranch(branchName);

    const autoupdate = await settings.get('autoupdateIssue');
    if (await prompt.updateIssue(autoupdate)) {
      await jira.updateIssue(issue);
    }
  } catch (e) {
    console.log(chalk.red('Something went wrong.'));
    console.log(e);
  }
};
