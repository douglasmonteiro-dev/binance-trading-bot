const _ = require('lodash');
const {
  deleteSymbolConfiguration
} = require('../../../cronjob/trailingTradeHelper/configuration');
const queue = require('../../../cronjob/trailingTradeHelper/queue');
const { executeTrailingTrade } = require('../../../cronjob/index');
const { getRequestContext } = require('./request-context');

const handleSymbolSettingDelete = async (logger, ws, payload) => {
  logger.info({ payload }, 'Start symbol setting delete');

  const requestContext = getRequestContext(logger, payload);

  const { data: symbolInfo } = payload;

  const { symbol } = symbolInfo;

  const deleteSymbolConfigurationFn = async () => {
    await deleteSymbolConfiguration(logger, symbol);
  };

  queue.execute(logger, symbol, {
    correlationId: _.get(logger, 'fields.correlationId', ''),
    requestContext,
    preprocessFn: deleteSymbolConfigurationFn,
    processFn: executeTrailingTrade
  });

  ws.send(
    JSON.stringify({ result: true, type: 'symbol-setting-delete-result' })
  );
};

module.exports = { handleSymbolSettingDelete };
