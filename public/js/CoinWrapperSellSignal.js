/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class CoinWrapperSellSignal extends React.Component {
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

  render() {
    const { symbolInfo, sendWebSocket, isAuthenticated } = this.props;
    const {
      symbolInfo: {
        symbol,
        filterPrice: { tickSize }
      },
      symbolConfiguration,
      quoteAssetBalance: { asset: quoteAsset },
      buy,
      sell
    } = symbolInfo;

    if (sell.openOrders.length > 0) {
      return '';
    }

    const { collapsed } = this.state;

    const precision = parseFloat(tickSize) === 1 ? 0 : tickSize.indexOf(1) - 1;

    const {
      sell: { currentGridTradeIndex, gridTrade }
    } = symbolConfiguration;

    let hiddenCount = 0;

    const sellGridRows = gridTrade.map((grid, i) => {
      const modifiedGridTradeIndex = Math.min(
        Math.max(currentGridTradeIndex, 5),
        gridTrade.length - 5
      );

      function hiddenRow(i) {
        return (
          i >= 3 &&
          (i <= modifiedGridTradeIndex - 3 ||
            i >= modifiedGridTradeIndex + 4) &&
          i < gridTrade.length - 1
        );
      }

      const isNextHidden = hiddenRow(i + 1);
      const isHidden = isNextHidden || hiddenRow(i);

      if (isHidden === true) {
        hiddenCount++;

        return isNextHidden === true ? (
          ''
        ) : (
          <React.Fragment
            key={'coin-wrapper-buy-grid-row-hidden-' + symbol + '-' + (i - 1)}>
            <div className='coin-info-column-grid'>
              <div className='coin-info-column coin-info-column-price'>
                <div className='coin-info-label text-center text-muted'>
                  {t('coin.sellSignal.gridTradeHidden', {
                    hiddenCount: hiddenCount
                  })}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      } else {
        hiddenCount = 0;
      }

      return (
        <React.Fragment key={'coin-wrapper-sell-grid-row-' + symbol + '-' + i}>
          <div className='coin-info-column-grid'>
            <div className='coin-info-column coin-info-column-price'>
              <span className='coin-info-label'>
                {t('coin.sellSignal.gridTrade', { index: i + 1 })}
              </span>

              <div className='coin-info-value'>
                {buy.openOrders.length === 0 &&
                sell.openOrders.length === 0 &&
                currentGridTradeIndex === i ? (
                  <SymbolTriggerSellIcon
                    symbol={symbol}
                    sendWebSocket={sendWebSocket}
                    isAuthenticated={isAuthenticated}></SymbolTriggerSellIcon>
                ) : (
                  ''
                )}

                <OverlayTrigger
                  trigger='click'
                  key={'sell-signal-' + symbol + '-' + i + '-overlay'}
                  placement='bottom'
                  overlay={
                    <Popover
                      id={'sell-signal-' + symbol + '-' + i + '-overlay-right'}>
                      <Popover.Content>
                        {grid.executed ? (
                          <React.Fragment>
                            {t('coin.sellSignal.executed', {
                              index: i + 1,
                              timeFromNow: moment(
                                grid.executedOrder.updateTime
                              ).fromNow(),
                              time: moment(
                                grid.executedOrder.updateTime
                              ).format()
                            })}
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            {t('coin.sellSignal.notExecuted', { index: i + 1 })}{' '}
                            {currentGridTradeIndex === i
                              ? t('coin.sellSignal.waitingExecution')
                              : t('coin.sellSignal.waitingPrevious', {
                                  index: i
                                })}
                          </React.Fragment>
                        )}
                      </Popover.Content>
                    </Popover>
                  }>
                  <Button
                    variant='link'
                    className='p-0 m-0 ml-1 text-warning d-inline-block'
                    style={{ lineHeight: '17px' }}>
                    {grid.executed ? (
                      // If already executed, then shows executed icon.
                      <i className='fas fa-check-square'></i>
                    ) : currentGridTradeIndex === i ? (
                      <i className='far fa-clock'></i>
                    ) : (
                      <i className='far fa-clock text-muted'></i>
                    )}
                  </Button>
                </OverlayTrigger>

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
            </div>

            {sell.triggerPrice && currentGridTradeIndex === i ? (
              <div className='coin-info-column coin-info-column-price'>
                <div
                  className='coin-info-label d-flex flex-row justify-content-start'
                  style={{ flex: '0 100%' }}>
                  <span
                    className={
                      sell.conservativeModeApplicable ? 'text-warning' : ''
                    }>
                    &#62;{' '}
                    {sell.conservativeModeApplicable
                      ? t('coin.sellSignal.reduced')
                      : ''}{' '}
                    {t('coin.sellSignal.triggerPrice')} (
                    {(parseFloat(sell.triggerPercentage - 1) * 100).toFixed(2)}
                    %):
                  </span>
                </div>
                <HightlightChange className='coin-info-value'>
                  {parseFloat(sell.triggerPrice).toFixed(precision)}
                </HightlightChange>
              </div>
            ) : (
              ''
            )}
            {sell.difference && currentGridTradeIndex === i ? (
              <div className='coin-info-column coin-info-column-price'>
                <span className='coin-info-label'>
                  {t('coin.sellSignal.differenceToSell')}
                </span>
                <HightlightChange
                  className='coin-info-value'
                  id='sell-difference'>
                  {parseFloat(sell.difference).toFixed(2)}%
                </HightlightChange>
              </div>
            ) : (
              ''
            )}

            {grid.executed && grid.executedOrder.currentGridTradeIndex === i ? (
              <div
                className={`coin-info-content-setting ${
                  collapsed ? 'd-none' : ''
                }`}>
                <div className='coin-info-column coin-info-column-order'>
                  <span className='coin-info-label'>
                    {t('coin.sellSignal.soldDate')}
                  </span>
                  <div className='coin-info-value'>
                    {moment(grid.executedOrder.transactTime).format(
                      'YYYY-MM-DD HH:mm'
                    )}
                  </div>
                </div>
                <div className='coin-info-column coin-info-column-order'>
                  <span className='coin-info-label'>
                    {t('coin.sellSignal.soldPrice')}
                  </span>
                  <div className='coin-info-value'>
                    {parseFloat(grid.executedOrder.price).toFixed(precision)}
                  </div>
                </div>
                <div className='coin-info-column coin-info-column-order'>
                  <span className='coin-info-label'>
                    {t('coin.sellSignal.soldQty')}
                  </span>
                  <div className='coin-info-value'>
                    {parseFloat(grid.executedOrder.executedQty)}
                  </div>
                </div>
                <div className='coin-info-column coin-info-column-order'>
                  <span className='coin-info-label'>
                    {t('coin.sellSignal.soldAmount')}
                  </span>
                  <div className='coin-info-value'>
                    {parseFloat(grid.executedOrder.cummulativeQuoteQty).toFixed(
                      precision
                    )}
                  </div>
                </div>
              </div>
            ) : (
              ''
            )}

            <div
              className={`coin-info-content-setting ${
                collapsed ? 'd-none' : ''
              }`}>
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>
                  {t('coin.sellSignal.triggerPercentage')}
                </span>
                <div className='coin-info-value'>
                  {((sell.triggerPercentage - 1) * 100).toFixed(2)}%
                </div>
              </div>
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>
                  {t('coin.sellSignal.stopPercentage')}
                </span>
                <div className='coin-info-value'>
                  {((grid.stopPercentage - 1) * 100).toFixed(2)}%
                </div>
              </div>
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>
                  {t('coin.sellSignal.limitPercentage')}
                </span>
                <div className='coin-info-value'>
                  {((grid.limitPercentage - 1) * 100).toFixed(2)}%
                </div>
              </div>
              <div className='coin-info-column coin-info-column-order'>
                <span className='coin-info-label'>
                  {t('coin.sellSignal.quantityPercentage')}
                </span>
                <div className='coin-info-value'>
                  {(grid.quantityPercentage * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    });

    if (sell.lastBuyPrice > 0) {
      return (
        <div className='coin-info-sub-wrapper'>
          <div className='coin-info-column coin-info-column-title'>
            <div className='coin-info-label'>
              {symbolConfiguration.sell.conservativeMode.enabled &&
              symbolConfiguration.sell.enabled ? (
                <span>
                  {t('coin.sellSignal.conservativeMode', {
                    percentage: (
                      (1 - symbolConfiguration.sell.conservativeMode.factor) *
                      100
                    ).toFixed(0)
                  })}{' '}
                </span>
              ) : (
                <span>{t('coin.sellSignal.title')} </span>
              )}
              <span className='coin-info-value'>
                {symbolConfiguration.sell.enabled ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </span>{' '}
              / {t('coin.sellSignal.stopLoss')}{' '}
              <span className='coin-info-value'>
                {symbolConfiguration.sell.stopLoss.enabled ? (
                  <i className='fas fa-toggle-on'></i>
                ) : (
                  <i className='fas fa-toggle-off'></i>
                )}
              </span>
            </div>
            {symbolConfiguration.sell.enabled === false ? (
              <HightlightChange className='coin-info-message badge-pill badge-danger'>
                {t('coin.sellSignal.tradingDisabled')}
              </HightlightChange>
            ) : (
              ''
            )}
          </div>

          {sell.currentPrice ? (
            <div className='coin-info-column coin-info-column-price'>
              <span className='coin-info-label'>
                {t('coin.sellSignal.currentPrice')}
              </span>
              <HightlightChange className='coin-info-value'>
                {parseFloat(sell.currentPrice).toFixed(precision)}
              </HightlightChange>
            </div>
          ) : (
            ''
          )}
          <CoinWrapperSellLastBuyPrice
            symbolInfo={symbolInfo}
            sendWebSocket={sendWebSocket}
            isAuthenticated={isAuthenticated}></CoinWrapperSellLastBuyPrice>
          {sell.currentProfit ? (
            <div className='coin-info-column coin-info-column-price'>
              <span className='coin-info-label'>
                {t('coin.sellSignal.profitLoss')}
              </span>
              <HightlightChange
                className={`coin-info-value ${
                  sell.currentProfit >= 0 ? 'text-success' : 'text-danger'
                }`}>
                {parseFloat(sell.currentProfit).toFixed(precision)} {quoteAsset}{' '}
                ({parseFloat(sell.currentProfitPercentage).toFixed(2)}
                %)
              </HightlightChange>
            </div>
          ) : (
            ''
          )}
          {sellGridRows}
          {symbolConfiguration.sell.stopLoss.enabled &&
          sell.stopLossTriggerPrice ? (
            <div className='d-flex flex-column w-100'>
              <div className='coin-info-column coin-info-column-price divider'></div>
              <div className='coin-info-column coin-info-column-stop-loss-price'>
                <span className='coin-info-label'>
                  {t('coin.sellSignal.stopLossPrice')} (
                  {(
                    (symbolConfiguration.sell.stopLoss.maxLossPercentage - 1) *
                    100
                  ).toFixed(2)}
                  %) :
                </span>
                <HightlightChange className='coin-info-value'>
                  {parseFloat(sell.stopLossTriggerPrice).toFixed(precision)}
                </HightlightChange>
              </div>
              <div className='coin-info-column coin-info-column-stop-loss-price'>
                <span className='coin-info-label'>
                  {t('coin.sellSignal.differenceToStopLoss')}
                </span>
                <HightlightChange className='coin-info-value'>
                  {parseFloat(sell.stopLossDifference).toFixed(2)}%
                </HightlightChange>
              </div>
            </div>
          ) : (
            ''
          )}
          {sell.processMessage ? (
            <div className='d-flex flex-column w-100'>
              <div className='coin-info-column coin-info-column-price divider'></div>
              <div className='coin-info-column coin-info-column-message'>
                <HightlightChange className='coin-info-message text-warning'>
                  {sell.processMessage}
                </HightlightChange>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      );
    }

    return (
      <div className='coin-info-sub-wrapper'>
        <div className='coin-info-column coin-info-column-title'>
          <div className='coin-info-label'>
            {symbolConfiguration.sell.conservativeMode.enabled &&
            symbolConfiguration.sell.enabled ? (
              <span>
                Conservative Sell (
                {(
                  (1 - symbolConfiguration.sell.conservativeMode.factor) *
                  100
                ).toFixed(0)}
                %){' '}
              </span>
            ) : (
              <span>{t('coin.sellSignal.title')} </span>
            )}
            <span className='coin-info-value'>
              {symbolConfiguration.sell.enabled ? (
                <i className='fas fa-toggle-on'></i>
              ) : (
                <i className='fas fa-toggle-off'></i>
              )}
            </span>{' '}
            / {t('coin.sellSignal.stopLoss')}{' '}
            {symbolConfiguration.sell.stopLoss.enabled
              ? `(` +
                (
                  (symbolConfiguration.sell.stopLoss.maxLossPercentage - 1) *
                  100
                ).toFixed(2) +
                `%) `
              : ''}
            <span className='coin-info-value'>
              {symbolConfiguration.sell.stopLoss.enabled ? (
                <i className='fas fa-toggle-on'></i>
              ) : (
                <i className='fas fa-toggle-off'></i>
              )}
            </span>
          </div>
          {symbolConfiguration.sell.enabled === false ? (
            <HightlightChange className='coin-info-message badge-pill badge-danger'>
              {t('coin.sellSignal.tradingDisabled')}
            </HightlightChange>
          ) : (
            ''
          )}
        </div>

        <CoinWrapperSellLastBuyPrice
          symbolInfo={symbolInfo}
          sendWebSocket={sendWebSocket}
          isAuthenticated={isAuthenticated}></CoinWrapperSellLastBuyPrice>
      </div>
    );
  }
}
