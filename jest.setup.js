process.env.TZ = 'UTC';

const util = require('util');

// Node.js 24 removed legacy util type helpers, but config@3.x still relies on them.
if (typeof util.isRegExp !== 'function') {
  util.isRegExp = value => value instanceof RegExp;
}
if (typeof util.isDate !== 'function') {
  util.isDate = value => value instanceof Date;
}
if (typeof util.isError !== 'function') {
  util.isError = value => value instanceof Error;
}

const jestSetup = async () => {};

module.exports = jestSetup;
