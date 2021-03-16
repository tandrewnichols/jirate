const settings = require('../lib/settings');
const prompt = require('../lib/prompt');

module.exports = async (setting, value) => {
  if (!setting) {
    ({ setting } = await prompt.forSetting());
  }

  if (!value) {
    ({ value } = await prompt.forValue(setting));
  }

  await settings.set(setting, value);
};
