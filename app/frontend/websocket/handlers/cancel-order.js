const _ = require('lodash');
const moment = require('moment');
const {
  saveOverrideAction
} = require('../../../cronjob/trailingTradeHelper/common');
const queue = require('../../../cronjob/trailingTradeHelper/queue');
const { executeTrailingTrade } = require('../../../cronjob/index');
const { ensureExchangeAccountId } = require('./ensure-exchange-account-id');
const { getRequestContext } = require('./request-context');

const handleCancelOrder = async (logger, ws, payload) => {
  logger.info({ payload }, 'Start cancel order');

  if (
    ensureExchangeAccountId(
      logger,
      ws,
      payload,
      'cancel-order-result',
      'exchangeAccountId is required to cancel an order.'
    ) === false
  ) {
    return;
  }

  const requestContext = getRequestContext(logger, payload);

  const {
    data: { symbol, order }
  } = payload;

  const { side } = order;

  const saveOverrideActionFn = async () => {
    await saveOverrideAction(
      logger,
      symbol,
      {
        action: 'cancel-order',
        order,
        actionAt: moment().toISOString(),
        triggeredBy: 'user'
      },
      `Cancelling the ${side.toLowerCase()} order action has been received. Wait for cancelling the order.`
    );
  };

  queue.execute(logger, symbol, {
    correlationId: _.get(logger, 'fields.correlationId', ''),
    requestContext,
    preprocessFn: saveOverrideActionFn,
    processFn: executeTrailingTrade
  });

  ws.send(
    JSON.stringify({
      result: true,
      type: 'cancel-order-result',
      message: `Cancelling the ${side.toLowerCase()} order action has been received.`
    })
  );
};

module.exports = { handleCancelOrder };
