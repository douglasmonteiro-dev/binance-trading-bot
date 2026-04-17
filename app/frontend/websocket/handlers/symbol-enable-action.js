const _ = require('lodash');
const {
  deleteDisableAction
} = require('../../../cronjob/trailingTradeHelper/common');
const queue = require('../../../cronjob/trailingTradeHelper/queue');
const { executeTrailingTrade } = require('../../../cronjob/index');
const { getRequestContext } = require('./request-context');

const handleSymbolEnableAction = async (logger, ws, payload) => {
  logger.info({ payload }, 'Start symbol enable action');

  const requestContext = getRequestContext(logger, payload);

  const { data: symbolInfo } = payload;

  const { symbol } = symbolInfo;

  const deleteDisableActionFn = async () => {
    await deleteDisableAction(logger, symbol);
  };

  queue.execute(logger, symbol, {
    correlationId: _.get(logger, 'fields.correlationId', ''),
    requestContext,
    preprocessFn: deleteDisableActionFn,
    processFn: executeTrailingTrade
  });

  ws.send(
    JSON.stringify({ result: true, type: 'symbol-enable-action-result' })
  );
};

module.exports = { handleSymbolEnableAction };
