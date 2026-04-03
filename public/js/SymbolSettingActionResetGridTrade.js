/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SymbolSettingActionResetGridTrade extends React.Component {
  constructor(props) {
    super(props);

    this.resetGridTrade = this.resetGridTrade.bind(this);
  }

  resetGridTrade(action) {
    const { symbolInfo } = this.props;

    this.props.handleModalClose('resetGridTrade');
    this.props.sendWebSocket('symbol-grid-trade-delete', {
      action,
      symbol: symbolInfo.symbol
    });
  }

  render() {
    return (
      <Modal
        show={this.props.showResetGridTradeModal}
        onHide={() => this.props.handleModalClose('resetGridTrade')}
        size='md'>
        <Modal.Header className='pt-1 pb-1'>
          <Modal.Title>
            <span className='text-danger'>
              {t('symbolSettings.resetGridTradeTitle')}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('symbolSettings.resetGridTradeBody')}
          <br />
          <br />
          {t('symbolSettings.resetGridTradeConfirm')}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant='secondary'
            size='sm'
            onClick={() => this.props.handleModalClose('resetGridTrade')}>
            {t('common.cancel')}
          </Button>
          <Button
            variant='info'
            size='sm'
            onClick={() => this.resetGridTrade('archive')}>
            {t('symbolSettings.archiveAndDelete')}
          </Button>
          <Button
            variant='danger'
            size='sm'
            onClick={() => this.resetGridTrade('delete')}>
            {t('symbolSettings.deleteWithoutArchive')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
