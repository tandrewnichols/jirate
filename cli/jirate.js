#!/usr/bin/env node

const { program } = require('commander');
const cache = require('../lib/cache');
const branch = require('./branch');
const init = require('./init');
const logout = require('./logout');
const set = require('./set');
const get = require('./get');
const reset = require('./reset');

const chalk = require('chalk');

cache.ensure();

program.name('jira');
program.version(require('../package.json').version, '-v, --version');

program
  .command('branch')
  .description('Create a git branch from a Jira issue.')
  .option('-u, --username <username>', 'Jira username.')
  .option('-p, --password <password>', 'Jira password.')
  .option('-c, --credentials <file>', 'Local file in which Jira cedentials are stored as json.')
  .description('Make a git branch from an issue.')
  .action(branch);

program
  .command('init [file]')
  .description('Setup your credentials in order to authenticate with the API.')
  .option('-u, --username <username>', 'Jira username.')
  .option('-p, --password <password>', 'Jira password.')
  .option('-c, --credentials <file>', 'Local file in which Jira credentials are stored as json.')
  .action(init);

program
  .command('set <setting> <value>')
  .description('Configure settings. See help for a list of settings and their explanations.')
  .option('autocacheCredentials <true|false>', 'Cache credentials for later use after they are manually entered.')
  .option('autocheckoutMaster <true|false|prompt>', `Automatically checkout master when ${ chalk.cyan('jira branch') } is run on a non-master branch.`)
  .option('autoupdateMaster <true|false|prompt>', 'Automatically pull after checking out master before creating a new branch.')
  .option('updateCommand <pull|merge|rebase>', 'Indicates how to resolve updates when switching to master. Pull runs "git pull" and relies on your local configuration. Merge and rebase both fetch first, and then run "git merge origin/master" and "git rebase origin/master" respectively.')
  .option('allowNonMasterBranching <true|false|prompt>', `Allow ${ chalk.cyan('jira branch') } to create branches off of non-master branches.`)
  .option('autoupdateIssue <true|false|prompt>', 'Automatically set the status and assignee of an issue when creating a branch for that issue.')
  .action(set);

program
  .command('get [setting]')
  .description('Show the current value of a configuration setting.')
  .action(get);

program
  .command('logout')
  .description('Delete your credentials.')
  .action(logout);

program
  .command('reset')
  .description('Reset all options to the initial defaults.')
  .action(reset);

program.parse(process.argv);
