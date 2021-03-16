const cache = require('../lib/cache');

module.exports = async () => {
  await cache.clear('credentials');
};
