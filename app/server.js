const path = require('path');
const { logger: rootLogger, mongo } = require('./helpers');
const { runBinance } = require('./server-binance');
const { runCronjob } = require('./server-cronjob');
const { runFrontend } = require('./server-frontend');
const { runErrorHandler } = require('./error-handler');

global.appRoot = path.resolve(__dirname);

const startService = async (logger, serviceName, fn) => {
  try {
    await fn(logger);
  } catch (err) {
    logger.error({ err, serviceName }, `${serviceName} failed to start`);
  }
};

(async () => {
  const logger = rootLogger.child({
    gitHash: process.env.GIT_HASH || 'unspecified'
  });

  runErrorHandler(logger);

  await mongo.connect(logger);

  await Promise.all([
    startService(logger, 'binance', runBinance),
    startService(logger, 'cronjob', runCronjob),
    startService(logger, 'frontend', runFrontend)
  ]);
})();
