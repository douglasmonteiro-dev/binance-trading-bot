const _ = require('lodash');
const { version } = require('../../../../package.json');

const { binance, cache } = require('../../../helpers');
const {
  getConfiguration
} = require('../../../cronjob/trailingTradeHelper/configuration');

const {
  isActionDisabled,
  countCacheTrailingTradeSymbols,
  getCacheTrailingTradeSymbols,
  getCacheTrailingTradeTotalProfitAndLoss,
  getCacheTrailingTradeQuoteEstimates
} = require('../../../cronjob/trailingTradeHelper/common');

const countActionByPrefix = (symbols, prefix) =>
  symbols.filter(symbol => _.startsWith(_.get(symbol, 'action', ''), prefix))
    .length;

const countSymbolsWithOpenOrders = (symbols, side) =>
  symbols.filter(symbol => _.get(symbol, [side, 'openOrders'], []).length > 0)
    .length;

const countNearStopLoss = symbols =>
  symbols.filter(symbol => {
    const stopLossDifference = _.get(symbol, 'sell.stopLossDifference', null);

    return _.isNumber(stopLossDifference)
      ? stopLossDifference >= 0 && stopLossDifference <= 1
      : false;
  }).length;

const countStopLossTriggered = symbols =>
  symbols.filter(symbol => {
    const stopLossDifference = _.get(symbol, 'sell.stopLossDifference', null);

    return (
      _.get(symbol, 'action') === 'sell-stop-loss' ||
      (_.isNumber(stopLossDifference) && stopLossDifference < 0)
    );
  }).length;

const buildConsultation = (symbols, common, globalConfiguration) => {
  const orderLimitEnabled = _.get(
    globalConfiguration,
    ['botOptions', 'orderLimit', 'enabled'],
    false
  );
  const maxOpenTrades = _.get(
    globalConfiguration,
    ['botOptions', 'orderLimit', 'maxOpenTrades'],
    0
  );
  const maxBuyOpenOrders = _.get(
    globalConfiguration,
    ['botOptions', 'orderLimit', 'maxBuyOpenOrders'],
    0
  );
  const usedWeight1m = parseFloat(
    _.get(common, 'apiInfo.spot.usedWeight1m', 0)
  );

  return {
    generatedAt: new Date().toISOString(),
    market: {
      buySignals: countActionByPrefix(symbols, 'buy'),
      sellSignals: countActionByPrefix(symbols, 'sell'),
      openBuyOrders: countSymbolsWithOpenOrders(symbols, 'buy'),
      openSellOrders: countSymbolsWithOpenOrders(symbols, 'sell')
    },
    risk: {
      nearStopLoss: countNearStopLoss(symbols),
      stopLossTriggered: countStopLossTriggered(symbols),
      disabledSymbols: symbols.filter(
        symbol => _.get(symbol, 'isActionDisabled.isDisabled') === true
      ).length,
      maxOpenTradesReached:
        orderLimitEnabled &&
        _.get(common, 'orderStats.numberOfOpenTrades', 0) >= maxOpenTrades,
      maxBuyOpenOrdersReached:
        orderLimitEnabled &&
        _.get(common, 'orderStats.numberOfBuyOpenOrders', 0) >=
          maxBuyOpenOrders,
      apiWeightHigh: usedWeight1m >= 1000,
      streamsNearLimit: _.get(common, 'streamsCount', 0) >= 900
    }
  };
};

