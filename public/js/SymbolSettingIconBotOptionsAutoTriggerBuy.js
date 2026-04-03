/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SymbolSettingIconBotOptionsAutoTriggerBuy extends React.Component {
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
              {t('settings.autoTriggerBuy')}
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey='0'>
            <Card.Body className='px-2 py-1'>
              <div className='row'>
                <div className='col-12'>
                  <Form.Group
                    controlId='field-bot-options-auto-trigger-buy-enabled'
                    className='mb-2'>
                    <Form.Check size='sm'>
                      <Form.Check.Input
                        type='checkbox'
                        data-state-key='autoTriggerBuy.enabled'
                        checked={botOptions.autoTriggerBuy.enabled}
                        onChange={this.props.handleInputChange}
                      />
                      <Form.Check.Label>
                        {t('common.enabled')}{' '}
                        <OverlayTrigger
                          trigger='click'
                          key='bot-options-auto-trigger-buy-enabled-overlay'
                          placement='bottom'
                          overlay={
                            <Popover id='bot-options-auto-trigger-buy-enabled-overlay-right'>
                              <Popover.Content>
                                {t('settings.autoTriggerBuyTooltip')}
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
                    <div className='col-6'>
                      <Form.Group
                        controlId='field-bot-options-auto-trigger-buy-trigger-after'
                        className='mb-2'>
                        <Form.Label className='mb-0'>
                          {t('settings.triggerAfter')}
                          <OverlayTrigger
                            trigger='click'
                            key='limit-overlay'
                            placement='bottom'
                            overlay={
                              <Popover id='limit-overlay-right'>
                                <Popover.Content>
                                  {t('settings.triggerAfterTooltip')}
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
                          placeholder={t('settings.placeholderEnterMinutes')}
                          required
                          min='0.1'
                          step='0.1'
                          data-state-key='autoTriggerBuy.triggerAfter'
                          value={botOptions.autoTriggerBuy.triggerAfter}
                          onChange={this.props.handleInputChange}
                        />
                      </Form.Group>
                    </div>
                    <div className='col-12'>
                      <strong>{t('settings.conditions')}</strong>
                    </div>
                    <div className='col-6'>
                      <Form.Group
                        controlId='field-bot-options-auto-trigger-buy-condition-when-less-than-ath-restriction'
                        className='mb-2'>
                        <Form.Check size='sm'>
                          <Form.Check.Input
                            type='checkbox'
                            data-state-key='autoTriggerBuy.conditions.whenLessThanATHRestriction'
                            checked={
                              botOptions.autoTriggerBuy.conditions
                                .whenLessThanATHRestriction
                            }
                            onChange={this.props.handleInputChange}
                          />
                          <Form.Check.Label>
                            {t('settings.rescheduleATH')}{' '}
                            <OverlayTrigger
                              trigger='click'
                              key='bot-options-auto-trigger-buy-conditions-when-less-than-ath-restriction-overlay'
                              placement='bottom'
                              overlay={
                                <Popover id='bot-options-auto-trigger-buy-conditions-when-less-than-ath-restriction-overlay-right'>
                                  <Popover.Content>
                                    {t('settings.rescheduleATHTooltip')}
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
                    <div className='col-6'>
                      <Form.Group
                        controlId='field-bot-options-auto-trigger-buy-condition-after-disabled-period'
                        className='mb-2'>
                        <Form.Check size='sm'>
                          <Form.Check.Input
                            type='checkbox'
                            data-state-key='autoTriggerBuy.conditions.afterDisabledPeriod'
                            checked={
                              botOptions.autoTriggerBuy.conditions
                                .afterDisabledPeriod
                            }
                            onChange={this.props.handleInputChange}
                          />
                          <Form.Check.Label>
                            {t('settings.rescheduleDisabled')}{' '}
                            <OverlayTrigger
                              trigger='click'
                              key='bot-options-auto-trigger-buy-conditions-after-disabled-period-overlay'
                              placement='bottom'
                              overlay={
                                <Popover id='bot-options-auto-trigger-buy-conditions-after-disabled-period-overlay-right'>
                                  <Popover.Content>
                                    {t('settings.rescheduleDisabledTooltip')}
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
