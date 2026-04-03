/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SettingIconBotOptionsOrderLimit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      botOptions: {}
    };
  }

  componentDidUpdate(nextProps) {
    // Only update configuration, when the modal is closed and different.
    if (
      _.isEmpty(nextProps.botOptions) === false &&
      _.isEqual(nextProps.botOptions, this.state.botOptions) === false
    ) {
      const { botOptions } = nextProps;

      this.setState({
        botOptions
      });
    }
  }

  render() {
    const { botOptions } = this.state;

    if (_.isEmpty(botOptions)) {
      return '';
    }

    return (
      <Accordion defaultActiveKey='0'>
        <Card className='mt-1'>
          <Card.Header className='px-2 py-1'>
            <Accordion.Toggle
              as={Button}
              variant='link'
              eventKey='0'
              className='p-0 fs-7 text-uppercase'>
              {t('settings.orderLimit')}
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey='0'>
            <Card.Body className='px-2 py-1'>
              <div className='row'>
                <div className='col-12'>
                  <Form.Group
                    controlId='field-bot-options-order-limit-enabled'
                    className='mb-2'>
                    <Form.Check size='sm'>
                      <Form.Check.Input
                        type='checkbox'
                        data-state-key='orderLimit.enabled'
                        checked={botOptions.orderLimit.enabled}
                        onChange={this.props.handleInputChange}
                      />
                      <Form.Check.Label>
                        {t('common.enabled')}{' '}
                        <OverlayTrigger
                          trigger='click'
                          key='bot-options-order-limit-enabled-overlay'
                          placement='bottom'
                          overlay={
                            <Popover id='bot-options-order-limit-enabled-overlay-right'>
                              <Popover.Content>
                                {t('settings.orderLimitEnabledTooltip')}
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
                  <div className='row'>
                    <div className='col-12 col-sm-6'>
                      <Form.Group
                        controlId='field-bot-options-order-limit-max-buy-open-orders'
                        className='mb-2'>
                        <Form.Label className='mb-0'>
                          {t('settings.maxBuyOpenOrders')}
                          <OverlayTrigger
                            trigger='click'
                            key='max-buy-open-orders-overlay'
                            placement='bottom'
                            overlay={
                              <Popover id='max-buy-open-orders-overlay-right'>
                                <Popover.Content>
                                  {t('settings.maxBuyOpenOrdersTooltip')}
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
                            'settings.placeholderMaxBuyOpenOrders'
                          )}
                          required
                          min='1'
                          step='1'
                          data-state-key='orderLimit.maxBuyOpenOrders'
                          value={botOptions.orderLimit.maxBuyOpenOrders}
                          onChange={this.props.handleInputChange}
                        />
                      </Form.Group>
                    </div>
                    <div className='col-12 col-sm-6'>
                      <Form.Group
                        controlId='field-bot-options-order-limit-max-open-trades'
                        className='mb-2'>
                        <Form.Label className='mb-0'>
                          {t('settings.maxOpenTrades')}
                          <OverlayTrigger
                            trigger='click'
                            key='max-open-trades-overlay'
                            placement='bottom'
                            overlay={
                              <Popover id='max-open-trades-overlay-right'>
                                <Popover.Content>
                                  {t('settings.maxOpenTradesTooltip')}
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
                          placeholder={t('settings.placeholderMaxOpenTrades')}
                          required
                          min='1'
                          step='1'
                          data-state-key='orderLimit.maxOpenTrades'
                          value={botOptions.orderLimit.maxOpenTrades}
                          onChange={this.props.handleInputChange}
                        />
                      </Form.Group>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    );
  }
}
