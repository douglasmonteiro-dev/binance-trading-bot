const _ = require('lodash');

const getFinancialContext = data =>
  _.pickBy(
    {
      tenantId: _.get(data, 'tenantId'),
      userId: _.get(data, 'userId'),
      botId: _.get(data, 'botId'),
      exchangeAccountId: _.get(data, 'exchangeAccountId'),
      correlationId: _.get(data, 'correlationId'),
      idempotencyKey: _.get(data, 'idempotencyKey')
    },
    value => value !== undefined && value !== null && value !== ''
  );

module.exports = { getFinancialContext };
