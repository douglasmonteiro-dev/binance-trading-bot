/* eslint-disable global-require */

describe('symbol-enable-action.test.js', () => {
  let mockWebSocketServer;
  let mockWebSocketServerWebSocketSend;

  let mockLogger;

  let mockExecute;

  let mockDeleteDisableAction;

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

      mockDeleteDisableAction = jest.fn().mockResolvedValue(true);

      jest.mock('../../../../cronjob/trailingTradeHelper/common', () => ({
        deleteDisableAction: mockDeleteDisableAction
      }));

      const { handleSymbolEnableAction } = require('../symbol-enable-action');
      await handleSymbolEnableAction(logger, mockWebSocketServer, {
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

    it('triggers deleteDisableAction', () => {
      expect(mockDeleteDisableAction).toHaveBeenCalledWith(
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
          type: 'symbol-enable-action-result'
        })
      );
    });
  });
});
