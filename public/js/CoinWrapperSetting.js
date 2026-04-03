/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class CoinWrapperSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true
    };

    this.toggleCollapse = this.toggleCollapse.bind(this);
  }

  toggleCollapse() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  isCustomised = configurationKeyName =>
    configurationKeyName !== 'configuration';

  jsonValueAtPath = (obj, path) => {
    // Extract the value of the object at the given path
    const value = path.split('.').reduce((acc, key) => {
      if (key.includes('[')) {
        const index = key.match(/\d+/)[0];
        const arrKey = key.split('[')[0];
        return acc[arrKey][index];
      } else {
        if (acc && acc.hasOwnProperty(key)) return acc[key];
        else return -1;
      }
    }, obj);
    return value;
  };

  warnIfAttributeCustomised = (path, globalPath = path) => {
    if (
      this.jsonValueAtPath(this.props.symbolInfo.symbolConfiguration, path) !==
      this.jsonValueAtPath(this.props.configuration, globalPath)
    )
      return 'text-warning';
    else return '';
  };

  render() {
    const { collapsed } = this.state;
    const { symbolInfo } = this.props;
    const { symbolConfiguration } = symbolInfo;

    const {
      symbol,
      quoteAssetBalance: { asset: quoteAsset }
    } = symbolInfo;

    const {
      key: configurationKeyName,
      buy: { gridTrade: buyGridTrade },
      sell: { gridTrade: sellGridTrade },
      botOptions: { tradingViews }
    } = symbolConfiguration;

    const buyGridRows = buyGridTrade.map((grid, i) => {
      return (
        <React.Fragment
          key={'coin-wrapper-setting-buy-grid-row-' + symbol + '-' + i}>
          <div className='coin-info-column-grid'>
            <div className='coin-info-column coin-info-column-order'>
              <span className='coin-info-label'>
                {t('coin.setting.gridTrade', { index: i + 1 })}
              </span>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                `buy.gridTrade[${i}].triggerPercentage`
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.triggerPercentage')}{' '}
                <strong>
                  {i === 0
                    ? t('coin.setting.lowestPrice')
                    : t('coin.setting.lastBuyPrice')}
                </strong>
                :
              </span>
              <div className='coin-info-value'>
                {(parseFloat(grid.triggerPercentage - 1) * 100).toFixed(2)}%
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                `buy.gridTrade[${i}].stopPercentage`
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.stopPercentage')}
              </span>
              <div className='coin-info-value'>
                {(parseFloat(grid.stopPercentage - 1) * 100).toFixed(2)}%
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                `buy.gridTrade[${i}].limitPercentage`
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.limitPercentage')}
              </span>
              <div className='coin-info-value'>
                {(parseFloat(grid.limitPercentage - 1) * 100).toFixed(2)}%
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                `buy.gridTrade[${i}].minPurchaseAmount`,
                `buy.gridTrade[${i}].minPurchaseAmounts.${quoteAsset}`
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.minPurchaseAmount')}
              </span>
              <div className='coin-info-value'>
                {grid.minPurchaseAmount} {quoteAsset}
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                `buy.gridTrade[${i}].maxPurchaseAmount`,
                `buy.gridTrade[${i}].maxPurchaseAmounts.${quoteAsset}`
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.maxPurchaseAmount')}
              </span>
              <div className='coin-info-value'>
                {grid.maxPurchaseAmount} {quoteAsset}
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    });

    const sellGridRows = sellGridTrade.map((grid, i) => {
      return (
        <React.Fragment
          key={'coin-wrapper-setting-sell-grid-row-' + symbol + '-' + i}>
          <div className='coin-info-column-grid'>
            <div className='coin-info-column coin-info-column-order'>
              <span className='coin-info-label'>
                {t('coin.setting.gridTrade', { index: i + 1 })}
              </span>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                `sell.gridTrade[${i}].triggerPercentage`
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.triggerPercentage')}
              </span>
              <div className='coin-info-value'>
                {(parseFloat(grid.triggerPercentage - 1) * 100).toFixed(2)}%
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                `sell.gridTrade[${i}].stopPercentage`
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.stopPercentage')}
              </span>
              <div className='coin-info-value'>
                {(parseFloat(grid.stopPercentage - 1) * 100).toFixed(2)}%
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                `sell.gridTrade[${i}].limitPercentage`
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.limitPercentage')}
              </span>
              <div className='coin-info-value'>
                {(parseFloat(grid.limitPercentage - 1) * 100).toFixed(2)}%
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                `sell.gridTrade[${i}].quantityPercentage`,
                `sell.gridTrade[${i}].quantityPercentages.${quoteAsset}`
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.quantityPercentage')}
              </span>
              <div className='coin-info-value'>
                {(parseFloat(grid.quantityPercentage) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    });

    const tradingViewRows = (tradingViews || []).map((tv, i) => {
      return (
        <React.Fragment
          key={'coin-wrapper-setting-tradingview-grid-row' + symbol + '-' + i}>
          <div className='coin-info-column-grid'>
            <div className='coin-info-column coin-info-column-order'>
              <span className='coin-info-label'>TradingView #{i + 1}</span>
            </div>
            <div className='coin-info-column coin-info-column-order'>
              <span className='coin-info-label'>
                {t('coin.setting.interval')}
              </span>
              <div className='coin-info-value'>{tv.interval}</div>
            </div>
            <div className='coin-info-column coin-info-column-order'>
              <span className='coin-info-label'>
                {t('coin.setting.buyTriggerStrongBuy')}
              </span>
              <span className='coin-info-value'>
                {tv.buy.whenStrongBuy ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </span>
            </div>
            <div className='coin-info-column coin-info-column-order'>
              <span className='coin-info-label'>
                {t('coin.setting.buyTriggerBuy')}
              </span>
              <span className='coin-info-value'>
                {tv.buy.whenBuy ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </span>
            </div>
            <div className='coin-info-column coin-info-column-order'>
              <span className='coin-info-label'>
                {t('coin.setting.forceSellNeutral')}
              </span>
              <span className='coin-info-value'>
                {tv.sell.forceSellOverZeroBelowTriggerPrice.whenNeutral ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </span>
            </div>
            <div className='coin-info-column coin-info-column-order'>
              <span className='coin-info-label'>
                {t('coin.setting.forceSellSell')}
              </span>
              <span className='coin-info-value'>
                {tv.sell.forceSellOverZeroBelowTriggerPrice.whenSell ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </span>
            </div>
            <div className='coin-info-column coin-info-column-order'>
              <span className='coin-info-label'>
                {t('coin.setting.forceSellStrongSell')}
              </span>
              <span className='coin-info-value'>
                {tv.sell.forceSellOverZeroBelowTriggerPrice.whenStrongSell ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </span>
            </div>
          </div>
        </React.Fragment>
      );
    });

    return (
      <div className='coin-info-sub-wrapper coin-info-sub-wrapper-setting'>
        <div className='coin-info-column coin-info-column-title coin-info-column-title-setting'>
          <div className='coin-info-label'>
            <div className='mr-1'>
              {t('coin.setting.title')}{' '}
              {this.isCustomised(configurationKeyName) ? (
                <Badge pill variant='warning'>
                  {t('coin.setting.customised')}
                </Badge>
              ) : (
                <Badge pill variant='light'>
                  {t('coin.setting.global')}
                </Badge>
              )}
            </div>
          </div>

          <button
            type='button'
            className='btn btn-sm btn-link p-0 ml-1'
            onClick={this.toggleCollapse}>
            <i
              className={`fas ${
                collapsed ? 'fa-arrow-right' : 'fa-arrow-down'
              }`}></i>
          </button>
        </div>
        <div
          className={`coin-info-content-setting ${collapsed ? 'd-none' : ''}`}>
          <div className='coin-info-sub-wrapper'>
            <div className='coin-info-sub-label'>
              {t('coin.setting.candles')}
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'candles.interval'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.interval')}
              </span>
              <div className='coin-info-value'>
                {symbolConfiguration.candles.interval}
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'candles.limit'
              )}`}>
              <span className='coin-info-label'>{t('coin.setting.limit')}</span>
              <div className='coin-info-value'>
                {symbolConfiguration.candles.limit}
              </div>
            </div>
          </div>

          <div className='coin-info-sub-wrapper'>
            <div className='coin-info-sub-label'>{t('coin.setting.buy')}</div>
            <div
              className={`coin-info-column coin-info-column-order ${
                this.warnIfAttributeCustomised('buy.enabled')
                  ? 'text-warning'
                  : ''
              }`}>
              <span className='coin-info-label'>
                {t('coin.setting.tradingEnabled')}
              </span>
              <span className='coin-info-value'>
                {symbolConfiguration.buy.enabled ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </span>
            </div>
            {buyGridRows}
          </div>
          <div className='coin-info-sub-wrapper'>
            <div className='coin-info-sub-label'>
              {t('coin.setting.buyLastBuyPriceRemoval')}
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'buy.lastBuyPriceRemoveThreshold'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.removeLastBuyPriceUnder')}
              </span>
              <div className='coin-info-value'>
                {symbolConfiguration.buy.lastBuyPriceRemoveThreshold}{' '}
                {quoteAsset}
              </div>
            </div>
          </div>
          <div className='coin-info-sub-wrapper'>
            <div className='coin-info-sub-label'>
              {t('coin.setting.buyRestrictionATH')}
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'buy.athRestriction.enabled'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.restrictionEnabled')}
              </span>
              <span className='coin-info-value'>
                {symbolConfiguration.buy.athRestriction.enabled ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </span>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'buy.athRestriction.candles.interval'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.candlesInterval')}
              </span>
              <div className='coin-info-value'>
                {symbolConfiguration.buy.athRestriction.candles.interval}
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'buy.athRestriction.candles.limit'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.candlesLimit')}
              </span>
              <div className='coin-info-value'>
                {symbolConfiguration.buy.athRestriction.candles.limit}
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'buy.athRestriction.restrictionPercentage'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.restrictionPercentage')}
              </span>
              <div className='coin-info-value'>
                {(
                  (symbolConfiguration.buy.athRestriction
                    .restrictionPercentage -
                    1) *
                  100
                ).toFixed(2)}
                %
              </div>
            </div>
          </div>

          <div className='coin-info-sub-wrapper'>
            <div className='coin-info-sub-label'>{t('coin.setting.sell')}</div>
            <div
              className={`coin-info-column coin-info-column-order ${
                this.warnIfAttributeCustomised('sell.enabled')
                  ? 'text-warning'
                  : ''
              }`}>
              <span className='coin-info-label'>
                {t('coin.setting.tradingEnabled')}
              </span>
              <span className='coin-info-value'>
                {symbolConfiguration.sell.enabled ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </span>
            </div>
            {sellGridRows}
          </div>

          <div className='coin-info-sub-wrapper'>
            <div className='coin-info-sub-label'>
              {t('coin.setting.sellStopLoss')}
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'sell.stopLoss.enabled'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.stopLossEnabled')}
              </span>
              <span className='coin-info-value'>
                {symbolConfiguration.sell.stopLoss.enabled ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </span>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'sell.stopLoss.maxLossPercentage'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.maxLossPercentage')}
              </span>
              <div className='coin-info-value'>
                {(
                  (symbolConfiguration.sell.stopLoss.maxLossPercentage - 1) *
                  100
                ).toFixed(2)}
                %
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'sell.stopLoss.disableBuyMinutes'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.tempDisableBuy')}
              </span>
              <div className='coin-info-value'>
                {moment
                  .duration(
                    symbolConfiguration.sell.stopLoss.disableBuyMinutes,
                    'minutes'
                  )
                  .humanize()}
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'sell.stopLoss.orderType'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.orderType')}
              </span>
              <div className='coin-info-value'>
                {symbolConfiguration.sell.stopLoss.orderType}
              </div>
            </div>
          </div>

          <div className='coin-info-sub-wrapper'>
            <div className='coin-info-sub-label'>
              {t('coin.setting.tradingViews')}
            </div>
            {tradingViewRows}

            {symbolConfiguration.botOptions.tradingViewOptions ? (
              <React.Fragment>
                <div className='coin-info-column coin-info-column-order'>
                  <span className='coin-info-label'>
                    {t('coin.setting.useDataOnlyUpdatedWithin')}
                  </span>
                  <span className='coin-info-value'>
                    {
                      symbolConfiguration.botOptions.tradingViewOptions
                        .useOnlyWithin
                    }
                  </span>
                </div>
                <div className='coin-info-column coin-info-column-order'>
                  <span className='coin-info-label'>
                    {t('coin.setting.ifDataExpired')}
                  </span>
                  <span className='coin-info-value'>
                    {symbolConfiguration.botOptions.tradingViewOptions
                      .ifExpires === 'ignore'
                      ? t('coin.setting.ignoreData')
                      : t('coin.setting.doNotBuy')}
                  </span>
                </div>
              </React.Fragment>
            ) : (
              ''
            )}
          </div>

          <div className='coin-info-sub-wrapper'>
            <div className='coin-info-sub-label'>
              {t('coin.setting.autoTriggerBuy')}
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'botOptions.autoTriggerBuy.enabled'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.enabled')}
              </span>
              <span className='coin-info-value'>
                {symbolConfiguration.botOptions.autoTriggerBuy.enabled ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </span>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'botOptions.autoTriggerBuy.triggerAfter'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.triggerAfter')}
              </span>
              <div className='coin-info-value'>
                {moment
                  .duration(
                    symbolConfiguration.botOptions.autoTriggerBuy.triggerAfter,
                    'minutes'
                  )
                  .humanize()}
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'botOptions.autoTriggerBuy.conditions.whenLessThanATHRestriction'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.rescheduleOverATH')}
              </span>
              <div className='coin-info-value'>
                {symbolConfiguration.botOptions.autoTriggerBuy.conditions
                  .whenLessThanATHRestriction ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </div>
            </div>
            <div
              className={`coin-info-column coin-info-column-order ${this.warnIfAttributeCustomised(
                'botOptions.autoTriggerBuy.conditions.afterDisabledPeriod'
              )}`}>
              <span className='coin-info-label'>
                {t('coin.setting.rescheduleDisabled')}
              </span>
              <div className='coin-info-value'>
                {symbolConfiguration.botOptions.autoTriggerBuy.conditions
                  .afterDisabledPeriod ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
