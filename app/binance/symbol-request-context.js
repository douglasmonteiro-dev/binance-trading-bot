const _ = require('lodash');

const getSymbolRequestContext = (symbolConfiguration, correlationId) =>
  _.pickBy(
    {
      tenantId: _.get(symbolConfiguration, 'tenantId'),
      userId: _.get(symbolConfiguration, 'userId'),
      botId: _.get(symbolConfiguration, 'botId'),
      exchangeAccountId: _.get(symbolConfiguration, 'exchangeAccountId'),
      correlationId
    },
    value => value !== undefined && value !== null && value !== ''
  );

module.exports = {
  getSymbolRequestContext
};