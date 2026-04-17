const _ = require('lodash');

const getRequestContext = (logger, payload = {}) =>
  _.pickBy(
    {
      tenantId: _.get(payload, 'data.tenantId'),
      userId: _.get(payload, 'data.userId'),
      botId: _.get(payload, 'data.botId'),
      exchangeAccountId: _.get(payload, 'data.exchangeAccountId'),
      correlationId: _.get(logger, 'fields.correlationId', ''),
      idempotencyKey: _.get(payload, 'data.idempotencyKey')
    },
    value => value !== undefined && value !== null && value !== ''
  );

module.exports = { getRequestContext };
