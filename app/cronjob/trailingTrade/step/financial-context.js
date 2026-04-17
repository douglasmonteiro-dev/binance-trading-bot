const _ = require('lodash');

const getContextValue = (data, field) =>
  _.get(data, field, _.get(data, `symbolConfiguration.${field}`));

const getFinancialContext = data =>
  _.pickBy(
    {
      tenantId: getContextValue(data, 'tenantId'),
      userId: getContextValue(data, 'userId'),
      botId: getContextValue(data, 'botId'),
      exchangeAccountId: getContextValue(data, 'exchangeAccountId'),
      correlationId: getContextValue(data, 'correlationId'),
      idempotencyKey: getContextValue(data, 'idempotencyKey')
    },
    value => value !== undefined && value !== null && value !== ''
  );

module.exports = { getFinancialContext };
