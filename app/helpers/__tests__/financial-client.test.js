/* eslint-disable global-require */
jest.mock('axios');
jest.mock('config');
jest.mock('../logger', () => ({
  warn: jest.fn(),
  error: jest.fn()
}));
jest.mock('uuid', () => ({
  v4: jest.fn()
}));
jest.mock('../binance', () => ({
  client: {
    order: jest.fn(),
    cancelOrder: jest.fn(),
    accountInfo: jest.fn(),
    openOrders: jest.fn()
  }
}));

describe('financial-client', () => {
  let axios;
  let config;
  let financialClient;
  let binance;
  let logger;
  let uuidv4;

  beforeEach(() => {
    jest.clearAllMocks().resetModules();

    axios = require('axios');
    config = require('config');
    binance = require('../binance');
    logger = require('../logger');
    uuidv4 = require('uuid').v4;

    uuidv4
      .mockReturnValueOnce('uuid-1')
      .mockReturnValueOnce('uuid-2')
      .mockReturnValueOnce('uuid-3')
      .mockReturnValueOnce('uuid-4')
      .mockReturnValueOnce('uuid-5')
      .mockReturnValueOnce('uuid-6');

    config.get = jest.fn(key => {
      switch (key) {
        case 'financial.provider':
          return 'local';
        case 'financial.core.url':
          return 'https://financial-core.example.com';
        case 'financial.core.apiKey':
          return 'secret-token';
        case 'financial.core.timeout':
          return 4321;
        case 'financial.core.maxRetries':
          return 2;
        case 'financial.core.retryDelay':
          return 0;
        default:
          return '';
      }
    });

    axios.mockResolvedValue({ data: { ok: true } });
    binance.client.order.mockResolvedValue({ source: 'binance-order' });
    binance.client.cancelOrder.mockResolvedValue({ source: 'binance-cancel' });
    binance.client.accountInfo.mockResolvedValue({ source: 'binance-account' });
    binance.client.openOrders.mockResolvedValue([
      { source: 'binance-open-orders' }
    ]);

    financialClient = require('../financial-client');
  });

  describe('when provider is local', () => {
    it('places order via binance client', async () => {
      const result = await financialClient.placeOrder(
        { symbol: 'BTCUSDT' },
        { botId: 'bot-1', exchangeAccountId: 'acc-1' }
      );

      expect(binance.client.order).toHaveBeenCalledWith({ symbol: 'BTCUSDT' });
      expect(axios).not.toHaveBeenCalled();
      expect(result).toStrictEqual({ source: 'binance-order' });
    });

    it('cancels order via binance client', async () => {
      const result = await financialClient.cancelOrder({ orderId: 1 });

      expect(binance.client.cancelOrder).toHaveBeenCalledWith({ orderId: 1 });
      expect(result).toStrictEqual({ source: 'binance-cancel' });
    });

    it('gets account info via binance client', async () => {
      const result = await financialClient.getAccountInfo();

      expect(binance.client.accountInfo).toHaveBeenCalled();
      expect(result).toStrictEqual({ source: 'binance-account' });
    });

    it('gets open orders via binance client', async () => {
      const result = await financialClient.getOpenOrders({ symbol: 'BTCUSDT' });

      expect(binance.client.openOrders).toHaveBeenCalledWith({
        symbol: 'BTCUSDT'
      });
      expect(result).toStrictEqual([{ source: 'binance-open-orders' }]);
    });
  });

  describe('when provider is financial-core', () => {
    beforeEach(() => {
      axios.mockResolvedValue({ data: { ok: true } });

      config.get = jest.fn(key => {
        switch (key) {
          case 'financial.provider':
            return 'financial-core';
          case 'financial.core.url':
            return 'https://financial-core.example.com';
          case 'financial.core.apiKey':
            return 'secret-token';
          case 'financial.core.timeout':
            return 4321;
          case 'financial.core.maxRetries':
            return 2;
          case 'financial.core.retryDelay':
            return 0;
          default:
            return '';
        }
      });

      financialClient = require('../financial-client');
    });

    it('places order via financial core', async () => {
      const result = await financialClient.placeOrder(
        { symbol: 'BTCUSDT' },
        {
          tenantId: 'tenant-1',
          userId: 'user-1',
          botId: 'bot-1',
          exchangeAccountId: 'acc-1',
          correlationId: 'corr-1',
          idempotencyKey: 'idem-1'
        }
      );

      expect(axios).toHaveBeenCalledWith({
        metadata: {
          correlationId: 'corr-1',
          idempotencyKey: 'idem-1'
        },
        method: 'post',
        url: 'https://financial-core.example.com/internal/financial/orders',
        timeout: 4321,
        headers: {
          'x-bot-source': 'binance-trading-bot',
          Authorization: 'Bearer secret-token',
          'x-tenant-id': 'tenant-1',
          'x-user-id': 'user-1',
          'x-bot-id': 'bot-1',
          'x-exchange-account-id': 'acc-1',
          'x-correlation-id': 'corr-1',
          'x-idempotency-key': 'idem-1'
        },
        data: { symbol: 'BTCUSDT' }
      });
      expect(binance.client.order).not.toHaveBeenCalled();
      expect(result).toStrictEqual({ ok: true });
    });

    it('cancels order via financial core', async () => {
      await financialClient.cancelOrder(
        { orderId: 7, symbol: 'BTCUSDT' },
        { exchangeAccountId: 'acc-1' }
      );

      expect(axios).toHaveBeenCalledWith({
        metadata: {
          correlationId: 'uuid-1',
          idempotencyKey: 'uuid-2'
        },
        method: 'post',
        url: 'https://financial-core.example.com/internal/financial/orders/cancel',
        timeout: 4321,
        headers: {
          'x-bot-source': 'binance-trading-bot',
          Authorization: 'Bearer secret-token',
          'x-exchange-account-id': 'acc-1',
          'x-correlation-id': 'uuid-1',
          'x-idempotency-key': 'uuid-2'
        },
        data: { orderId: 7, symbol: 'BTCUSDT' }
      });
    });

    it('gets account info via financial core', async () => {
      await financialClient.getAccountInfo({ exchangeAccountId: 'acc-1' });

      expect(axios).toHaveBeenCalledWith({
        metadata: {
          correlationId: 'uuid-1'
        },
        method: 'get',
        url: 'https://financial-core.example.com/internal/financial/account',
        timeout: 4321,
        headers: {
          'x-bot-source': 'binance-trading-bot',
          Authorization: 'Bearer secret-token',
          'x-correlation-id': 'uuid-1'
        },
        params: { exchangeAccountId: 'acc-1' }
      });
    });

    it('gets open orders via financial core', async () => {
      await financialClient.getOpenOrders({ symbol: 'BTCUSDT' });

      expect(axios).toHaveBeenCalledWith({
        metadata: {
          correlationId: 'uuid-1'
        },
        method: 'get',
        url: 'https://financial-core.example.com/internal/financial/orders/open',
        timeout: 4321,
        headers: {
          'x-bot-source': 'binance-trading-bot',
          Authorization: 'Bearer secret-token',
          'x-correlation-id': 'uuid-1'
        },
        params: { symbol: 'BTCUSDT' }
      });
    });

    it('generates correlation and idempotency metadata for write requests', async () => {
      await financialClient.placeOrder(
        { symbol: 'BTCUSDT' },
        { exchangeAccountId: 'acc-1' }
      );

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            correlationId: 'uuid-1',
            idempotencyKey: 'uuid-2'
          },
          headers: expect.objectContaining({
            'x-correlation-id': 'uuid-1',
            'x-idempotency-key': 'uuid-2'
          })
        })
      );
    });

    it('rejects write requests without exchange account context', async () => {
      await expect(
        financialClient.placeOrder({ symbol: 'BTCUSDT' })
      ).rejects.toMatchObject({
        name: 'FinancialContextError',
        path: '/internal/financial/orders',
        method: 'post',
        context: {}
      });

      expect(axios).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('retries transient read requests to financial core', async () => {
      axios
        .mockRejectedValueOnce({
          code: 'ECONNABORTED'
        })
        .mockResolvedValueOnce({
          data: [{ orderId: 1 }]
        });

      const result = await financialClient.getOpenOrders({ symbol: 'BTCUSDT' });

      expect(axios).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          tag: 'financial-core-request-retry',
          path: '/internal/financial/orders/open',
          method: 'get',
          retryAttempt: 1,
          maxRetries: 2,
          code: 'ECONNABORTED',
          retriable: true
        }),
        'Retrying Financial Core request.'
      );
      expect(result).toStrictEqual([{ orderId: 1 }]);
    });

    it('does not retry write requests to financial core', async () => {
      axios.mockRejectedValue({
        response: {
          status: 503,
          data: { message: 'temporary outage' }
        }
      });

      await expect(
        financialClient.placeOrder(
          { symbol: 'BTCUSDT' },
          { exchangeAccountId: 'acc-1' }
        )
      ).rejects.toMatchObject({
        name: 'FinancialCoreRequestError',
        status: 503,
        data: { message: 'temporary outage' },
        path: '/internal/financial/orders',
        method: 'post',
        retriable: true
      });

      expect(axios).toHaveBeenCalledTimes(1);
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          tag: 'financial-core-request-failed',
          path: '/internal/financial/orders',
          method: 'post',
          status: 503,
          retriable: true,
          data: { message: 'temporary outage' }
        }),
        'Financial Core request failed.'
      );
    });
  });
});
