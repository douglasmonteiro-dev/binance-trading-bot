/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class CoinWrapperTradingViews extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { connected, symbolInfo, symbolTradingViews } = this.props;

    if (_.isEmpty(symbolTradingViews)) {
      return '';
    }

    const { symbol } = symbolInfo;

    const symbolTradingViewsWrappers = symbolTradingViews.map(tradingView => (
      <CoinWrapperTradingView
        key={`coin-wrapper-tradingview-${symbolInfo.symbol}-${tradingView.request.interval}`}
        connected={connected}
        symbolInfo={symbolInfo}
        tradingView={tradingView}
      />
    ));

    return (
      <div className='coin-info-sub-wrapper'>
        <div className='coin-info-column coin-info-column-title'>
          <div className='coin-info-label'>{t('coin.tradingView.title')}</div>
          <div className='coin-info-value'>
            <a
              href={
                'https://www.tradingview.com/symbols/' + symbol + '/technicals/'
              }
              rel='noopener noreferrer'
              target='_blank'>
              {t('coin.tradingView.technicalAnalysis')}
            </a>{' '}
            &nbsp; | &nbsp;
            <a
              href={'https://www.tradingview.com/chart/?symbol=' + symbol}
              rel='noopener noreferrer'
              target='_blank'>
              {t('coin.tradingView.chart')}
            </a>
          </div>
        </div>
        {symbolTradingViewsWrappers}
      </div>
    );
  }
}
