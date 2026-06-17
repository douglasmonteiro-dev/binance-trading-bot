const _ = require('lodash');

const ensureExchangeAccountId = (logger, ws, payload, resultType, message) => {
  const exchangeAccountId = _.get(payload, 'data.exchangeAccountId');

  if (exchangeAccountId) {
    return true;
  }

  logger.warn(
    { payload },
    'Rejected websocket financial action without exchangeAccountId.'
  );

  ws.send(
    JSON.stringify({
      result: false,
      type: resultType,
      message
    })
  );

  return false;
};

module.exports = { ensureExchangeAccountId };
