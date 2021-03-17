const execa = require('execa');
const chalk = require('chalk');
const settings = require('./settings');
const prompt = require('./prompt');

exports.createBranch = async (branch) => {
  const allowNonMaster = await settings.get('allowNonMasterBranching');
  const autoupdate = await settings.get('autoupdateMaster');

  const { stdout: currentBranch } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);

  if (currentBranch !== 'master') {
    if (await this.hasChanges()) {
      console.log(chalk.red('Not on master and index is dirty. Not changing branches.'));
      process.exit(1);
    } else {
      if (!(await prompt.notOnMaster(allowNonMaster))) {
        await this.checkoutMaster();
      }
    }
  } else if (await prompt.updateMaster(autoupdate)) {
    await this.updateMaster();
  }

  await execa('git', ['checkout', '-b', branch]);
};

exports.hasChanges = async () => {
  const { stdout: changes } = await execa('git', ['status', '--porcelain']);
  return changes;
};

exports.checkoutMaster = async () => {
  const autocheckout = await settings.get('autocheckoutMaster');
  const autoupdate = await settings.get('autoupdateMaster');

  if (await prompt.checkoutMaster(autocheckout)) {
    console.log(chalk.green('Checking out master'));
    await execa('git', ['checkout', 'master']);

    if (await prompt.updateMaster(autoupdate)) {
      await this.updateMaster();
    }
  } else {
    console.log(chalk.red('Not on master and autocheckoutMaster is false. Not changing branches.'));
    process.exit(0);
  }
};

exports.updateMaster = async () => {
  const updateCommand = await settings.get('updateCommand');

  console.log(chalk.green('Updating master from origin'));
  if (!updateCommand || updateCommand === 'pull') {
    await execa('git', ['pull']);
  } else {
    // Untested because I always use pull
    await execa('git', ['fetch', 'origin']);
    await execa('git', [updateCommand, 'origin/master']);
  }
};
