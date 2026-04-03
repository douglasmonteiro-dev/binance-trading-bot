/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SymbolSettingIcon extends React.Component {
  constructor(props) {
    super(props);

    this.modalToStateMap = {
      setting: 'showSettingModal'
    };

    this.state = {
      showSettingModal: false,
      symbolConfiguration: {},
      validation: {}
    };

    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);

    this.handleInputChange = this.handleInputChange.bind(this);

    this.handleGridTradeChange = this.handleGridTradeChange.bind(this);
    this.handleBotOptionsChange = this.handleBotOptionsChange.bind(this);

    this.handleSetValidation = this.handleSetValidation.bind(this);
  }

  componentDidUpdate(nextProps) {
    // Only update symbol configuration, when the modal is closed and different.
    if (
      this.state.showSettingModal === false &&
      _.get(nextProps, 'symbolInfo.symbolConfiguration', null) !== null &&
      _.isEqual(
        _.get(nextProps, 'symbolInfo.symbolConfiguration', null),
        this.state.symbolConfiguration
      ) === false
    ) {
      this.setState({
        symbolConfiguration: nextProps.symbolInfo.symbolConfiguration
      });
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();

    this.handleModalClose('setting');

    // Send with symbolInfo
    const { symbolInfo, tradingViewIntervals } = this.props;
    const newSymbolInfo = symbolInfo;

    const { symbolConfiguration } = this.state;

    // Sorting botOptions.tradingViews by interval
    symbolConfiguration.botOptions.tradingViews = (
      symbolConfiguration.botOptions.tradingViews || []
    ).sort((a, b) => {
      const aIdx = tradingViewIntervals.indexOf(a.interval);
      const bIdx = tradingViewIntervals.indexOf(b.interval);
      return aIdx - bIdx;
    });

    newSymbolInfo.configuration = symbolConfiguration;

    this.props.sendWebSocket('symbol-setting-update', newSymbolInfo);
  }

  handleModalShow(modal) {
    this.setState({
      [this.modalToStateMap[modal]]: true
    });
  }

  handleModalClose(modal) {
    this.setState({
      [this.modalToStateMap[modal]]: false
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value =
      target.type === 'checkbox'
        ? target.checked
        : target.type === 'number'
        ? +target.value
        : target.value;
    const stateKey = target.getAttribute('data-state-key');

    const { symbolConfiguration } = this.state;

    this.setState({
      symbolConfiguration: _.set(symbolConfiguration, stateKey, value)
    });
  }

  handleGridTradeChange(type, newGrid) {
    const { symbolConfiguration } = this.state;

    this.setState({
      symbolConfiguration: _.set(
        symbolConfiguration,
        `${type}.gridTrade`,
        newGrid
      )
    });
  }

  handleBotOptionsChange(newBotOptions) {
    const { symbolConfiguration } = this.state;

    this.setState({
      symbolConfiguration: _.set(
        symbolConfiguration,
        'botOptions',
        newBotOptions
      )
    });
  }

  handleSetValidation(type, isValid) {
    const { validation } = this.state;
    this.setState({ validation: { ...validation, [type]: isValid } });
  }

  render() {
    const { symbolInfo, isAuthenticated, tradingViewIntervals } = this.props;
    const { symbolConfiguration } = this.state;

    if (_.isEmpty(symbolConfiguration) || isAuthenticated === false) {
      return '';
    }

    const {
      symbolInfo: { quoteAsset, filterMinNotional }
    } = symbolInfo;
    const minNotional = parseFloat(filterMinNotional.minNotional);

    return (
      <div className='symbol-setting-icon-wrapper'>
        <button
          type='button'
          className='btn btn-sm btn-link p-0'
          onClick={() => this.handleModalShow('setting')}>
          <i className='fas fa-cog'></i>
        </button>
        <Modal
          show={this.state.showSettingModal}
          onHide={() => this.handleModalClose('setting')}
          size='xl'>
          <Form onSubmit={this.handleFormSubmit}>
            <Modal.Header className='pt-1 pb-1'>
              <Modal.Title>
                {t('symbolSettings.title', { symbol: symbolInfo.symbol })}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className='alert alert-info small mb-2'>
                <div className='font-weight-bold mb-1'>
                  {t('symbolSettings.whenToCustomize.title')}
                </div>
                <div>{t('symbolSettings.whenToCustomize.tip1')}</div>
                <div>{t('symbolSettings.whenToCustomize.tip2')}</div>
              </div>
              <span className='text-muted'>
                {t('symbolSettings.symbolSpecificNote')}
              </span>

              <Accordion defaultActiveKey='0'>
                <Card className='mt-1'>
                  <Card.Header className='px-2 py-1'>
                    <Accordion.Toggle
                      as={Button}
                      variant='link'
                      eventKey='0'
                      className='p-0 fs-7 text-uppercase'>
                      {t('settings.candleSettings')}
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey='0'>
                    <Card.Body className='px-2 py-1'>
                      <div className='row'>
                        <div className='col-6'>
                          <Form.Group
                            controlId='field-candles-interval'
                            className='mb-2'>
                            <Form.Label className='mb-0'>
                              {t('settings.interval')}
                              <OverlayTrigger
                                trigger='click'
                                key='interval-overlay'
                                placement='bottom'
                                overlay={
                                  <Popover id='interval-overlay-right'>
                                    <Popover.Content>
                                      {t('settings.candleIntervalTooltip')}
                                    </Popover.Content>
                                  </Popover>
                                }>
                                <Button
                                  variant='link'
                                  className='p-0 m-0 ml-1 text-info'>
                                  <i className='fas fa-question-circle fa-sm'></i>
                                </Button>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              size='sm'
                              as='select'
                              required
                              data-state-key='candles.interval'
                              value={symbolConfiguration.candles.interval}
                              onChange={this.handleInputChange}>
                              <option value='1m'>1m</option>
                              <option value='3m'>3m</option>
                              <option value='5m'>5m</option>
                              <option value='15m'>15m</option>
                              <option value='30m'>30m</option>
                              <option value='1h'>1h</option>
                              <option value='2h'>2h</option>
                              <option value='4h'>4h</option>
                              <option value='1d'>1d</option>
                            </Form.Control>
                          </Form.Group>
                        </div>
                        <div className='col-6'>
                          <Form.Group
                            controlId='field-candles-limit'
                            className='mb-2'>
                            <Form.Label className='mb-0'>
                              {t('settings.limitLabel')}{' '}
                              <OverlayTrigger
                                trigger='click'
                                key='limit-overlay'
                                placement='bottom'
                                overlay={
                                  <Popover id='limit-overlay-right'>
                                    <Popover.Content>
                                      {t('settings.candleLimitTooltip')}
                                    </Popover.Content>
                                  </Popover>
                                }>
                                <Button
                                  variant='link'
                                  className='p-0 m-0 ml-1 text-info'>
                                  <i className='fas fa-question-circle fa-sm'></i>
                                </Button>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              size='sm'
                              type='number'
                              placeholder={t('settings.placeholderLimit')}
                              required
                              min='0'
                              step='1'
                              data-state-key='candles.limit'
                              value={symbolConfiguration.candles.limit}
                              onChange={this.handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      </div>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>

              <Accordion defaultActiveKey='0'>
                <Card className='mt-1'>
                  <Card.Header className='px-2 py-1'>
                    <Accordion.Toggle
                      as={Button}
                      variant='link'
                      eventKey='0'
                      className='p-0 fs-7 text-uppercase'>
                      {t('settings.buyConfigurations')}
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey='0'>
                    <Card.Body className='px-2 py-1'>
                      <div className='row'>
                        <div className='col-12'>
                          <Form.Group
                            controlId='field-buy-enabled'
                            className='mb-2'>
                            <Form.Check size='sm'>
                              <Form.Check.Input
                                type='checkbox'
                                data-state-key='buy.enabled'
                                checked={symbolConfiguration.buy.enabled}
                                onChange={this.handleInputChange}
                              />
                              <Form.Check.Label>
                                {t('settings.tradingEnabled')}{' '}
                                <OverlayTrigger
                                  trigger='click'
                                  key='buy-enabled-overlay'
                                  placement='bottom'
                                  overlay={
                                    <Popover id='buy-enabled-overlay-right'>
                                      <Popover.Content>
                                        {t('settings.buyEnabledTooltip')}
                                      </Popover.Content>
                                    </Popover>
                                  }>
                                  <Button
                                    variant='link'
                                    className='p-0 m-0 ml-1 text-info'>
                                    <i className='fas fa-question-circle fa-sm'></i>
                                  </Button>
                                </OverlayTrigger>
                              </Form.Check.Label>
                            </Form.Check>
                          </Form.Group>
                        </div>

                        <div className='col-12'>
                          <SymbolSettingIconGridBuy
                            gridTrade={symbolConfiguration.buy.gridTrade}
                            quoteAsset={quoteAsset}
                            minNotional={minNotional}
                            handleSetValidation={this.handleSetValidation}
                            handleGridTradeChange={this.handleGridTradeChange}
                          />
                        </div>
                        <div className='col-12'>
                          <Accordion defaultActiveKey='0'>
                            <Card className='mt-1'>
                              <Card.Header className='px-2 py-1'>
                                <Accordion.Toggle
                                  as={Button}
                                  variant='link'
                                  eventKey='0'
                                  className='p-0 fs-7 text-uppercase'>
                                  {t('settings.lastBuyPriceRemoval')}
                                </Accordion.Toggle>
                              </Card.Header>
                              <Accordion.Collapse eventKey='0'>
                                <Card.Body className='px-2 py-1'>
                                  <Form.Group
                                    controlId='field-last-buy-remove-threshold'
                                    className='mb-2'>
                                    <Form.Label className='mb-0'>
                                      {t('settings.removeLastBuyPrice', {
                                        quoteAsset
                                      })}{' '}
                                      <OverlayTrigger
                                        trigger='click'
                                        key='last-buy-remove-threshold-overlay'
                                        placement='bottom'
                                        overlay={
                                          <Popover id='last-buy-remove-threshold-overlay-right'>
                                            <Popover.Content>
                                              {t(
                                                'settings.removeLastBuyPriceTooltip'
                                              )}
                                            </Popover.Content>
                                          </Popover>
                                        }>
                                        <Button
                                          variant='link'
                                          className='p-0 m-0 ml-1 text-info'>
                                          <i className='fas fa-question-circle fa-sm'></i>
                                        </Button>
                                      </OverlayTrigger>
                                    </Form.Label>
                                    <Form.Control
                                      size='sm'
                                      type='number'
                                      placeholder={t(
                                        'settings.placeholderLastBuyThreshold'
                                      )}
                                      required
                                      min='0.00000001'
                                      step='0.00000001'
                                      data-state-key='buy.lastBuyPriceRemoveThreshold'
                                      value={
                                        symbolConfiguration.buy
                                          .lastBuyPriceRemoveThreshold
                                      }
                                      onChange={this.handleInputChange}
                                    />
                                  </Form.Group>
                                </Card.Body>
                              </Accordion.Collapse>
                            </Card>
                          </Accordion>
                        </div>
                      </div>

                      <Accordion defaultActiveKey='0'>
                        <Card className='mt-1'>
                          <Card.Header className='px-2 py-1'>
                            <Accordion.Toggle
                              as={Button}
                              variant='link'
                              eventKey='0'
                              className='p-0 fs-7 text-uppercase'>
                              {t('settings.athRestriction')}
                            </Accordion.Toggle>
                          </Card.Header>
                          <Accordion.Collapse eventKey='0'>
                            <Card.Body className='px-2 py-1'>
                              <div className='row'>
                                <div className='col-12'>
                                  <Form.Group
                                    controlId='field-buy-ath-restriction-enabled'
                                    className='mb-2'>
                                    <Form.Check size='sm'>
                                      <Form.Check.Input
                                        type='checkbox'
                                        data-state-key='buy.athRestriction.enabled'
                                        checked={
                                          symbolConfiguration.buy.athRestriction
                                            .enabled
                                        }
                                        onChange={this.handleInputChange}
                                      />
                                      <Form.Check.Label>
                                        {t('settings.athRestrictionEnabled')}{' '}
                                        <OverlayTrigger
                                          trigger='click'
                                          key='buy-ath-restriction-enabled-overlay'
                                          placement='bottom'
                                          overlay={
                                            <Popover id='buy-ath-restriction-enabled-overlay-right'>
                                              <Popover.Content>
                                                {t(
                                                  'settings.athRestrictionEnabledTooltip'
                                                )}
                                              </Popover.Content>
                                            </Popover>
                                          }>
                                          <Button
                                            variant='link'
                                            className='p-0 m-0 ml-1 text-info'>
                                            <i className='fas fa-question-circle fa-sm'></i>
                                          </Button>
                                        </OverlayTrigger>
                                      </Form.Check.Label>
                                    </Form.Check>
                                  </Form.Group>
                                </div>

                                <div className='col-xs-12 col-sm-6'>
                                  <Form.Group
                                    controlId='field-ath-candles-interval'
                                    className='mb-2'>
                                    <Form.Label className='mb-0'>
                                      {t('settings.interval')}
                                      <OverlayTrigger
                                        trigger='click'
                                        key='interval-overlay'
                                        placement='bottom'
                                        overlay={
                                          <Popover id='interval-overlay-right'>
                                            <Popover.Content>
                                              {t('settings.athIntervalTooltip')}
                                            </Popover.Content>
                                          </Popover>
                                        }>
                                        <Button
                                          variant='link'
                                          className='p-0 m-0 ml-1 text-info'>
                                          <i className='fas fa-question-circle fa-sm'></i>
                                        </Button>
                                      </OverlayTrigger>
                                    </Form.Label>
                                    <Form.Control
                                      size='sm'
                                      as='select'
                                      required
                                      data-state-key='buy.athRestriction.candles.interval'
                                      value={
                                        symbolConfiguration.buy.athRestriction
                                          .candles.interval
                                      }
                                      onChange={this.handleInputChange}>
                                      <option value='1m'>1m</option>
                                      <option value='3m'>3m</option>
                                      <option value='5m'>5m</option>
                                      <option value='15m'>15m</option>
                                      <option value='30m'>30m</option>
                                      <option value='1h'>1h</option>
                                      <option value='2h'>2h</option>
                                      <option value='4h'>4h</option>
                                      <option value='1d'>1d</option>
                                    </Form.Control>
                                  </Form.Group>
                                </div>
                                <div className='col-xs-12 col-sm-6'>
                                  <Form.Group
                                    controlId='field-ath-candles-limit'
                                    className='mb-2'>
                                    <Form.Label className='mb-0'>
                                      {t('settings.limitLabel')}
                                      <OverlayTrigger
                                        trigger='click'
                                        key='limit-overlay'
                                        placement='bottom'
                                        overlay={
                                          <Popover id='limit-overlay-right'>
                                            <Popover.Content>
                                              {t('settings.athLimitTooltip')}
                                            </Popover.Content>
                                          </Popover>
                                        }>
                                        <Button
                                          variant='link'
                                          className='p-0 m-0 ml-1 text-info'>
                                          <i className='fas fa-question-circle fa-sm'></i>
                                        </Button>
                                      </OverlayTrigger>
                                    </Form.Label>
                                    <Form.Control
                                      size='sm'
                                      type='number'
                                      placeholder={t(
                                        'settings.placeholderLimit'
                                      )}
                                      required
                                      min='0'
                                      step='1'
                                      data-state-key='buy.athRestriction.candles.limit'
                                      value={
                                        symbolConfiguration.buy.athRestriction
                                          .candles.limit
                                      }
                                      onChange={this.handleInputChange}
                                    />
                                  </Form.Group>
                                </div>
                                <div className='col-xs-12 col-sm-6'>
                                  <Form.Group
                                    controlId='field-buy-restriction-percentage'
                                    className='mb-2'>
                                    <Form.Label className='mb-0'>
                                      {t('settings.restrictionPricePercentage')}{' '}
                                      <OverlayTrigger
                                        trigger='click'
                                        key='interval-overlay'
                                        placement='bottom'
                                        overlay={
                                          <Popover id='interval-overlay-right'>
                                            <Popover.Content>
                                              {t(
                                                'settings.restrictionPercentagePopover'
                                              )}
                                            </Popover.Content>
                                          </Popover>
                                        }>
                                        <Button
                                          variant='link'
                                          className='p-0 m-0 ml-1 text-info'>
                                          <i className='fas fa-question-circle fa-sm'></i>
                                        </Button>
                                      </OverlayTrigger>
                                    </Form.Label>
                                    <Form.Control
                                      size='sm'
                                      type='number'
                                      placeholder={t(
                                        'settings.placeholderRestrictionPercentage'
                                      )}
                                      required
                                      min='0'
                                      step='0.0001'
                                      data-state-key='buy.athRestriction.restrictionPercentage'
                                      value={
                                        symbolConfiguration.buy.athRestriction
                                          .restrictionPercentage
                                      }
                                      onChange={this.handleInputChange}
                                    />
                                  </Form.Group>
                                </div>
                              </div>
                            </Card.Body>
                          </Accordion.Collapse>
                        </Card>
                      </Accordion>

                      <Accordion defaultActiveKey='0'>
                        <Card className='mt-1'>
                          <Card.Header className='px-2 py-1'>
                            <Accordion.Toggle
                              as={Button}
                              variant='link'
                              eventKey='0'
                              className='p-0 fs-7 text-uppercase'>
                              {t('settings.tradingView')}{' '}
                            </Accordion.Toggle>
                          </Card.Header>
                          <Accordion.Collapse eventKey='0'>
                            <Card.Body className='px-2 py-1'>
                              <div className='row'>
                                <div className='col-12'>
                                  {t('settings.whatIsTradingView')}{' '}
                                  <a
                                    href='https://www.tradingview.com/symbols/BTCUSDT/technicals/'
                                    target='_blank'
                                    rel='noreferrer'>
                                    TradingView
                                  </a>
                                  ?{' '}
                                  <OverlayTrigger
                                    trigger='click'
                                    key='bot-options-auto-trigger-buy-conditions-tradingview-when-strong-buy-overlay'
                                    placement='bottom'
                                    overlay={
                                      <Popover id='bot-options-auto-trigger-buy-conditions-tradingview-when-strong-buy-overlay-right'>
                                        <Popover.Content>
                                          {t('settings.tradingViewPopover')}
                                        </Popover.Content>
                                      </Popover>
                                    }>
                                    <Button
                                      variant='link'
                                      className='p-0 m-0 ml-1 text-info'>
                                      <i className='fas fa-question-circle fa-sm'></i>
                                    </Button>
                                  </OverlayTrigger>
                                </div>
                              </div>
                            </Card.Body>
                          </Accordion.Collapse>
                        </Card>
                      </Accordion>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>

              <Accordion defaultActiveKey='0'>
                <Card className='mt-1'>
                  <Card.Header className='px-2 py-1'>
                    <Accordion.Toggle
                      as={Button}
                      variant='link'
                      eventKey='0'
                      className='p-0 fs-7 text-uppercase'>
                      {t('settings.sellConfigurations')}
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey='0'>
                    <Card.Body className='px-2 py-1'>
                      <div className='row'>
                        <div className='col-12'>
                          <Form.Group
                            controlId='field-sell-enabled'
                            className='mb-2'>
                            <Form.Check size='sm'>
                              <Form.Check.Input
                                type='checkbox'
                                data-state-key='sell.enabled'
                                checked={symbolConfiguration.sell.enabled}
                                onChange={this.handleInputChange}
                              />
                              <Form.Check.Label>
                                {t('settings.tradingEnabled')}{' '}
                                <OverlayTrigger
                                  trigger='click'
                                  key='buy-enabled-overlay'
                                  placement='bottom'
                                  overlay={
                                    <Popover id='buy-enabled-overlay-right'>
                                      <Popover.Content>
                                        {t('settings.sellEnabledTooltip')}
                                      </Popover.Content>
                                    </Popover>
                                  }>
                                  <Button
                                    variant='link'
                                    className='p-0 m-0 ml-1 text-info'>
                                    <i className='fas fa-question-circle fa-sm'></i>
                                  </Button>
                                </OverlayTrigger>
                              </Form.Check.Label>
                            </Form.Check>
                          </Form.Group>
                        </div>
                        <div className='col-12'>
                          <SymbolSettingIconGridSell
                            gridTrade={symbolConfiguration.sell.gridTrade}
                            quoteAsset={quoteAsset}
                            handleSetValidation={this.handleSetValidation}
                            handleGridTradeChange={this.handleGridTradeChange}
                          />
                        </div>
                        <div className='col-12'>
                          <Accordion defaultActiveKey='0'>
                            <Card className='mt-1'>
                              <Card.Header className='px-2 py-1'>
                                <Accordion.Toggle
                                  as={Button}
                                  variant='link'
                                  eventKey='0'
                                  className='p-0 fs-7 text-uppercase'>
                                  {t('settings.sellStopLoss')}
                                </Accordion.Toggle>
                              </Card.Header>
                              <Accordion.Collapse eventKey='0'>
                                <Card.Body className='px-2 py-1'>
                                  <div className='row'>
                                    <div className='col-12'>
                                      <Form.Group
                                        controlId='field-sell-stop-loss-enabled'
                                        className='mb-2'>
                                        <Form.Check size='sm'>
                                          <Form.Check.Input
                                            type='checkbox'
                                            data-state-key='sell.stopLoss.enabled'
                                            checked={
                                              symbolConfiguration.sell.stopLoss
                                                .enabled
                                            }
                                            onChange={this.handleInputChange}
                                          />
                                          <Form.Check.Label>
                                            {t('settings.stopLossEnabled')}{' '}
                                            <OverlayTrigger
                                              trigger='click'
                                              key='sell-stop-loss-enabled-overlay'
                                              placement='bottom'
                                              overlay={
                                                <Popover id='sell-stop-loss-enabled-overlay-right'>
                                                  <Popover.Content>
                                                    {t(
                                                      'settings.stopLossEnabledTooltip'
                                                    )}
                                                  </Popover.Content>
                                                </Popover>
                                              }>
                                              <Button
                                                variant='link'
                                                className='p-0 m-0 ml-1 text-info'>
                                                <i className='fas fa-question-circle fa-sm'></i>
                                              </Button>
                                            </OverlayTrigger>
                                          </Form.Check.Label>
                                        </Form.Check>
                                      </Form.Group>
                                    </div>
                                    <div className='col-xs-12 col-sm-6'>
                                      <Form.Group
                                        controlId='field-sell-stop-loss-max-loss-percentage'
                                        className='mb-2'>
                                        <Form.Label className='mb-0'>
                                          {t('settings.maxLossPercentage')}{' '}
                                          <OverlayTrigger
                                            trigger='click'
                                            key='sell-stop-loss-max-loss-percentage-overlay'
                                            placement='bottom'
                                            overlay={
                                              <Popover id='sell-stop-loss-max-loss-percentage-overlay-right'>
                                                <Popover.Content>
                                                  {t('settings.maxLossPopover')}
                                                </Popover.Content>
                                              </Popover>
                                            }>
                                            <Button
                                              variant='link'
                                              className='p-0 m-0 ml-1 text-info'>
                                              <i className='fas fa-question-circle fa-sm'></i>
                                            </Button>
                                          </OverlayTrigger>
                                        </Form.Label>
                                        <Form.Control
                                          size='sm'
                                          type='number'
                                          placeholder={t(
                                            'settings.placeholderMaxLoss'
                                          )}
                                          required
                                          max='1'
                                          min='0'
                                          step='0.0001'
                                          data-state-key='sell.stopLoss.maxLossPercentage'
                                          value={
                                            symbolConfiguration.sell.stopLoss
                                              .maxLossPercentage
                                          }
                                          onChange={this.handleInputChange}
                                        />
                                      </Form.Group>
                                    </div>
                                    <div className='col-xs-12 col-sm-6'>
                                      <Form.Group
                                        controlId='field-sell-stop-loss-disable-buy-minutes'
                                        className='mb-2'>
                                        <Form.Label className='mb-0'>
                                          {t('settings.tempDisableBuyMinutes')}{' '}
                                          <OverlayTrigger
                                            trigger='click'
                                            key='sell-stop-loss-disable-buy-minutes-overlay'
                                            placement='bottom'
                                            overlay={
                                              <Popover id='sell-stop-loss-disable-buy-minutes-overlay-right'>
                                                <Popover.Content>
                                                  {t(
                                                    'settings.tempDisableBuyPopover'
                                                  )}
                                                </Popover.Content>
                                              </Popover>
                                            }>
                                            <Button
                                              variant='link'
                                              className='p-0 m-0 ml-1 text-info'>
                                              <i className='fas fa-question-circle fa-sm'></i>
                                            </Button>
                                          </OverlayTrigger>
                                        </Form.Label>
                                        <Form.Control
                                          size='sm'
                                          type='number'
                                          placeholder={t(
                                            'settings.placeholderDisableBuyMinutes'
                                          )}
                                          required
                                          max='99999999'
                                          min='1'
                                          step='1'
                                          data-state-key='sell.stopLoss.disableBuyMinutes'
                                          value={
                                            symbolConfiguration.sell.stopLoss
                                              .disableBuyMinutes
                                          }
                                          onChange={this.handleInputChange}
                                        />
                                      </Form.Group>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Accordion.Collapse>
                            </Card>
                          </Accordion>
                        </div>
                      </div>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>

              <SymbolSettingIconTradingView
                botOptions={symbolConfiguration.botOptions}
                tradingViewIntervals={tradingViewIntervals}
                handleBotOptionsChange={this.handleBotOptionsChange}
              />

              <Accordion defaultActiveKey='0'>
                <Card className='mt-1'>
                  <Card.Header className='px-2 py-1'>
                    <Accordion.Toggle
                      as={Button}
                      variant='link'
                      eventKey='0'
                      className='p-0 fs-7 text-uppercase'>
                      {t('settings.conservativeMode')}
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey='0'>
                    <Card.Body className='px-2 py-1'>
                      <div className='row'>
                        <div className='col-12'>
                          <Form.Group
                            controlId='field-sell-conservative-enabled'
                            className='mb-2'>
                            <Form.Check size='sm'>
                              <Form.Check.Input
                                type='checkbox'
                                data-state-key='sell.conservativeMode.enabled'
                                checked={
                                  symbolConfiguration.sell.conservativeMode
                                    .enabled
                                }
                                onChange={this.handleInputChange}
                              />
                              <Form.Check.Label>
                                {t('settings.conservativeModeDescription')}{' '}
                                <OverlayTrigger
                                  trigger='click'
                                  key='sell-conservative-enabled-overlay'
                                  placement='bottom'
                                  overlay={
                                    <Popover id='sell-conservative-enabled-overlay-right'>
                                      <Popover.Content>
                                        {t('settings.conservativeModePopover')}
                                      </Popover.Content>
                                    </Popover>
                                  }>
                                  <Button
                                    variant='link'
                                    className='p-0 m-0 ml-1 text-info'>
                                    <i className='fas fa-question-circle fa-sm'></i>
                                  </Button>
                                </OverlayTrigger>
                              </Form.Check.Label>
                            </Form.Check>
                          </Form.Group>
                        </div>
                        <div className='col-xs-12 col-sm-6'>
                          <Form.Group
                            controlId='field-sell-conservative-factor'
                            className='mb-2'>
                            <Form.Label className='mb-0'>
                              {t('settings.conservativeRatio')}{' '}
                              <OverlayTrigger
                                trigger='click'
                                key='sell-conservative-factor-overlay'
                                placement='bottom'
                                overlay={
                                  <Popover id='sell-conservative-factor-overlay-right'>
                                    <Popover.Content>
                                      {t('settings.conservativeRatioPopover')}
                                    </Popover.Content>
                                  </Popover>
                                }>
                                <Button
                                  variant='link'
                                  className='p-0 m-0 ml-1 text-info'>
                                  <i className='fas fa-question-circle fa-sm'></i>
                                </Button>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              size='sm'
                              type='number'
                              placeholder={t(
                                'settings.placeholderConservativeFactor'
                              )}
                              required
                              max='1'
                              min='0'
                              step='0.01'
                              data-state-key='sell.conservativeMode.factor'
                              value={
                                symbolConfiguration.sell.conservativeMode.factor
                              }
                              onChange={this.handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      </div>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>

              <SymbolSettingIconBotOptions
                botOptions={symbolConfiguration.botOptions}
                handleBotOptionsChange={this.handleBotOptionsChange}
              />

              <SymbolSettingIconActions
                symbolInfo={this.symbolInfo}
                sendWebSocket={this.props.sendWebSocket}
              />
            </Modal.Body>
            <Modal.Footer>
              <div className='w-100'>{t('settings.noteChanges')}</div>

              <Button
                variant='secondary'
                size='sm'
                type='button'
                onClick={() => this.handleModalClose('setting')}>
                {t('common.close')}
              </Button>
              <Button type='submit' variant='primary' size='sm'>
                {t('common.saveChanges')}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    );
  }
}
