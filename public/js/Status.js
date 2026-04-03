/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class Status extends React.Component {
  render() {
    const {
      apiInfo,
      monitoringSymbolsCount,
      cachedMonitoringSymbolsCount,
      streamsCount,
      consultation
    } = this.props;

    if (!apiInfo) {
      return '';
    }

    let monitoringSymbolsStatus = '';
    const marketConsultation = (consultation || {}).market || {};
    const riskConsultation = (consultation || {}).risk || {};

    if (monitoringSymbolsCount < cachedMonitoringSymbolsCount) {
      monitoringSymbolsStatus = (
        <OverlayTrigger
          trigger='click'
          key='monitoring-symbols-status-alert-overlay'
          placement='top'
          overlay={
            <Popover id='monitoring-symbols-status-alert-overlay-bottom'>
              <Popover.Content>
                {t('status.monitoringSymbolsInfo')}
              </Popover.Content>
            </Popover>
          }>
          <Button
            variant='link'
            className='p-0 m-0 ml-1 d-inline-block'
            style={{ lineHeight: '14px' }}>
            <i className='fas fa-exclamation-circle mx-1 text-warning'></i>
          </Button>
        </OverlayTrigger>
      );
    }

    return (
      <div className='accordion-wrapper status-wrapper'>
        <Accordion defaultActiveKey='0'>
          <Card bg='dark'>
            <Accordion.Toggle
              as={Card.Header}
              eventKey='0'
              className='px-2 py-1'>
              <button
                type='button'
                className='btn btn-sm btn-link btn-status text-uppercase font-weight-bold'>
                {t('status.title')}
              </button>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey='0'>
              <Card.Body className='status-wrapper-body p-3 card-body'>
                <ul className='status-wrapper-ul list-unstyled mb-0'>
                  <li className='text-muted small mb-2'>
                    {t('status.beginnerTip')}
                  </li>
                  <li>
                    {t('status.usedWeight')}{' '}
                    <HightlightChange className='coin-info-value'>
                      {apiInfo.spot.usedWeight1m}
                    </HightlightChange>
                    /1200
                  </li>
                  <li>
                    {t('status.streamsCount')}{' '}
                    <HightlightChange className='coin-info-value'>
                      {streamsCount}
                    </HightlightChange>
                  </li>
                  <li>
                    {t('status.monitoringSymbols')}{' '}
                    <HightlightChange className='coin-info-value'>
                      {monitoringSymbolsCount}
                    </HightlightChange>
                    {monitoringSymbolsStatus}
                  </li>
                  <li>
                    {t('status.buySideSignals')}{' '}
                    <HightlightChange className='coin-info-value'>
                      {marketConsultation.buySignals || 0}
                    </HightlightChange>
                  </li>
                  <li>
                    {t('status.sellSideSignals')}{' '}
                    <HightlightChange className='coin-info-value'>
                      {marketConsultation.sellSignals || 0}
                    </HightlightChange>
                  </li>
                  <li>
                    {t('status.nearStopLoss')}{' '}
                    <HightlightChange className='coin-info-value'>
                      {riskConsultation.nearStopLoss || 0}
                    </HightlightChange>
                  </li>
                  <li>
                    {t('status.disabledSymbols')}{' '}
                    <HightlightChange className='coin-info-value'>
                      {riskConsultation.disabledSymbols || 0}
                    </HightlightChange>
                  </li>
                </ul>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </div>
    );
  }
}