const handleLatest = async (logger, ws, payload) => {
  const globalConfiguration = await getConfiguration(logger);

  const { sortByDesc, sortBy, searchKeyword, page } = payload.data;

  // If not authenticated and lock list is enabled, then do not send any information.
  if (
    payload.isAuthenticated === false &&
    globalConfiguration.botOptions.authentication.lockList === true
  ) {
    ws.send(
      JSON.stringify({
        result: true,
        type: 'latest',
        isAuthenticated: payload.isAuthenticated,
        botOptions: globalConfiguration.botOptions,
        configuration: {},
        common: {},
        closedTradesSetting: {},
        closedTrades: [],
        stats: {}
      })
    );

    return;
  }

  const cacheTrailingTradeCommon = await cache.hgetall(
    'trailing-trade-common:',
    'trailing-trade-common:*'
  );

  const cacheTradingViews = _.map(
    await cache.hgetall(
      'trailing-trade-tradingview:',
      'trailing-trade-tradingview:*'
    ),
    tradingView => JSON.parse(tradingView)
  );

  const symbolsPerPage = 12;

  const monitoringSymbolsCount = globalConfiguration.symbols.length;

  const cachedMonitoringSymbolsCount = await countCacheTrailingTradeSymbols(
    logger
  );

  const totalPages = _.ceil(cachedMonitoringSymbolsCount / symbolsPerPage);

  const cacheTrailingTradeSymbols = await getCacheTrailingTradeSymbols(
    logger,
    sortByDesc,
    sortBy,
    page,
    symbolsPerPage,
    searchKeyword
  );

  // Calculate total profit/loss
  const cacheTrailingTradeTotalProfitAndLoss =
    await getCacheTrailingTradeTotalProfitAndLoss(logger);

  const cacheTrailingTradeClosedTrades = _.map(
    await cache.hgetall(
      'trailing-trade-closed-trades:',
      'trailing-trade-closed-trades:*'
    ),
    stats => JSON.parse(stats)
  );

  const streamsCount = await cache.hgetWithoutLock(
    'trailing-trade-streams',
    'count'
  );

  const stats = {
    symbols: await Promise.all(
      _.map(cacheTrailingTradeSymbols, async symbol => {
        const newSymbol = {
          ...symbol,
          isActionDisabled: await isActionDisabled(symbol.symbol)
        };

        return newSymbol;
      })
    ),
    tradingViews: cacheTradingViews
  };

  const cacheTrailingTradeQuoteEstimates =
    await getCacheTrailingTradeQuoteEstimates(logger);
  const quoteEstimatesGroupedByBaseAsset = _.groupBy(
    cacheTrailingTradeQuoteEstimates,
    'baseAsset'
  );

  let common = {};
  const accountInfo = JSON.parse(
    cacheTrailingTradeCommon['account-info'] || '{}'
  );
  accountInfo.balances = (accountInfo.balances || []).map(balance => {
    const quoteEstimate = {
      quote: null,
      estimate: null,
      tickSize: null
    };

    if (quoteEstimatesGroupedByBaseAsset[balance.asset]) {
      quoteEstimate.quote =
        quoteEstimatesGroupedByBaseAsset[balance.asset][0].quoteAsset;
      quoteEstimate.estimate =
        quoteEstimatesGroupedByBaseAsset[balance.asset][0].estimatedValue;
      quoteEstimate.tickSize =
        quoteEstimatesGroupedByBaseAsset[balance.asset][0].tickSize;
    }

    return {
      ...balance,
      ...quoteEstimate
    };
  });

  common = {
    version,
    gitHash: process.env.GIT_HASH || 'unspecified',
    accountInfo,
    apiInfo: binance.client.getInfo(),
    closedTradesSetting: JSON.parse(
      cacheTrailingTradeCommon['closed-trades'] || '{}'
    ),
    orderStats: {
      numberOfOpenTrades: parseInt(
        cacheTrailingTradeCommon['number-of-open-trades'],
        10
      ),
      numberOfBuyOpenOrders: parseInt(
        cacheTrailingTradeCommon['number-of-buy-open-orders'],
        10
      )
    },
    closedTrades: cacheTrailingTradeClosedTrades,
    totalProfitAndLoss: cacheTrailingTradeTotalProfitAndLoss,
    streamsCount,
    monitoringSymbolsCount,
    cachedMonitoringSymbolsCount,
    totalPages
  };

  common.consultation = buildConsultation(
    stats.symbols,
    common,
    globalConfiguration
  );

  logger.info(
    {
      account: common.accountInfo,
      publicURL: common.publicURL,
      stats,
      configuration: globalConfiguration
    },
    'stats'
  );

  ws.send(
    JSON.stringify({
      result: true,
      type: 'latest',
      isAuthenticated: payload.isAuthenticated,
      botOptions: globalConfiguration.botOptions,
      configuration: globalConfiguration,
      common,
      stats
    })
  );
};

module.exports = { handleLatest };
