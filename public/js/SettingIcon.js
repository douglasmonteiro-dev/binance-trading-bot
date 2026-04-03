/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SettingIcon extends React.Component {
  constructor(props) {
    super(props);

    this.modalToStateMap = {
      setting: 'showSettingModal',
      confirm: 'showConfirmModal'
    };

    this.state = {
      showSettingModal: false,
      showConfirmModal: false,
      quoteAssets: [],
      minNotionals: {},
      configuration: {},
      rawConfiguration: {},
      validation: {},
      exchangeSymbols: {}
    };

    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleGridTradeChange = this.handleGridTradeChange.bind(this);
    this.handleLastBuyPriceRemoveThresholdChange =
      this.handleLastBuyPriceRemoveThresholdChange.bind(this);
    this.handleBotOptionsChange = this.handleBotOptionsChange.bind(this);

    this.handleSetValidation = this.handleSetValidation.bind(this);
    this.symbolsTypeaheadRef = React.createRef();
  }

  getQuoteAssets(
    exchangeSymbols,
    selectedSymbols,
    lastBuyPriceRemoveThresholds
  ) {
    const quoteAssets = [];

    const minNotionals = {};

    selectedSymbols.forEach(symbol => {
      const symbolInfo = exchangeSymbols[symbol];
      if (symbolInfo === undefined) {
        return;
      }
      const { quoteAsset, minNotional } = symbolInfo;
      if (quoteAssets.includes(quoteAsset) === false) {
        quoteAssets.push(quoteAsset);
        minNotionals[quoteAsset] = minNotional;
      }

      if (lastBuyPriceRemoveThresholds[quoteAsset] === undefined) {
        lastBuyPriceRemoveThresholds[quoteAsset] = minNotional;
      }
    });

    return { quoteAssets, minNotionals, lastBuyPriceRemoveThresholds };
  }

  isConfigChanged(nextProps) {
    if (
      this.state.showSettingModal === false &&
      _.isEmpty(nextProps.configuration) === false &&
      _.isEqual(nextProps.configuration, this.state.rawConfiguration) === false
    ) {
      return true;
    }

    return false;
  }

  isExchangeSymbolsChanged(nextProps) {
    if (
      _.isEmpty(nextProps.exchangeSymbols) === false &&
      _.isEqual(nextProps.exchangeSymbols, this.state.exchangeSymbols) === false
    ) {
      return true;
    }

    return false;
  }

  componentDidUpdate(nextProps) {
    if (this.isExchangeSymbolsChanged(nextProps)) {
      const { exchangeSymbols, configuration } = nextProps;
      const { symbols: selectedSymbols } = configuration;

      const { quoteAssets, minNotionals } = this.getQuoteAssets(
        exchangeSymbols,
        selectedSymbols,
        configuration.buy.lastBuyPriceRemoveThresholds
      );

      this.setState({
        quoteAssets,
        minNotionals,
        exchangeSymbols
      });
    }

    // Only update configuration, when the modal is closed and different.
    if (this.isConfigChanged(nextProps)) {
      const { configuration: rawConfiguration } = nextProps;
      const configuration = _.cloneDeep(rawConfiguration);

      if (configuration.buy.lastBuyPriceRemoveThresholds === undefined) {
        configuration.buy.lastBuyPriceRemoveThresholds = {};
      }

      this.setState({
        configuration,
        rawConfiguration
      });
    }
  }

  handleFormSubmit(extraConfiguration = {}) {
    this.handleModalClose('confirm');
    this.handleModalClose('setting');
    this.props.sendWebSocket('setting-update', {
      ...this.state.configuration,
      ...extraConfiguration
    });
  }

  componentDidMount() {
    this.props.sendWebSocket('exchange-symbols-get');
  }

  handleModalShow(modal) {
    if (modal === 'setting') {
      this.props.sendWebSocket('exchange-symbols-get');
    }

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

    const { configuration } = this.state;

    this.setState({
      configuration: _.set(configuration, stateKey, value)
    });
  }

  handleGridTradeChange(type, newGrid) {
    const { configuration } = this.state;

    this.setState({
      configuration: _.set(configuration, `${type}.gridTrade`, newGrid)
    });
  }

  handleLastBuyPriceRemoveThresholdChange(newLastBuyPriceRemoveThresholds) {
    const { configuration } = this.state;

    this.setState({
      configuration: _.set(
        configuration,
        'buy.lastBuyPriceRemoveThresholds',
        newLastBuyPriceRemoveThresholds
      )
    });
  }

  handleBotOptionsChange(newBotOptions) {
    const { configuration } = this.state;

    this.setState({
      configuration: _.set(configuration, 'botOptions', newBotOptions)
    });
  }

  handleSetValidation(type, isValid) {
    const { validation } = this.state;
    this.setState({ validation: { ...validation, [type]: isValid } });
  }

  render() {
    const { isAuthenticated, exchangeSymbols, tradingViewIntervals } =
      this.props;

    const { configuration, quoteAssets, minNotionals, validation } = this.state;
    const { symbols: selectedSymbols } = configuration;

    if (_.isEmpty(configuration) || isAuthenticated === false) {
      return '';
    }

    // Check validation if contains any false
    const isValid = Object.values(validation).includes(false) === false;

    return (
      <div className='header-column-icon-wrapper setting-wrapper'>
        <button
          type='button'
          className='btn btn-sm btn-link p-0 pl-1 pr-1'
          onClick={() => this.handleModalShow('setting')}>
          <i className='fas fa-cog'></i>
        </button>
        <Modal
          show={this.state.showSettingModal}
          onHide={() => this.handleModalClose('setting)')}
          size='xl'>
          <Form>
            <Modal.Header className='pt-1 pb-1'>
              <Modal.Title>{t('settings.title')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className='alert alert-warning small mb-2'>
                <div className='font-weight-bold mb-1'>
                  {t('settings.safeWayTitle')}
                </div>
                <div>{t('settings.safeWayLine1')}</div>
                <div>{t('settings.safeWayLine2')}</div>
                <div>{t('settings.safeWayLine3')}</div>
              </div>
              <span className='text-muted'>
                {t('settings.globalConfigDescription')}
              </span>
              <Accordion defaultActiveKey='0'>
                <Card className='mt-1' style={{ overflow: 'visible' }}>
                  <Card.Header className='px-2 py-1'>
                    <Accordion.Toggle
                      as={Button}
                      variant='link'
                      eventKey='0'
                      className='p-0 fs-7 text-uppercase'>
                      {t('settings.symbols')}
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey='0'>
                    <Card.Body className='px-2 py-1'>
                      <div className='row'>
                        <div className='col-12'>
                          <Form.Group className='mb-2'>
                            <Typeahead
                              id='exchange-symbols-list'
                              multiple
                              onChange={selected => {
                                // Handle selections...
                                const { configuration } = this.state;

                                configuration.symbols = selected;

                                this.handleSetValidation('symbols', true);

                                if (_.isEmpty(configuration.symbols)) {
                                  this.handleSetValidation('symbols', false);
                                }

                                const {
                                  quoteAssets,
                                  minNotionals,
                                  lastBuyPriceRemoveThresholds
                                } = this.getQuoteAssets(
                                  exchangeSymbols,
                                  selected,
                                  configuration.buy.lastBuyPriceRemoveThresholds
                                );

                                configuration.buy.lastBuyPriceRemoveThresholds =
                                  lastBuyPriceRemoveThresholds;

                                this.setState({
                                  configuration,
                                  quoteAssets,
                                  minNotionals
                                });
                              }}
                              ref={this.symbolsTypeaheadRef}
                              size='sm'
                              options={_.keys(exchangeSymbols)}
                              renderMenuItemChildren={(
                                option,
                                { text },
                                _index
                              ) => (
                                <React.Fragment>
                                  <div className='d-flex justify-content-between align-items-center'>
                                    <div>
                                      <i
                                        style={{ fontSize: '0.4em' }}
                                        className={`fas fa-circle align-middle mr-2 fa-fw ${
                                          exchangeSymbols[option].status ===
                                          'TRADING'
                                            ? 'text-success blink'
                                            : 'text-danger'
                                        }`}></i>
                                      <Highlighter search={text}>
                                        {option}
                                      </Highlighter>
                                    </div>
                                    {exchangeSymbols[option].status ===
                                    'TRADING' ? (
                                      <span className='badge badge-success badge-pill'>
                                        {t('settings.active')}
                                      </span>
                                    ) : (
                                      <span className='badge badge-danger badge-pill'>
                                        {t('settings.inactive')}
                                      </span>
                                    )}
                                  </div>
                                </React.Fragment>
                              )}
                              defaultSelected={selectedSymbols}
                              placeholder={t('settings.chooseSymbols')}
                              isInvalid={
                                _.get(validation, `symbols`, true) === false
                              }
                            />
                          </Form.Group>
                        </div>
                      </div>
                      <div className='row'>
                        <div className='col-12 text-right'>
                          <button
                            type='button'
                            className='btn btn-sm btn-clear-symbols'
                            onClick={e => {
                              e.preventDefault();
                              this.symbolsTypeaheadRef.current.clear();
                              const { configuration } = this.state;
                              configuration.symbols = [];
                            }}>
                            {t('settings.clearSelection')}
                          </button>
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
                              value={configuration.candles.interval}
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
                              {t('settings.limitLabel')}
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
                              value={configuration.candles.limit}
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
                                checked={configuration.buy.enabled}
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
                          <SettingIconGridBuy
                            gridTrade={configuration.buy.gridTrade}
                            quoteAssets={quoteAssets}
                            minNotionals={minNotionals}
                            handleSetValidation={this.handleSetValidation}
                            handleGridTradeChange={this.handleGridTradeChange}
                          />
                        </div>
                        <div className='col-12'>
                          <hr />
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
                                  <div className='row'>
                                    <SettingIconLastBuyPriceRemoveThreshold
                                      quoteAssets={quoteAssets}
                                      lastBuyPriceRemoveThresholds={
                                        configuration.buy
                                          .lastBuyPriceRemoveThresholds
                                      }
                                      handleLastBuyPriceRemoveThresholdChange={
                                        this
                                          .handleLastBuyPriceRemoveThresholdChange
                                      }
                                    />
                                  </div>
                                </Card.Body>
                              </Accordion.Collapse>
                            </Card>
                          </Accordion>
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
                                              configuration.buy.athRestriction
                                                .enabled
                                            }
                                            onChange={this.handleInputChange}
                                          />
                                          <Form.Check.Label>
                                            {t(
                                              'settings.athRestrictionEnabled'
                                            )}{' '}
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
                                                  {t(
                                                    'settings.athIntervalTooltip'
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
                                          as='select'
                                          required
                                          data-state-key='buy.athRestriction.candles.interval'
                                          value={
                                            configuration.buy.athRestriction
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
                                                  {t(
                                                    'settings.athLimitTooltip'
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
                                            'settings.placeholderLimit'
                                          )}
                                          required
                                          min='0'
                                          step='1'
                                          data-state-key='buy.athRestriction.candles.limit'
                                          value={
                                            configuration.buy.athRestriction
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
                                          {t(
                                            'settings.restrictionPricePercentage'
                                          )}{' '}
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
                                            configuration.buy.athRestriction
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
                                checked={configuration.sell.enabled}
                                onChange={this.handleInputChange}
                              />
                              <Form.Check.Label>
                                {t('settings.tradingEnabled')}{' '}
                                <OverlayTrigger
                                  trigger='click'
                                  key='sell-enabled-overlay'
                                  placement='bottom'
                                  overlay={
                                    <Popover id='sell-enabled-overlay-right'>
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
                          <SettingIconGridSell
                            gridTrade={configuration.sell.gridTrade}
                            quoteAssets={quoteAssets}
                            handleSetValidation={this.handleSetValidation}
                            handleGridTradeChange={this.handleGridTradeChange}
                          />
                        </div>
                        <div className='col-12'>
                          <hr />
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
                                              configuration.sell.stopLoss
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
                                            configuration.sell.stopLoss
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
                                            configuration.sell.stopLoss
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

              <SettingIconTradingView
                botOptions={configuration.botOptions}
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
                                  configuration.sell.conservativeMode.enabled
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
                              value={configuration.sell.conservativeMode.factor}
                              onChange={this.handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      </div>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>

              <SettingIconBotOptions
                botOptions={configuration.botOptions}
                handleBotOptionsChange={this.handleBotOptionsChange}
              />

              <SettingIconActions />
            </Modal.Body>
            <Modal.Footer>
              <div className='w-100'>{t('settings.noteChanges')}</div>
              <Button
                variant='secondary'
                size='sm'
                onClick={() => this.handleModalClose('setting')}>
                {t('common.close')}
              </Button>
              <Button
                variant='primary'
                size='sm'
                disabled={!isValid}
                onClick={() => this.handleModalShow('confirm')}>
                {t('common.saveChanges')}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <Modal
          show={this.state.showConfirmModal}
          onHide={() => this.handleModalClose('confirm')}
          size='md'>
          <Modal.Header className='pt-1 pb-1'>
            <Modal.Title>
              <span className='text-danger'>⚠ {t('common.saveChanges')}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {t('settings.confirmWarningIntro')}
            <br />
            <br />
            {t('settings.confirmQuestion')}
            <br />
            <br />
            {t('settings.confirmApplyAllWarning')}
            <br />
            <br />
            {t('settings.confirmGlobalOnlyNote')}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => this.handleModalClose('confirm')}>
              {t('common.cancel')}
            </Button>
            <Button
              variant='success'
              size='sm'
              onClick={() => this.handleFormSubmit({ action: 'apply-to-all' })}>
              {t('settings.applyToAll')}
            </Button>
            <Button
              variant='primary'
              size='sm'
              onClick={() =>
                this.handleFormSubmit({
                  action: 'apply-to-global-only'
                })
              }>
              {t('settings.applyToGlobalOnly')}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
