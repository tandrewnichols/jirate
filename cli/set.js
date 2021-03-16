const settings = require('../lib/settings');

module.exports = async (setting, value) => {
  await settings.set(setting, value);
};
