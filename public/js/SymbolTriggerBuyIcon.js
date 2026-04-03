/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SymbolTriggerBuyIcon extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };

    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);

    this.handleDelete = this.handleDelete.bind(this);
  }

  handleModalShow() {
    this.setState({
      showModal: true
    });
  }

  handleModalClose() {
    this.setState({
      showModal: false
    });
  }

  handleDelete(e) {
    e.preventDefault();
    const { symbol } = this.props;
    this.props.sendWebSocket('symbol-trigger-buy', {
      symbol
    });

    this.handleModalClose();
  }

  render() {
    const { symbol, className, isAuthenticated } = this.props;

    if (isAuthenticated === false) {
      return '';
    }

    return (
      <span
        className={
          'header-column-icon-wrapper symbol-trigger-buy-wrapper ' + className
        }>
        <button
          type='button'
          className='btn btn-sm btn-trigger-grid-trade mr-1 btn-manual-buy'
          onClick={this.handleModalShow}>
          <i className='fas fa-bolt'></i> {t('symbolTriggerBuy.trigger')}
        </button>

        <Modal show={this.state.showModal} onHide={this.handleModalClose}>
          <Modal.Header className='pt-1 pb-1'>
            <Modal.Title>
              {t('symbolTriggerBuy.title')} - {symbol}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>{t('symbolTriggerBuy.confirmation')}</Modal.Body>
          <Modal.Footer>
            <Button
              variant='secondary'
              size='sm'
              onClick={this.handleModalClose}>
              {t('common.close')}
            </Button>
            <Button
              type='button'
              variant='success'
              size='sm'
              className='btn-manual-buy'
              onClick={this.handleDelete}>
              {t('symbolTriggerBuy.trigger')}
            </Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  }
}
