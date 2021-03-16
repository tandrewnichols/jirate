const cache = require('./cache');
const settings = require('./settings');
const prompt = require('./prompt');

exports.getCredentials = async (options) => {
  let { username, password } = options;

  if (!username || !password) {
    ({ username, password } = await cache.read('credentials'));
  }

  if (!username || !password) {
    ({ username, password } = await prompt.forLogin());
  }

  if (username && password && settings.get('autocacheCredentials')) {
    await this.saveCredentials({ username, password });
  }

  return { username, password };
};

exports.saveCredentials = async (credentials) => await cache.write('credentials', credentials);

exports.hasCredentials = async () => await cache.has('credentials');
