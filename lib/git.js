const execa = require('execa');
const chalk = require('chalk');
const settings = require('./settings');
const prompt = require('./prompt');

exports.createBranch = async (branch) => {
  const allowNonMaster = await settings.get('allowNonMasterBranching');

  const { stdout: currentBranch } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);

  if (currentBranch !== 'master') {
    if (await this.hasChanges()) {
      console.log(chalk.red('Not on master and index is dirty. Not changing branches.'));
      process.exit(1);
    } else {
      if (!(await prompt.notOnMaster(allowNonMaster))) {
        console.log('checking out master');
        await this.startFresh();
      }
    }
  }

  await execa('git', ['checkout', '-b', branch]);
};

exports.hasChanges = async () => {
  const { stdout: changes } = await execa('git', ['status', '--porcelain']);
  return changes;
};

exports.startFresh = async () => {
  const autocheckout = await settings.get('autocheckoutMaster');
  const autoupdate = await settings.get('autoupdateMaster');
  const updateCommand = await settings.get('updateCommand');

  if (await prompt.checkoutMaster(autocheckout)) {
    await execa('git', ['checkout', 'master']);

    if (await prompt.updateMaster(autoupdate)) {
      if (!updateCommand || updateCommand === 'pull') {
        await execa('git', ['pull']);
      } else {
        // Untested because I always use pull
        await execa('git', ['fetch', 'origin']);
        await execa('git', [updateCommand, 'origin/master']);
      }
    }
  } else {
    console.log(chalk.red('Not on master and autocheckoutMaster is false. Not changing branches.'));
  }
};
