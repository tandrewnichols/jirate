const inquirer = require('inquirer');
const chalk = require('chalk');
const settings = require('./settings');

const types = {
  'Story': '📖',
  'Task': '☑️ ',
  'Spike': '📅',
  'Bug': '🐞',
  'Idea': '💡',
  'Tech Debt': '💲'
};

const prefix = {
  Bug: 'bugfix',
  Story: 'feature',
  Task: 'task',
  'Tech Debt': 'techdebt'
};

exports.forLogin = async () => {
  return await inquirer.prompt([
    {
      type: 'input',
      name: 'username'
    },
    {
      type: 'password',
      name: 'password'
    }
  ]);
};

const getSettingsChocies = () => {
  return [{
    value: true,
    name: 'Yes',
    key: 'y',
  }, {
    value: false,
    name: 'No',
    key: 'n'
  }, {
    value: 'prompt',
    name: 'Prompt each time',
    key: 'p'
  }];
};

exports.forSettings = async () => {
  return await inquirer.prompt([{
    name: 'autocacheCredentials',
    message: 'Save credentials after a successful manual authentication?',
    type: 'expand',
    default: true,
    choices: getSettingsChocies()
  }, {
    name: 'autocheckoutMaster',
    message: 'Automatically checkout master when creating a new branch (if index is clean)?',
    type: 'expand',
    default: true,
    choices: getSettingsChocies()
  }, {
    name: 'autoupdateMaster',
    message: 'Automatically update master from origin when creating a new branch (only applies when branching from master or automatically checking out master is enabled)?',
    type: 'expand',
    default: true,
    choices: getSettingsChocies()
  }, {
    name: 'updateCommand',
    message: 'Command to run when updating master?',
    type: 'expand',
    default: 'pull',
    choices: [{
      value: 'pull',
      name: 'git pull',
      key: 'p',
    }, {
      value: 'merge',
      name: 'git fetch && git merge origin/master',
      key: 'm',
    }, {
      value: 'rebase',
      name: 'git fetch && git rebase origin/master (I hope you know what you are doing)',
      key: 'r',
    }]
  }, {
    name: 'allowNonMasterBranching',
    message: 'Allow creating branches from non-master branches?',
    type: 'expand',
    default: false,
    choices: getSettingsChocies()
  }, {
    name: 'autoupdateIssue',
    message: 'Automatically update issue status and assignee when creating a branch?',
    type: 'expand',
    default: true,
    choices: getSettingsChocies()
  }, {
    name: 'filterOnLabels',
    message: 'Labels to include when filtering issues?',
    type: 'input',
    default: [],
    transformer: settings.formatters.filterOnLabels
  }]);
};

exports.chooseIssue = async (issues) => {
  const options = issues.map((issue) => {
    const { key, fields } = issue;
    return {
      name: `${ types[fields.issuetype.name] } [${ chalk.yellow(key) }] ${ chalk.gray(fields.summary) }`,
      value: issue
    };
  });

  return await inquirer.prompt([{
    message: 'Choose an issue:',
    type: 'list',
    name: 'issue',
    choices: options
  }]);
};

exports.createBranchName = async ({ key, fields }) => {
  const name = [ prefix[fields.issuetype.name], key ].filter(Boolean).join('/');
  console.log();
  console.log('Branch name:');
  const { branch } = await inquirer.prompt([{
    name: 'branch',
    type: 'input',
    message: `${ name }-`
  }]);

  return `${ name }-${ branch }`;
};

const promptIfNecessary = async (setting, message) => {
  if (setting === 'prompt') {
    const { value } = await inquirer.prompt([{
      name: 'value',
      type: 'confirm',
      message
    }]);
    return value;
  } else {
    return setting === true;
  }
};

exports.checkoutMaster = async (setting) => {
  return await promptIfNecessary(setting, 'You are on a non-master branch. Checkout master first?');
};

exports.updateMaster = async (setting) => {
  return await promptIfNecessary(setting, 'Update master to match the origin?');
};

exports.notOnMaster = async (setting) => {
  return await promptIfNecessary(setting, `${ chalk.yellow('You are not on master.') } Continue?`);
};

exports.updateIssue = async (setting) => {
  return await promptIfNecessary(setting, 'Update the status and assignee of this issue?');
};
