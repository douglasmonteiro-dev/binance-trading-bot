/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SymbolGridCalculator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      scenario: {}
    };

    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidUpdate(nextProps) {
    // Only update configuration, when the modal is closed and different.
    if (
      this.state.showModal === false &&
      _.isEmpty(nextProps.scenario) === false &&
      _.isEqual(nextProps.scenario, this.state.scenario) === false
    ) {
      this.setState({
        scenario: nextProps.scenario
      });
    }
  }

  handleModalShow() {
    this.setState({
      showModal: true,
      scenario: {}
    });
  }

  handleModalClose() {
    this.setState({
      showModal: false
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value =
      target.type === 'button'
        ? target.getAttribute('data-state-value')
        : target.type === 'checkbox'
        ? target.checked
        : target.type === 'number'
        ? +target.value
        : target.value;

    const stateKey = target.getAttribute('data-state-key');

    const { scenario } = this.state;

    this.setState({
      scenario: _.set(scenario, stateKey, value)
    });
  }

  render() {
    const { symbol, symbolInfo, isAuthenticated } = this.props;

    if (isAuthenticated === false) {
      return '';
    }

    const {
      symbolInfo: {
        filterPrice: { tickSize },
        quoteAsset
      },
      buy: { nextBestBuyCalculation },
      sell
    } = symbolInfo;

    const precision = parseFloat(tickSize) === 1 ? 0 : tickSize.indexOf(1) - 1;

    if (!sell.lastBuyPrice) {
      return (
        <span className='header-column-icon-wrapper grid-calculator-wrapper'>
          <button
            type='button'
            className='btn btn-sm btn-link mx-1 p-0 text-white'
            onClick={this.handleModalShow}>
            <i className='fas fa-calculator fa-sm'></i>
          </button>

          <Modal show={this.state.showModal} onHide={this.handleModalClose}>
            <Modal.Header className='pt-1 pb-1'>
              <Modal.Title>
                {t('gridCalculator.title')} - {symbol}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>{t('gridCalculator.noActiveGrid')}</Modal.Body>
            <Modal.Footer>
              <Button
                variant='secondary'
                size='sm'
                onClick={this.handleModalClose}>
                {t('common.close')}
              </Button>
            </Modal.Footer>
          </Modal>
        </span>
      );
    }

    //Prepare calculation
    const {
      currentPrice,
      lastBuyPrice,
      totalBoughtAmount,
      totalBoughtQty,
      buyTrigger,
      sellTrigger,
      hasObviousManualTrade,
      isSingleSellGrid
    } = nextBestBuyCalculation || {
      currentPrice: parseFloat(sell.currentPrice),
      lastBuyPrice: parseFloat(sell.lastBuyPrice),
      totalBoughtAmount: 0,
      totalBoughtQty: 0,
      buyTrigger:
        1 +
        (parseFloat(sell.currentPrice) - parseFloat(sell.lastBuyPrice)) /
          parseFloat(sell.lastBuyPrice),
      sellTrigger: parseFloat(sell.triggerPercentage),
      hasObviousManualTrade: true,
      isSingleSellGrid: false
    };

    const currentBuyTrigger =
      parseFloat(this.state.scenario.buyTrigger) || buyTrigger;

    const buyPriceEquivalent = lastBuyPrice * currentBuyTrigger;

    const buyTriggerWithCurrentPrice =
      1 - (lastBuyPrice - currentPrice) / lastBuyPrice;

    const currentTotalBoughtQty = this.state.scenario.totalBoughtQty
      ? parseFloat(this.state.scenario.totalBoughtQty)
      : totalBoughtQty;

    const currentTotalBoughtAmount = this.state.scenario.totalBoughtAmount
      ? parseFloat(this.state.scenario.totalBoughtAmount)
      : totalBoughtAmount;

    const equivalentLastBuyPrice = currentTotalBoughtQty
      ? currentTotalBoughtAmount / currentTotalBoughtQty
      : null;

    const currentSellTrigger =
      parseFloat(this.state.scenario.sellTrigger) || sellTrigger;

    const sellPriceEquivalent = currentPrice * parseFloat(currentSellTrigger);

    const differenceFromCurrentPrice =
      (100 * (currentBuyTrigger * lastBuyPrice - currentPrice)) / currentPrice;

    //Calculate next buy grid with current data
    const breakevenAmount =
      (currentTotalBoughtAmount -
        currentTotalBoughtQty *
          currentBuyTrigger *
          lastBuyPrice *
          currentSellTrigger) /
      (currentSellTrigger - 1);

    return (
      <span className='header-column-icon-wrapper grid-calculator-wrapper'>
        <button
          type='button'
          className='btn btn-sm btn-link mx-1 p-0 text-white'
          onClick={this.handleModalShow}>
          <i className='fas fa-calculator fa-sm'></i>
        </button>

        <Modal show={this.state.showModal} onHide={this.handleModalClose}>
          <Modal.Header className='pt-1 pb-1'>
            <Modal.Title>
              {t('gridCalculator.title')} - {symbol}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {t('gridCalculator.description')}
            {!isSingleSellGrid ? (
              <span className='text-danger'>
                {' '}
                {t('gridCalculator.singleSellGridWarning')}
              </span>
            ) : (
              ''
            )}
            <div className='manual-trade-wrappers grid-calculator-row grid-calculator-wrapper mt-2'>
              <Form.Group className='manual-trade-wrapper mb-0'>
                <Form.Label className='mb-0 font-weight-bold'>
                  {t('gridCalculator.totalSpent')} ({quoteAsset})
                </Form.Label>
                <FormControl
                  size='sm'
                  type='number'
                  step='0.0001'
                  placeholder={t('gridCalculator.placeholderTotalSpent')}
                  required
                  defaultValue={currentTotalBoughtAmount.toFixed(precision)}
                  data-state-key='totalBoughtAmount'
                  onChange={this.handleInputChange}
                />
              </Form.Group>
              <Form.Group className='manual-trade-wrapper mb-0'>
                <Form.Label className='mb-0 font-weight-bold'>
                  {t('gridCalculator.totalQty')}
                </Form.Label>
                <FormControl
                  size='sm'
                  type='number'
                  step='0.0001'
                  placeholder={t('gridCalculator.placeholderTotalQty')}
                  required
                  defaultValue={currentTotalBoughtQty}
                  data-state-key='totalBoughtQty'
                  onChange={this.handleInputChange}
                />
              </Form.Group>
            </div>
            <div className='grid-calculator-row grid-calculator-wrapper mt-0'>
              <Form.Text className='mt-1 ml-2 text-muted'>
                {t('gridCalculator.equivalentPrice')}{' '}
                {equivalentLastBuyPrice
                  ? equivalentLastBuyPrice.toFixed(precision)
                  : '-'}
              </Form.Text>
              {hasObviousManualTrade ? (
                <Form.Text className='mt-0 ml-2 text-danger'>
                  {t('gridCalculator.updateManualTradesRequired')}
                </Form.Text>
              ) : (
                <Form.Text className='mt-0 ml-2 text-muted'>
                  {t('gridCalculator.updateManualTradesOptional')}
                </Form.Text>
              )}
            </div>
            <div className='grid-calculator-row grid-calculator-wrapper mt-2'>
              <Form.Group className='mb-2'>
                <Form.Label className='mb-0 font-weight-bold'>
                  {t('gridCalculator.buyTriggerPercentage')}
                </Form.Label>
                <FormControl
                  size='sm'
                  type='number'
                  step='0.0001'
                  placeholder={t('gridCalculator.placeholderBuyTrigger')}
                  required
                  defaultValue={currentBuyTrigger.toFixed(3)}
                  data-state-key='buyTrigger'
                  onChange={this.handleInputChange}
                />
                <Form.Text className='ml-2 text-muted'>
                  {t('gridCalculator.equivalentMarketPrice')}{' '}
                  {buyPriceEquivalent.toFixed(precision)} <br />
                  {t('gridCalculator.differenceFromCurrentPrice')}{' '}
                  {differenceFromCurrentPrice.toFixed(3)}%<br />
                  {t('gridCalculator.buyTriggerWithCurrentPrice')}{' '}
                  {buyTriggerWithCurrentPrice.toFixed(3)}
                </Form.Text>
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label className='mb-0 font-weight-bold'>
                  {t('gridCalculator.expectedRebound')}{' '}
                  {sell.conservativeModeApplicable
                    ? t('gridCalculator.conservativeSell')
                    : ''}
                </Form.Label>
                <FormControl
                  size='sm'
                  type='number'
                  step='0.0001'
                  placeholder={t('gridCalculator.placeholderSellTrigger')}
                  required
                  min='1'
                  defaultValue={currentSellTrigger.toFixed(4)}
                  data-state-key='sellTrigger'
                  onChange={this.handleInputChange}
                />
                <Form.Text className='ml-2 text-muted'>
                  {currentSellTrigger
                    ? t('gridCalculator.equivalentMarketPriceValue', {
                        price: sellPriceEquivalent.toFixed(precision)
                      })
                    : '\u00A0'}
                </Form.Text>
              </Form.Group>
            </div>
            <div>
              {!currentTotalBoughtQty || !currentTotalBoughtAmount ? (
                <span>
                  <b>{t('gridCalculator.resultLabel')}</b>
                  {t('gridCalculator.resultSetAmountFirst')}
                </span>
              ) : currentBuyTrigger >= 1 ? (
                <span>
                  <b>{t('gridCalculator.resultLabel')}</b>
                  {t('gridCalculator.resultPriceGoDown')}
                </span>
              ) : breakevenAmount > 0 ? (
                <span>
                  <b>{t('gridCalculator.resultLabel')}</b>
                  {t('gridCalculator.resultBreakeven', {
                    triggerPercent:
                      ((currentBuyTrigger - 1) * 100).toFixed(2) + '%',
                    amount:
                      currentSellTrigger === 1
                        ? ' - '
                        : breakevenAmount.toFixed(precision),
                    quoteAsset,
                    reboundPercent:
                      ((currentSellTrigger - 1) * 100).toFixed(2) + '%'
                  })}
                </span>
              ) : currentSellTrigger > 1 ? (
                <span>
                  <b>{t('gridCalculator.resultLabel')}</b>
                  {t('gridCalculator.resultPointlessTrigger', {
                    triggerPercent:
                      ((currentBuyTrigger - 1) * 100).toFixed(2) + '%',
                    reboundPercent:
                      ((currentSellTrigger - 1) * 100).toFixed(2) + '%',
                    lastBuyPrice: lastBuyPrice.toFixed(precision)
                  })}
                </span>
              ) : (
                <span>
                  <b>{t('gridCalculator.resultLabel')}</b>
                  {t('gridCalculator.resultNoRebound')}
                </span>
              )}
              <img
                src='./img/calculator-diagram.png'
                className='px-4 pt-2'
                width='100%'
                alt='Grid calculator'
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='secondary'
              size='sm'
              onClick={this.handleModalClose}>
              {t('common.close')}
            </Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  }
}
