/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SymbolSettingActionResetToGlobalSetting extends React.Component {
  constructor(props) {
    super(props);

    this.resetToGlobalConfiguration =
      this.resetToGlobalConfiguration.bind(this);
  }

  resetToGlobalConfiguration() {
    const { symbolInfo } = this.props;

    this.props.handleModalClose('resetGlobalSetting');

    this.props.sendWebSocket('symbol-setting-delete', symbolInfo);
  }

  render() {
    return (
      <Modal
        show={this.props.showResetToGlobalSettingModal}
        onHide={() => this.props.handleModalClose('resetGlobalSetting')}
        size='md'>
        <Modal.Header className='pt-1 pb-1'>
          <Modal.Title>
            <span className='text-danger'>
              {t('symbolSettings.resetToGlobalTitle')}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('symbolSettings.resetToGlobalBody')}
          <br />
          <br />
          {t('symbolSettings.resetToGlobalConfirm')}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant='secondary'
            size='sm'
            onClick={() => this.props.handleModalClose('resetGlobalSetting')}>
            {t('common.cancel')}
          </Button>
          <Button
            variant='success'
            size='sm'
            onClick={() => this.resetToGlobalConfiguration()}>
            {t('common.yes')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
