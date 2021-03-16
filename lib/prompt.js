const inquirer = require('inquirer');
const chalk = require('chalk');

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
