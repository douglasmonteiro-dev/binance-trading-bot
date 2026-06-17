/* eslint-disable global-require */

describe('symbol-setting-delete.test.js', () => {
  let mockWebSocketServer;
  let mockWebSocketServerWebSocketSend;

  let mockLogger;

  let mockDeleteSymbolConfiguration;

  let mockExecute;

  beforeEach(() => {
    jest.clearAllMocks().resetModules();

    mockWebSocketServerWebSocketSend = jest.fn().mockResolvedValue(true);

    mockWebSocketServer = {
      send: mockWebSocketServerWebSocketSend
    };

    mockExecute = jest.fn((funcLogger, symbol, jobPayload) => {
      if (!funcLogger || !symbol || !jobPayload) return false;
      return jobPayload.preprocessFn();
    });

    jest.mock('../../../../cronjob/trailingTradeHelper/queue', () => ({
      execute: mockExecute
    }));
  });

  describe('when symbol is provided', () => {
    beforeEach(async () => {
      const { logger } = require('../../../../helpers');
      mockLogger = logger;
      mockLogger.fields = { correlationId: 'correlationId' };

      mockDeleteSymbolConfiguration = jest.fn().mockResolvedValue(true);

      jest.mock(
        '../../../../cronjob/trailingTradeHelper/configuration',
        () => ({
          deleteSymbolConfiguration: mockDeleteSymbolConfiguration
        })
      );

      const { handleSymbolSettingDelete } = require('../symbol-setting-delete');
      await handleSymbolSettingDelete(logger, mockWebSocketServer, {
        data: {
          symbol: 'BTCUSDT',
          tenantId: 'tenant-123',
          userId: 'user-123',
          botId: 'bot-123',
          exchangeAccountId: 'exchange-account-123',
          idempotencyKey: 'idem-123'
        }
      });
    });

    it('triggers deleteSymbolConfiguration', () => {
      expect(mockDeleteSymbolConfiguration).toHaveBeenCalledWith(
        mockLogger,
        'BTCUSDT'
      );
    });

    it('triggers queue.execute', () => {
      expect(mockExecute).toHaveBeenCalledWith(mockLogger, 'BTCUSDT', {
        correlationId: 'correlationId',
        requestContext: {
          tenantId: 'tenant-123',
          userId: 'user-123',
          botId: 'bot-123',
          exchangeAccountId: 'exchange-account-123',
          correlationId: 'correlationId',
          idempotencyKey: 'idem-123'
        },
        preprocessFn: expect.any(Function),
        processFn: expect.any(Function)
      });
    });

    it('triggers ws.send', () => {
      expect(mockWebSocketServerWebSocketSend).toHaveBeenCalledWith(
        JSON.stringify({
          result: true,
          type: 'symbol-setting-delete-result'
        })
      );
    });
  });
});
