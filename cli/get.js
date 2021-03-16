const settings = require('../lib/settings');

module.exports = async (setting) => {
  console.log(await settings.get(setting));
};
