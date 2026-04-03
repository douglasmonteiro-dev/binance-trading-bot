/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class CoinWrapperAction extends React.Component {
  render() {
    const {
      symbolInfo: {
        symbol,
        action,
        buy,
        isLocked,
        isActionDisabled,
        overrideData
      },
      sendWebSocket,
      isAuthenticated
    } = this.props;

    let label;
    switch (action) {
      case 'buy':
        label = t('coin.action.buy');
        break;
      case 'buy-temporary-disabled':
        label = t('coin.action.tempDisabledBuy');
        break;
      case 'buy-order-checking':
        label = t('coin.action.checkingBuyOrder');
        break;
      case 'buy-order-wait':
        label = t('coin.action.waitBuy');
        break;
      case 'sell':
        label = t('coin.action.sell');
        break;
      case 'sell-temporary-disabled':
        label = t('coin.action.tempDisabledSell');
        break;
      case 'sell-stop-loss':
        label = t('coin.action.stopLoss');
        break;
      case 'sell-order-checking':
        label = t('coin.action.checkingSellOrder');
        break;
      case 'sell-order-wait':
        label = t('coin.action.waitSell');
        break;
      case 'sell-wait':
        label = t('coin.action.wait');
        break;
      default:
        label = t('coin.action.wait');
    }

    if (isLocked) {
      label = t('coin.action.locked');
    }

    if (isActionDisabled.isDisabled) {
      label = t('coin.action.disabledBy', {
        disabledBy: isActionDisabled.disabledBy
      });
    }

    let renderOverrideAction = '';
    if (_.isEmpty(overrideData) === false) {
      renderOverrideAction = (
        <div className='coin-info-column coin-info-column-title border-bottom-0 m-0 p-0'>
          <div
            className='w-100 px-1 text-warning'
            title={overrideData.actionAt}>
            {t('coin.action.willBeExecuted', {
              action: overrideData.action,
              timeFromNow: moment(overrideData.actionAt).fromNow(),
              triggeredBy: overrideData.triggeredBy
            })}
          </div>
        </div>
      );
    }

    const updatedAt = moment
      .utc(buy.updatedAt, 'YYYY-MM-DDTHH:mm:ss.SSSSSS')
      .local();
    const currentTime = moment.utc().local();

    return (
      <div className='coin-info-sub-wrapper'>
        <div className='coin-info-column coin-info-column-title border-bottom-0 mb-0 pb-0'>
          <div className='coin-info-label'>
            {t('coin.action.label')} -{' '}
            <HightlightChange className='coin-info-value' id='updated-at'>
              {updatedAt.format('HH:mm:ss')}
            </HightlightChange>
            {isLocked === true ? <i className='fas fa-lock ml-1'></i> : ''}
            {isActionDisabled.isDisabled === true ? (
              <i className='fas fa-pause-circle ml-1 text-warning'></i>
            ) : (
              ''
            )}
            {updatedAt.isBefore(currentTime, 'minute') ? (
              <OverlayTrigger
                trigger='click'
                key='action-updated-at-alert-overlay'
                placement='bottom'
                overlay={
                  <Popover id='action-updated-at-alert-overlay-right'>
                    <Popover.Content>
                      {t('coin.action.priceNotUpdated')}
                      <br />
                      <br />
                      {t('coin.action.lastUpdated')} {updatedAt.fromNow()}
                    </Popover.Content>
                  </Popover>
                }>
                <Button
                  variant='link'
                  className='p-0 m-0 ml-1 text-white-50 d-inline-block'
                  style={{ lineHeight: '17px' }}>
                  <i className='fas fa-exclamation-circle mx-1'></i>
                </Button>
              </OverlayTrigger>
            ) : (
              ''
            )}
          </div>

          <div className='d-flex flex-column align-items-end'>
            <HightlightChange
              className={`action-label ${
                label.length < 10 ? 'badge-pill badge-dark' : ''
              }`}>
              {label}
            </HightlightChange>
            {isActionDisabled.isDisabled === true ? (
              <div className='ml-1'>
                {isActionDisabled.canResume === true ? (
                  <SymbolEnableActionIcon
                    symbol={symbol}
                    className='mr-1'
                    sendWebSocket={sendWebSocket}
                    isAuthenticated={isAuthenticated}></SymbolEnableActionIcon>
                ) : (
                  ''
                )}
                ({moment.duration(isActionDisabled.ttl, 'seconds').humanize()}{' '}
                {t('coin.action.left')}){' '}
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
        {renderOverrideAction}
      </div>
    );
  }
}
